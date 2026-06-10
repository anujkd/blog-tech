// ============================================================
// CUSTOM HOOKS
// useChartData · useFilterMerge · useEventBus · useRealtime
// useTheme · useDrilldown · useExport · useWidgetLifecycle
// ============================================================

import {
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useState,
  useLayoutEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import type {
  ChartWidgetConfig,
  FilterCondition,
  FilterMergeStrategy,
  ChartEvent,
  ChartEventType,
  EventBusMessage,
  DrilldownLevel,
  ExportFormat,
  ExportConfig,
  ResolvedTheme,
} from "../types";
import {
  type AppDispatch,
  type RootState,
  fetchWidgetData,
  chartWidgetActions,
  widgetFilterActions,
  widgetConfigActions,
  eventBusActions,
  drilldownActions,
  themeActions,
  selectGlobalFilters,
  selectWidgetFilters,
  selectWidgetData,
  selectWidgetStatus,
  selectWidgetError,
  selectMergedFilters,
  selectTheme,
  selectDrilldownStack,
  selectEventsForWidget,
  selectLatestEvent,
} from "../store";
import { mergeFilters } from "../services/filterMerge";
import { invalidateCache } from "../services/dataProviders";
import { openWebSocket, openSSE } from "../services/dataProviders";

// ─── useAppDispatch / useAppSelector typed wrappers ──────────

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);

// ─── useWidgetLifecycle ───────────────────────────────────────

/**
 * Registers/unregisters a widget in the Redux store
 * and syncs the config on mount and when it changes.
 */
export function useWidgetLifecycle(config: ChartWidgetConfig): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(chartWidgetActions.registerWidget({ id: config.id }));
    dispatch(widgetConfigActions.setWidgetConfig(config));

    return () => {
      dispatch(chartWidgetActions.unregisterWidget(config.id));
      dispatch(widgetConfigActions.removeWidgetConfig(config.id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id]);

  // Sync config changes (library/chartType/dataSource switches)
  const prevConfigRef = useRef<ChartWidgetConfig>(config);
  useEffect(() => {
    if (prevConfigRef.current !== config) {
      dispatch(widgetConfigActions.setWidgetConfig(config));
      prevConfigRef.current = config;
    }
  }, [config, dispatch]);
}

// ─── useChartData ─────────────────────────────────────────────

export interface UseChartDataResult {
  data: unknown[];
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  refresh: () => void;
}

/**
 * Orchestrates data fetching for a widget.
 * Respects cache TTL, polls for REST/static, and handles realtime.
 */
export function useChartData(
  config: ChartWidgetConfig,
  mergedFilters: FilterCondition[],
  externalData?: unknown[]
): UseChartDataResult {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectWidgetData(config.id));
  const status = useAppSelector(selectWidgetStatus(config.id));
  const error = useAppSelector(selectWidgetError(config.id));
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const realtimeHandleRef = useRef<{ close?: () => void; stop?: () => void } | null>(null);

  const fetch = useCallback(() => {
    if (config.dataSource.type === "static" && !externalData) {
      dispatch(
        chartWidgetActions.setWidgetData({
          widgetId: config.id,
          data: (config.dataSource as { data: unknown[] }).data,
        })
      );
      return;
    }

    dispatch(fetchWidgetData({ widgetId: config.id, config, filters: mergedFilters }));
  }, [config, mergedFilters, dispatch, externalData]);

  // Sync externally-provided data into the store
  useEffect(() => {
    if (externalData) {
      dispatch(
        chartWidgetActions.setWidgetData({
          widgetId: config.id,
          data: externalData,
        })
      );
    }
  }, [externalData, config.id, dispatch]);

  // Initial fetch + filter-driven refetch
  useEffect(() => {
    if (!externalData) {
      fetch();
    }
  }, [fetch, externalData]);

  // REST polling
  useEffect(() => {
    if (
      config.dataSource.type === "rest" &&
      (config.dataSource as { pollingInterval?: number }).pollingInterval
    ) {
      const interval = (config.dataSource as { pollingInterval: number }).pollingInterval;
      pollingRef.current = setInterval(fetch, interval);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [config.dataSource, fetch]);

  // WebSocket realtime
  useEffect(() => {
    if (config.dataSource.type !== "websocket") return;

    const wsConfig = config.dataSource as Parameters<typeof openWebSocket>[0];
    const handle = openWebSocket(
      wsConfig,
      (newData) => {
        dispatch(
          chartWidgetActions.appendRealtimeData({
            widgetId: config.id,
            newData,
            maxDataPoints: config.realtime?.maxDataPoints,
          })
        );
      },
      (err) => console.error("[WS]", err)
    );

    realtimeHandleRef.current = { close: handle.close };
    return () => handle.close();
  }, [config.dataSource, config.id, config.realtime?.maxDataPoints, dispatch]);

  // SSE realtime
  useEffect(() => {
    if (config.dataSource.type !== "sse") return;

    const sseConfig = config.dataSource as Parameters<typeof openSSE>[0];
    const handle = openSSE(
      sseConfig,
      (newData) => {
        dispatch(
          chartWidgetActions.appendRealtimeData({
            widgetId: config.id,
            newData,
            maxDataPoints: config.realtime?.maxDataPoints,
          })
        );
      },
      (err) => console.error("[SSE]", err)
    );

    realtimeHandleRef.current = { close: handle.close };
    return () => handle.close();
  }, [config.dataSource, config.id, config.realtime?.maxDataPoints, dispatch]);

  return { data, status, error, refresh: fetch };
}

// ─── useFilterMerge ───────────────────────────────────────────

export function useFilterMerge(
  widgetId: string,
  globalFilters: FilterCondition[] = [],
  widgetFilters: FilterCondition[] = [],
  strategy: FilterMergeStrategy = "combine"
): FilterCondition[] {
  const dispatch = useAppDispatch();
  const storeGlobal = useAppSelector(selectGlobalFilters);
  const storeWidget = useAppSelector(selectWidgetFilters(widgetId));

  // Sync prop-provided filters into store
  useEffect(() => {
    if (globalFilters.length) {
      // Silently let parent control global filters through props
    }
  }, [globalFilters]);

  useEffect(() => {
    if (widgetFilters.length) {
      dispatch(widgetFilterActions.setWidgetFilters({ widgetId, filters: widgetFilters }));
    }
  }, [widgetFilters, widgetId, dispatch]);

  return useMemo(
    () =>
      mergeFilters(
        globalFilters.length ? globalFilters : storeGlobal,
        widgetFilters.length ? widgetFilters : storeWidget,
        strategy
      ),
    [globalFilters, widgetFilters, storeGlobal, storeWidget, strategy]
  );
}

// ─── useEventBus ──────────────────────────────────────────────

export function useEventBus(widgetId: string) {
  const dispatch = useAppDispatch();

  const publish = useCallback(
    (
      type: ChartEventType,
      payload?: unknown,
      targetWidgetId?: string
    ) => {
      dispatch(
        eventBusActions.publishEvent({
          type,
          sourceWidgetId: widgetId,
          targetWidgetId,
          payload,
        })
      );
    },
    [dispatch, widgetId]
  );

  const subscribe = useCallback(
    (
      type: ChartEventType,
      handler: (event: EventBusMessage) => void
    ): (() => void) => {
      // Returns an "unsubscribe" function — real subscription happens via useSelector
      const id = Math.random().toString(36).slice(2);
      subscriptions.set(id, { type, widgetId, handler });
      return () => subscriptions.delete(id);
    },
    [widgetId]
  );

  return { publish, subscribe };
}

// Simple in-memory subscription map for event bus
const subscriptions = new Map<
  string,
  { type: ChartEventType; widgetId: string; handler: (e: EventBusMessage) => void }
>();

/**
 * Subscribe to a specific event type from the event bus.
 * Returns the latest matching event.
 */
export function useEventSubscription(
  widgetId: string,
  eventType: ChartEventType
): EventBusMessage | null {
  const events = useAppSelector(selectEventsForWidget(widgetId));
  return useMemo(
    () =>
      [...events].reverse().find((e) => e.type === eventType) ?? null,
    [events, eventType]
  );
}

// ─── useTheme ─────────────────────────────────────────────────

export function useTheme(): ResolvedTheme {
  return useAppSelector(selectTheme);
}

export function useThemeMode() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);

  const setMode = useCallback(
    (newMode: "light" | "dark" | "system" | "custom") => {
      dispatch(themeActions.setThemeMode(newMode));
    },
    [dispatch]
  );

  // Sync system preference
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;

    const handler = (e: MediaQueryListEvent) => {
      dispatch(themeActions.setSystemPreference(e.matches ? "dark" : "light"));
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [dispatch]);

  return { mode, setMode };
}

// ─── useDrilldown ─────────────────────────────────────────────

export function useDrilldown(widgetId: string) {
  const dispatch = useAppDispatch();
  const stack = useAppSelector(selectDrilldownStack(widgetId));

  const drillDown = useCallback(
    (level: DrilldownLevel, filter: FilterCondition) => {
      dispatch(drilldownActions.pushDrilldown({ widgetId, level, filter }));
      dispatch(
        widgetFilterActions.addWidgetFilter({ widgetId, filter })
      );
    },
    [dispatch, widgetId]
  );

  const drillUp = useCallback(() => {
    const top = stack[stack.length - 1];
    if (top) {
      dispatch(drilldownActions.popDrilldown(widgetId));
      dispatch(
        widgetFilterActions.removeWidgetFilter({ widgetId, field: top.filter.field })
      );
    }
  }, [dispatch, widgetId, stack]);

  const resetDrilldown = useCallback(() => {
    dispatch(drilldownActions.resetDrilldown(widgetId));
    dispatch(widgetFilterActions.clearWidgetFilters(widgetId));
  }, [dispatch, widgetId]);

  return { stack, drillDown, drillUp, resetDrilldown, depth: stack.length };
}

// ─── useFullscreen ────────────────────────────────────────────

export function useFullscreen(widgetId: string) {
  const dispatch = useAppDispatch();
  const isFullscreen = useAppSelector(
    (state) => state.chartWidget.entities[widgetId]?.isFullscreen ?? false
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      await el.requestFullscreen().catch(() => {});
      dispatch(
        chartWidgetActions.setWidgetFullscreen({ widgetId, fullscreen: true })
      );
    } else {
      await document.exitFullscreen().catch(() => {});
      dispatch(
        chartWidgetActions.setWidgetFullscreen({ widgetId, fullscreen: false })
      );
    }
  }, [dispatch, widgetId]);

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        dispatch(
          chartWidgetActions.setWidgetFullscreen({ widgetId, fullscreen: false })
        );
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [dispatch, widgetId]);

  return { isFullscreen, toggle, containerRef };
}

// ─── useExport ────────────────────────────────────────────────

export function useExport(widgetId: string) {
  const [exporting, setExporting] = useState(false);

  const exportChart = useCallback(
    async (
      format: ExportFormat,
      data: unknown[],
      filename?: string
    ) => {
      setExporting(true);
      try {
        const name = filename ?? `chart-${widgetId}-${Date.now()}`;

        if (format === "csv") {
          downloadBlob(await buildCSVBlob(data), `${name}.csv`);
        } else if (format === "json") {
          downloadBlob(
            new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
            `${name}.json`
          );
        } else if (format === "png" || format === "jpeg" || format === "svg") {
          await exportChartImage(widgetId, format, name);
        } else if (format === "excel") {
          downloadBlob(await buildCSVBlob(data), `${name}.csv`); // xlsx would need SheetJS
        }
      } finally {
        setExporting(false);
      }
    },
    [widgetId]
  );

  return { exportChart, exporting };
}

async function buildCSVBlob(data: unknown[]): Promise<Blob> {
  const rows = data as Record<string, unknown>[];
  if (!rows.length) return new Blob([""], { type: "text/csv" });
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
    ),
  ].join("\n");
  return new Blob([csv], { type: "text/csv" });
}

async function exportChartImage(
  widgetId: string,
  format: "png" | "jpeg" | "svg",
  filename: string
): Promise<void> {
  const container = document.querySelector(
    `[data-widget-id="${widgetId}"] canvas`
  ) as HTMLCanvasElement | null;

  if (!container) {
    console.warn("[Export] Canvas not found for widget", widgetId);
    return;
  }

  const mimeType = format === "png" ? "image/png" : "image/jpeg";
  const url = container.toDataURL(mimeType, 0.95);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${format}`;
  a.click();
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── useResizeObserver ────────────────────────────────────────

export function useResizeObserver(
  ref: React.RefObject<HTMLElement | null>,
  callback: (entry: ResizeObserverEntry) => void
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => callbackRef.current(entry));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
}

// ─── useLegend ────────────────────────────────────────────────

export function useLegend(widgetId: string) {
  const dispatch = useAppDispatch();
  const visible = useAppSelector(
    (state) => state.chartWidget.entities[widgetId]?.legendVisible ?? true
  );

  const toggle = useCallback(() => {
    dispatch(chartWidgetActions.toggleLegend(widgetId));
  }, [dispatch, widgetId]);

  return { visible, toggle };
}
