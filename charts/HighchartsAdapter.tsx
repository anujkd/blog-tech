// ============================================================
// HIGHCHARTS ADAPTER
// Adapter for Highcharts — mirrors ECharts adapter API surface
// Install: npm install highcharts @highcharts/react-official
// ============================================================

import React, { useRef, useEffect, memo } from "react";
import type {
  ChartAdapter,
  ChartRenderConfig,
  ChartType,
  ExportFormat,
  ExportConfig,
  FieldMapping,
  ResolvedTheme,
  ChartEvent,
} from "../../types";

// ─── Highcharts Option Builder ────────────────────────────────

type HighchartsOptions = Record<string, unknown>;

function buildHighchartsTheme(theme: ResolvedTheme): HighchartsOptions {
  return {
    chart: {
      backgroundColor: "transparent",
      style: { fontFamily: theme.typography.fontFamily },
    },
    colors: theme.colors.palette,
    title: { style: { color: theme.colors.text } },
    subtitle: { style: { color: theme.colors.textSecondary } },
    xAxis: {
      gridLineColor: theme.colors.grid,
      lineColor: theme.colors.border,
      tickColor: theme.colors.border,
      labels: { style: { color: theme.colors.textSecondary } },
    },
    yAxis: {
      gridLineColor: theme.colors.grid,
      lineColor: theme.colors.border,
      labels: { style: { color: theme.colors.textSecondary } },
    },
    legend: {
      itemStyle: { color: theme.colors.text },
      itemHoverStyle: { color: theme.colors.primary },
    },
    tooltip: {
      backgroundColor: theme.colors.surface,
      style: { color: theme.colors.text },
      borderColor: theme.colors.border,
    },
  };
}

function buildHighchartsOption(
  config: ChartRenderConfig
): HighchartsOptions {
  const { chartType, data, fieldMapping = {}, theme, chartOptions } = config;
  const themeBase = buildHighchartsTheme(theme);
  const typeOption = buildHighchartsTypeOption(
    chartType,
    data as Record<string, unknown>[],
    fieldMapping,
    theme
  );

  return deepMerge(deepMerge(themeBase, typeOption), chartOptions ?? {});
}

function buildHighchartsTypeOption(
  chartType: ChartType,
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme
): HighchartsOptions {
  const xField = fm.xAxis ?? Object.keys(data[0] ?? {})[0] ?? "x";
  const yFields = Array.isArray(fm.yAxis)
    ? fm.yAxis
    : [fm.yAxis ?? Object.keys(data[0] ?? {})[1] ?? "y"];
  const nameField = fm.label ?? fm.category ?? xField;
  const valueField = fm.value ?? yFields[0];

  switch (chartType) {
    case "line":
    case "area": {
      const isArea = chartType === "area";
      return {
        chart: { type: isArea ? "area" : "line" },
        xAxis: { categories: data.map((d) => d[xField]) },
        series: yFields.map((yField) => ({
          name: yField,
          data: data.map((d) => Number(d[yField]) || 0),
          fillOpacity: isArea ? 0.15 : undefined,
        })),
      };
    }

    case "bar":
    case "stackedBar":
      return {
        chart: { type: "column" },
        xAxis: { categories: data.map((d) => d[xField]) },
        plotOptions: {
          column: {
            stacking: chartType === "stackedBar" ? "normal" : undefined,
            borderRadius: 4,
          },
        },
        series: yFields.map((yField) => ({
          name: yField,
          data: data.map((d) => Number(d[yField]) || 0),
        })),
      };

    case "pie":
    case "donut":
      return {
        chart: { type: "pie" },
        plotOptions: {
          pie: {
            innerSize: chartType === "donut" ? "40%" : "0%",
            allowPointSelect: true,
            cursor: "pointer",
            dataLabels: { enabled: true, format: "<b>{point.name}</b>: {point.percentage:.1f} %" },
          },
        },
        series: [{
          name: "Value",
          data: data.map((d) => ({ name: d[nameField], y: Number(d[valueField]) || 0 })),
        }],
      };

    case "scatter":
      return {
        chart: { type: "scatter" },
        series: [{
          type: "scatter",
          data: data.map((d) => [Number(d[xField]) || 0, Number(d[yFields[0]]) || 0]),
        }],
      };

    default:
      return {
        chart: { type: "line" },
        xAxis: { categories: data.map((d) => d[xField]) },
        series: [{ name: yFields[0], data: data.map((d) => Number(d[yFields[0]]) || 0) }],
      };
  }
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] !== null &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>
      );
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// ─── Highcharts React Renderer ────────────────────────────────

interface HighchartsRendererProps {
  options: HighchartsOptions;
  theme: ResolvedTheme;
  onEvent?: (event: ChartEvent) => void;
  widgetId: string;
}

const HighchartsRenderer = memo(function HighchartsRenderer({
  options,
  theme,
  onEvent,
  widgetId,
}: HighchartsRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);

  useEffect(() => {
    let cleanup: () => void;

    const init = async () => {
      try {
        const Highcharts = (await import("highcharts")).default;

        if (!containerRef.current) return;

        const chart = Highcharts.chart(containerRef.current, {
          ...options,
          chart: {
            ...(options.chart as Record<string, unknown> ?? {}),
            events: {
              click: (e: unknown) => {
                onEvent?.({
                  type: "point_click",
                  widgetId,
                  timestamp: Date.now(),
                  payload: e,
                  nativeEvent: e,
                });
              },
            },
          },
          plotOptions: {
            ...(options.plotOptions as Record<string, unknown> ?? {}),
            series: {
              point: {
                events: {
                  click: function (this: unknown) {
                    onEvent?.({
                      type: "point_click",
                      widgetId,
                      timestamp: Date.now(),
                      payload: this,
                    });
                  },
                },
              },
            },
          },
        } as Parameters<typeof Highcharts.chart>[1]);

        chartRef.current = chart;

        const resizeObserver = new ResizeObserver(() => {
          (chart as { reflow(): void }).reflow();
        });
        if (containerRef.current) resizeObserver.observe(containerRef.current);

        cleanup = () => {
          resizeObserver.disconnect();
          (chart as { destroy(): void }).destroy();
        };
      } catch (err) {
        console.error("[HighchartsAdapter] Highcharts not available:", err);
        if (containerRef.current) {
          containerRef.current.innerHTML =
            '<div style="padding:24px;color:#ef4444;font-family:sans-serif">' +
            "⚠️ Highcharts not installed.<br/>" +
            "<small>Run: npm install highcharts</small></div>";
        }
      }
    };

    init();
    return () => cleanup?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update on option changes
  useEffect(() => {
    if (chartRef.current) {
      (chartRef.current as { update(opts: unknown): void }).update(options, true, true);
    }
  }, [options]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 300 }}
      role="img"
      aria-label="Chart"
      tabIndex={0}
    />
  );
});

// ─── Highcharts Adapter Class ─────────────────────────────────

export class HighchartsAdapter implements ChartAdapter {
  readonly libraryName = "highcharts" as const;
  private initialized = false;
  private currentConfig: ChartRenderConfig | null = null;

  async initialize(_container: HTMLElement): Promise<void> {
    try {
      await import("highcharts");
      this.initialized = true;
    } catch {
      throw new Error(
        "Highcharts is not installed. Run: npm install highcharts"
      );
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  render(config: ChartRenderConfig): React.ReactNode {
    this.currentConfig = config;
    const options = buildHighchartsOption(config);

    return React.createElement(HighchartsRenderer, {
      key: `${config.chartType}-${config.theme.mode}`,
      options,
      theme: config.theme,
      onEvent: config.onEvent,
      widgetId: "widget",
    });
  }

  update(_config: ChartRenderConfig): void {
    // Handled reactively
  }

  resize(): void {
    // Handled via ResizeObserver inside HighchartsRenderer
  }

  async export(format: ExportFormat, _options?: ExportConfig): Promise<Blob | string> {
    const data = this.currentConfig?.data ?? [];

    if (format === "json") {
      return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    }

    if (format === "csv") {
      const rows = data as Record<string, unknown>[];
      if (!rows.length) return new Blob([""], { type: "text/csv" });
      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(","),
        ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
      ].join("\n");
      return new Blob([csv], { type: "text/csv" });
    }

    throw new Error(`Image export (${format}) requires Highcharts Exporting module.`);
  }

  destroy(): void {
    this.initialized = false;
    this.currentConfig = null;
  }
}
