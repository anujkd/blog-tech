// ============================================================
// CHART WIDGET — Top-level rendering engine
// Parent controls everything. Zero business logic inside.
// ============================================================

import React, {
  memo,
  useRef,
  useCallback,
  useMemo,
  Suspense,
  lazy,
  useState,
  useEffect,
} from "react";
import type { ChartWidgetProps, ChartEvent, ChartRenderConfig, ChartAdapter } from "../../types";
import {
  useWidgetLifecycle,
  useChartData,
  useFilterMerge,
  useEventBus,
  useTheme,
  useDrilldown,
  useFullscreen,
  useExport,
  useLegend,
} from "../../hooks";
import { runTransformationPipeline } from "../../services/transformations";
import { ChartAdapterRegistry } from "../../adapters/registry";

// Lazy-loaded sub-components
const ChartToolbar = lazy(() => import("./ChartToolbar").then((m) => ({ default: m.ChartToolbar })));
const DrilldownBreadcrumb = lazy(() =>
  import("./DrilldownBreadcrumb").then((m) => ({ default: m.DrilldownBreadcrumb }))
);
const ChartWidgetSkeleton = lazy(() =>
  import("./ChartWidgetSkeleton").then((m) => ({ default: m.ChartWidgetSkeleton }))
);
const ChartErrorBoundary = lazy(() =>
  import("./ChartErrorBoundary").then((m) => ({ default: m.ChartErrorBoundary }))
);

// ─── ChartWidget ──────────────────────────────────────────────

export const ChartWidget = memo(function ChartWidget({
  config,
  data: externalData,
  globalFilters = [],
  widgetFilters = [],
  filterDefinitions = [],
  mergeStrategy = "combine",
  onFilterChange,
  onChartEvent,
  isLoading: externalLoading,
  error: externalError,
  className = "",
  style,
  testId,
}: ChartWidgetProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(config.id);
  const { stack: drilldownStack, drillDown, drillUp, resetDrilldown } = useDrilldown(config.id);
  const { visible: legendVisible, toggle: toggleLegend } = useLegend(config.id);
  const { publish } = useEventBus(config.id);
  const { exportChart, exporting } = useExport(config.id);

  // 1. Lifecycle: register widget + sync config
  useWidgetLifecycle(config);

  // 2. Filter merge
  const mergedFilters = useFilterMerge(
    config.id,
    globalFilters,
    widgetFilters,
    mergeStrategy
  );

  // 3. Data management
  const { data: storeData, status, error: storeError, refresh } = useChartData(
    config,
    mergedFilters,
    externalData
  );

  // 4. Transformation pipeline
  const transformedData = useMemo(() => {
    if (!config.transformations?.length) return storeData;
    try {
      return runTransformationPipeline(storeData, config.transformations);
    } catch (err) {
      console.error("[ChartWidget] Transform error:", err);
      return storeData;
    }
  }, [storeData, config.transformations]);

  // 5. Adapter resolution
  const [adapter, setAdapter] = useState<ChartAdapter | null>(null);
  const [adapterError, setAdapterError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setAdapterError(null);

    ChartAdapterRegistry.getAdapter(config.library)
      .then((a) => {
        if (!cancelled) {
          setAdapter(a);
          if (!a.isInitialized() && containerRef.current) {
            a.initialize(containerRef.current).catch((err) => {
              if (!cancelled)
                setAdapterError(
                  err instanceof Error ? err.message : "Adapter init failed"
                );
            });
          }
        }
      })
      .catch((err) => {
        if (!cancelled)
          setAdapterError(err instanceof Error ? err.message : "Adapter not found");
      });

    return () => {
      cancelled = true;
    };
  }, [config.library]);

  // 6. Event handler
  const handleChartEvent = useCallback(
    (event: ChartEvent) => {
      // Publish to Redux event bus (cross-widget communication)
      publish(event.type, event.payload);

      // Drilldown handling
      if (
        event.type === "point_click" &&
        config.interactions?.drilldown?.enabled
      ) {
        const levels = config.interactions.drilldown.levels ?? [];
        const nextLevel = levels[drilldownStack.length];
        if (nextLevel) {
          const payload = event.payload as Record<string, unknown>;
          drillDown(nextLevel, {
            field: nextLevel.filterField ?? nextLevel.field,
            operator: "equals",
            value: payload?.name ?? payload?.data ?? payload?.value,
          });
        }
      }

      // Propagate to parent
      onChartEvent?.(event);
    },
    [publish, onChartEvent, config.interactions?.drilldown, drilldownStack.length, drillDown]
  );

  // 7. Toolbar handlers
  const handleRefresh = useCallback(() => {
    refresh();
    publish("refresh");
  }, [refresh, publish]);

  const handleExport = useCallback(
    async (format: Parameters<typeof exportChart>[0]) => {
      await exportChart(format, transformedData, config.export?.filename);
      publish("download", { format });
    },
    [exportChart, transformedData, config.export?.filename, publish]
  );

  // 8. Render config for adapter
  const renderConfig = useMemo((): ChartRenderConfig | null => {
    if (!adapter) return null;
    return {
      chartType: config.chartType,
      data: transformedData,
      fieldMapping: config.fieldMapping,
      chartOptions: config.chartOptions,
      theme,
      interactions: config.interactions,
      realtime: config.realtime,
      accessibility: config.accessibility,
      onEvent: handleChartEvent,
      containerRef,
    };
  }, [adapter, config, transformedData, theme, handleChartEvent]);

  // ── Derived state
  const isLoading = externalLoading ?? status === "loading";
  const error = externalError ?? storeError ?? adapterError;
  const showToolbar = config.toolbar?.visible !== false;
  const hasDrilldown = drilldownStack.length > 0;

  // ── CSS
  const widgetClasses = [
    "cwf-widget",
    `cwf-widget--${theme.mode}`,
    isFullscreen ? "cwf-widget--fullscreen" : "",
    isLoading ? "cwf-widget--loading" : "",
    error ? "cwf-widget--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={widgetClasses}
      style={{
        display: "flex",
        flexDirection: "column",
        background: theme.colors.surface,
        borderRadius: theme.borderRadius,
        border: `1px solid ${theme.colors.border}`,
        overflow: "hidden",
        position: "relative",
        height: "100%",
        minHeight: config.responsive?.minHeight ?? 300,
        maxHeight: isFullscreen ? "100vh" : config.responsive?.maxHeight,
        ...style,
      }}
      data-widget-id={config.id}
      data-testid={testId}
      role="region"
      aria-label={config.accessibility?.ariaLabel ?? config.title ?? "Chart widget"}
      aria-busy={isLoading}
    >
      {/* ── Header ── */}
      {(config.title || showToolbar) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: `1px solid ${theme.colors.border}`,
            flexShrink: 0,
          }}
        >
          <div>
            {config.title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {config.title}
              </h3>
            )}
            {config.description && (
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {config.description}
              </p>
            )}
          </div>

          {showToolbar && (
            <Suspense fallback={null}>
              <ChartToolbar
                config={config.toolbar ?? {}}
                exportConfig={config.export}
                permissions={config.permissions}
                theme={theme}
                isLoading={isLoading}
                isFullscreen={isFullscreen}
                legendVisible={legendVisible}
                onRefresh={handleRefresh}
                onExport={handleExport}
                onFullscreen={toggleFullscreen}
                onLegendToggle={toggleLegend}
                onPrint={() => window.print()}
              />
            </Suspense>
          )}
        </div>
      )}

      {/* ── Drilldown breadcrumb ── */}
      {hasDrilldown && (
        <Suspense fallback={null}>
          <DrilldownBreadcrumb
            stack={drilldownStack}
            theme={theme}
            onDrillUp={drillUp}
            onReset={resetDrilldown}
          />
        </Suspense>
      )}

      {/* ── Chart body ── */}
      <div
        ref={containerRef}
        style={{ flex: 1, position: "relative", overflow: "hidden", padding: 8 }}
      >
        {isLoading && (
          <Suspense fallback={<div style={{ padding: 24, textAlign: "center" }}>Loading…</div>}>
            <ChartWidgetSkeleton theme={theme} message={config.loading?.text} />
          </Suspense>
        )}

        {!isLoading && error && (
          <ChartErrorState
            error={error}
            theme={theme}
            showRetry={config.errorDisplay?.showRetry ?? true}
            onRetry={handleRefresh}
          />
        )}

        {!isLoading && !error && adapter && renderConfig && (
          <ChartBody adapter={adapter} renderConfig={renderConfig} />
        )}
      </div>

      {/* ── Accessibility live region ── */}
      {config.accessibility?.announceDataUpdates && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
        >
          {status === "success"
            ? `Chart updated with ${transformedData.length} data points`
            : status === "loading"
            ? "Loading chart data"
            : ""}
        </div>
      )}
    </div>
  );
});

// ─── ChartBody ────────────────────────────────────────────────

const ChartBody = memo(function ChartBody({
  adapter,
  renderConfig,
}: {
  adapter: ChartAdapter;
  renderConfig: ChartRenderConfig;
}) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      {adapter.render(renderConfig)}
    </div>
  );
});

// ─── ChartErrorState ──────────────────────────────────────────

function ChartErrorState({
  error,
  theme,
  showRetry,
  onRetry,
}: {
  error: string;
  theme: ReturnType<typeof useTheme>;
  showRetry: boolean;
  onRetry: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 12,
        padding: 24,
        textAlign: "center",
      }}
      role="alert"
    >
      <span style={{ fontSize: 32 }}>⚠️</span>
      <p style={{ color: theme.colors.text, fontSize: 14, margin: 0, fontFamily: theme.typography.fontFamily }}>
        {error}
      </p>
      {showRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "8px 20px",
            borderRadius: theme.borderRadius,
            background: theme.colors.primary,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
