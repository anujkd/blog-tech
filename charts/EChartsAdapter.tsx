// ============================================================
// ECHARTS ADAPTER
// Full adapter for Apache ECharts — handles all chart types,
// events, export, resize, realtime, accessibility
// ============================================================

import React, { useRef, useEffect, useCallback, memo } from "react";
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

// ─── ECharts Option Builders ──────────────────────────────────

type EChartsOption = Record<string, unknown>;

function buildThemeBase(theme: ResolvedTheme): EChartsOption {
  return {
    backgroundColor: "transparent",
    color: theme.colors.palette,
    textStyle: {
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize,
      color: theme.colors.text,
    },
  };
}

function buildGridOption(theme: ResolvedTheme): EChartsOption {
  return {
    top: 48,
    right: 24,
    bottom: 48,
    left: 56,
    containLabel: true,
  };
}

function buildTooltip(theme: ResolvedTheme): EChartsOption {
  return {
    trigger: "axis",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    textStyle: { color: theme.colors.text, fontSize: theme.typography.fontSize },
    extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 6px;",
  };
}

function buildLegend(theme: ResolvedTheme, visible: boolean): EChartsOption {
  return {
    show: visible,
    type: "scroll",
    bottom: 0,
    textStyle: { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize },
    pageTextStyle: { color: theme.colors.textSecondary },
  };
}

function buildAxis(
  type: "category" | "value",
  theme: ResolvedTheme
): EChartsOption {
  return {
    type,
    axisLine: { lineStyle: { color: theme.colors.border } },
    axisTick: { lineStyle: { color: theme.colors.border } },
    axisLabel: { color: theme.colors.textSecondary, fontSize: theme.typography.fontSize },
    splitLine: { lineStyle: { color: theme.colors.grid, type: "dashed" } },
  };
}

// ─── Chart Option Factory ─────────────────────────────────────

export function buildEChartsOption(
  config: ChartRenderConfig
): EChartsOption {
  const { chartType, data, fieldMapping = {}, theme, interactions, chartOptions } = config;

  const base: EChartsOption = {
    ...buildThemeBase(theme),
    grid: buildGridOption(theme),
    tooltip: buildTooltip(theme),
    legend: buildLegend(theme, true),
  };

  const typeOption = buildChartTypeOption(chartType, data as Record<string, unknown>[], fieldMapping, theme);

  // Merge: base ← type defaults ← user overrides
  return deepMerge(deepMerge(base, typeOption), chartOptions ?? {});
}

function buildChartTypeOption(
  chartType: ChartType,
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme
): EChartsOption {
  switch (chartType) {
    case "line":
      return buildLineOption(data, fm, theme, false);
    case "area":
      return buildLineOption(data, fm, theme, true);
    case "bar":
      return buildBarOption(data, fm, theme, false);
    case "stackedBar":
      return buildBarOption(data, fm, theme, true);
    case "stackedArea":
      return buildLineOption(data, fm, theme, true, true);
    case "pie":
      return buildPieOption(data, fm, theme, false);
    case "donut":
      return buildPieOption(data, fm, theme, true);
    case "scatter":
      return buildScatterOption(data, fm, theme);
    case "radar":
      return buildRadarOption(data, fm, theme);
    case "heatmap":
      return buildHeatmapOption(data, fm, theme);
    case "gauge":
      return buildGaugeOption(data, fm, theme);
    case "funnel":
      return buildFunnelOption(data, fm, theme);
    case "treemap":
      return buildTreemapOption(data, fm, theme);
    case "waterfall":
      return buildWaterfallOption(data, fm, theme);
    case "bubble":
      return buildBubbleOption(data, fm, theme);
    default:
      return buildLineOption(data, fm, theme, false);
  }
}

function buildLineOption(
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme,
  fill: boolean,
  stacked = false
): EChartsOption {
  const xField = fm.xAxis ?? Object.keys(data[0] ?? {})[0] ?? "x";
  const yFields = Array.isArray(fm.yAxis)
    ? fm.yAxis
    : [fm.yAxis ?? Object.keys(data[0] ?? {})[1] ?? "y"];

  return {
    xAxis: { ...buildAxis("category", theme), data: data.map((d) => d[xField]) },
    yAxis: buildAxis("value", theme),
    series: yFields.map((yField, i) => ({
      name: yField,
      type: "line",
      data: data.map((d) => d[yField]),
      smooth: true,
      stack: stacked ? "total" : undefined,
      areaStyle: fill
        ? {
            opacity: 0.15,
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: theme.colors.palette[i % theme.colors.palette.length] },
                { offset: 1, color: "transparent" },
              ],
            },
          }
        : undefined,
      lineStyle: { width: 2 },
      symbolSize: 6,
      emphasis: { focus: "series" },
    })),
  };
}

function buildBarOption(
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme,
  stacked: boolean
): EChartsOption {
  const xField = fm.xAxis ?? Object.keys(data[0] ?? {})[0] ?? "x";
  const yFields = Array.isArray(fm.yAxis)
    ? fm.yAxis
    : [fm.yAxis ?? Object.keys(data[0] ?? {})[1] ?? "y"];

  return {
    xAxis: { ...buildAxis("category", theme), data: data.map((d) => d[xField]) },
    yAxis: buildAxis("value", theme),
    series: yFields.map((yField) => ({
      name: yField,
      type: "bar",
      data: data.map((d) => d[yField]),
      stack: stacked ? "total" : undefined,
      barMaxWidth: 48,
      emphasis: { focus: "series" },
      itemStyle: { borderRadius: stacked ? 0 : [3, 3, 0, 0] },
    })),
  };
}

function buildPieOption(
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme,
  donut: boolean
): EChartsOption {
  const nameField = fm.label ?? fm.category ?? Object.keys(data[0] ?? {})[0] ?? "name";
  const valueField = fm.value ?? Object.keys(data[0] ?? {})[1] ?? "value";

  return {
    tooltip: { trigger: "item", formatter: "{a} <br/>{b}: {c} ({d}%)" },
    legend: { ...buildLegend(theme, true), orient: "vertical", right: 10 },
    series: [{
      name: "Value",
      type: "pie",
      radius: donut ? ["40%", "70%"] : "65%",
      center: ["50%", "50%"],
      data: data.map((d) => ({ name: d[nameField], value: d[valueField] })),
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" },
      },
      label: { color: theme.colors.text, fontSize: theme.typography.fontSize },
      itemStyle: { borderColor: theme.colors.background, borderWidth: 2 },
    }],
  };
}

function buildScatterOption(
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme
): EChartsOption {
  const xField = fm.xAxis ?? "x";
  const yField = (Array.isArray(fm.yAxis) ? fm.yAxis[0] : fm.yAxis) ?? "y";

  return {
    xAxis: buildAxis("value", theme),
    yAxis: buildAxis("value", theme),
    series: [{
      type: "scatter",
      data: data.map((d) => [d[xField], d[yField]]),
      symbolSize: 8,
      emphasis: { focus: "series" },
    }],
  };
}

function buildBubbleOption(
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme
): EChartsOption {
  const xField = fm.xAxis ?? "x";
  const yField = (Array.isArray(fm.yAxis) ? fm.yAxis[0] : fm.yAxis) ?? "y";
  const sizeField = fm.size ?? "size";

  return {
    xAxis: buildAxis("value", theme),
    yAxis: buildAxis("value", theme),
    series: [{
      type: "scatter",
      data: data.map((d) => [d[xField], d[yField], d[sizeField]]),
      symbolSize: (val: number[]) => Math.sqrt(val[2]) * 4,
      emphasis: { focus: "series" },
    }],
  };
}

function buildRadarOption(
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme
): EChartsOption {
  const keys = Object.keys(data[0] ?? {}).filter((k) => k !== (fm.label ?? "name"));
  const nameField = fm.label ?? "name";

  return {
    radar: {
      indicator: keys.map((k) => ({ name: k, max: Math.max(...data.map((d) => Number(d[k]) || 0)) * 1.2 })),
      splitLine: { lineStyle: { color: theme.colors.grid } },
      axisName: { color: theme.colors.textSecondary },
    },
    series: [{
      type: "radar",
      data: data.map((d, i) => ({
        name: d[nameField] ?? `Series ${i + 1}`,
        value: keys.map((k) => Number(d[k]) || 0),
      })),
      emphasis: { focus: "series" },
    }],
  };
}

function buildHeatmapOption(
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme
): EChartsOption {
  const xField = fm.xAxis ?? "x";
  const yField = (Array.isArray(fm.yAxis) ? fm.yAxis[0] : fm.yAxis) ?? "y";
  const valueField = fm.value ?? "value";

  const xValues = [...new Set(data.map((d) => d[xField]))];
  const yValues = [...new Set(data.map((d) => d[yField]))];
  const max = Math.max(...data.map((d) => Number(d[valueField]) || 0));

  return {
    grid: { top: 48, right: 80, bottom: 48, left: 56 },
    xAxis: { type: "category", data: xValues, axisLabel: { color: theme.colors.textSecondary } },
    yAxis: { type: "category", data: yValues, axisLabel: { color: theme.colors.textSecondary } },
    visualMap: {
      min: 0, max,
      calculable: true,
      orient: "vertical",
      right: 0, top: "center",
      inRange: { color: [theme.colors.surface, theme.colors.primary] },
      textStyle: { color: theme.colors.textSecondary },
    },
    series: [{
      type: "heatmap",
      data: data.map((d) => [d[xField], d[yField], d[valueField]]),
      label: { show: true, color: theme.colors.text, fontSize: 10 },
      emphasis: { itemStyle: { shadowBlur: 10 } },
    }],
  };
}

function buildGaugeOption(
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme
): EChartsOption {
  const valueField = fm.value ?? Object.keys(data[0] ?? {})[0] ?? "value";
  const value = Number(data[0]?.[valueField]) || 0;

  return {
    series: [{
      type: "gauge",
      radius: "85%",
      progress: { show: true, width: 18 },
      axisLine: { lineStyle: { width: 18, color: [[1, theme.colors.grid]] } },
      axisTick: { show: false },
      splitLine: { length: 12, lineStyle: { width: 2, color: theme.colors.border } },
      axisLabel: { distance: 28, color: theme.colors.textSecondary, fontSize: 10 },
      anchor: { show: true, showAbove: true, size: 12, itemStyle: { borderWidth: 2 } },
      title: { offsetCenter: [0, "70%"], color: theme.colors.text },
      detail: {
        valueAnimation: true,
        offsetCenter: [0, "40%"],
        formatter: "{value}%",
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: 600,
      },
      data: [{ value, name: String(data[0]?.[fm.label ?? "label"] ?? "Value") }],
      color: theme.colors.primary,
    }],
  };
}

function buildFunnelOption(
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme
): EChartsOption {
  const nameField = fm.label ?? "name";
  const valueField = fm.value ?? "value";

  return {
    series: [{
      type: "funnel",
      left: "10%",
      top: 48,
      bottom: 48,
      width: "80%",
      min: 0,
      max: Math.max(...data.map((d) => Number(d[valueField]) || 0)),
      minSize: "0%",
      maxSize: "100%",
      sort: "descending",
      gap: 2,
      label: { show: true, position: "inside", color: "#fff" },
      emphasis: { label: { fontSize: 16, fontWeight: 600 } },
      data: data.map((d) => ({ name: d[nameField], value: d[valueField] })),
    }],
  };
}

function buildTreemapOption(
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme
): EChartsOption {
  const nameField = fm.label ?? "name";
  const valueField = fm.value ?? "value";
  const childrenField = fm.children ?? "children";

  return {
    series: [{
      type: "treemap",
      visibleMin: 300,
      roam: false,
      nodeClick: "zoomToNode",
      data: data.map((d) => ({
        name: d[nameField],
        value: d[valueField],
        children: d[childrenField],
      })),
      label: { show: true, formatter: "{b}", color: "#fff" },
      upperLabel: { show: true, height: 30, color: "#fff" },
      breadcrumb: {
        itemStyle: { color: theme.colors.surface, textStyle: { color: theme.colors.text } },
      },
    }],
  };
}

function buildWaterfallOption(
  data: Record<string, unknown>[],
  fm: FieldMapping,
  theme: ResolvedTheme
): EChartsOption {
  const xField = fm.xAxis ?? "name";
  const yField = (Array.isArray(fm.yAxis) ? fm.yAxis[0] : fm.yAxis) ?? "value";

  // Build helper (invisible) + value series for waterfall
  const helpers: number[] = [];
  let running = 0;
  const values = data.map((d) => Number(d[yField]) || 0);
  values.forEach((v, i) => {
    helpers.push(i === 0 ? 0 : running);
    running += v;
  });

  return {
    xAxis: { ...buildAxis("category", theme), data: data.map((d) => d[xField]) },
    yAxis: buildAxis("value", theme),
    series: [
      {
        name: "helper",
        type: "bar",
        stack: "Total",
        itemStyle: { borderColor: "transparent", color: "transparent" },
        emphasis: { itemStyle: { borderColor: "transparent", color: "transparent" } },
        data: helpers,
      },
      {
        name: "value",
        type: "bar",
        stack: "Total",
        data: values.map((v, i) => ({
          value: v,
          itemStyle: {
            color: v >= 0 ? theme.colors.palette[1] : theme.colors.palette[3],
            borderRadius: [3, 3, 0, 0],
          },
        })),
        label: { show: true, position: "top", color: theme.colors.text, fontSize: 11 },
      },
    ],
  };
}

// ─── Deep Merge Utility ───────────────────────────────────────

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

// ─── ECharts React Component ──────────────────────────────────

interface EChartsRendererProps {
  option: EChartsOption;
  theme: ResolvedTheme;
  onEvent?: (event: ChartEvent) => void;
  widgetId: string;
  accessibility?: { ariaLabel?: string };
  large?: boolean;
}

const EChartsRenderer = memo(function EChartsRenderer({
  option,
  theme,
  onEvent,
  widgetId,
  accessibility,
  large = false,
}: EChartsRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);

  const initChart = useCallback(async () => {
    if (!containerRef.current) return;

    const echarts = await import("echarts");

    // Dispose previous instance
    const existing = echarts.getInstanceByDom(containerRef.current);
    if (existing) existing.dispose();

    const chart = echarts.init(containerRef.current, null, {
      renderer: "canvas",
      useDirtyRect: true,
    });
    chartRef.current = chart;

    chart.setOption({
      ...option,
      animation: true,
      animationDuration: 400,
      animationEasing: "cubicOut",
      progressive: large ? 400 : 0,
      progressiveThreshold: large ? 3000 : 0,
      large,
      largeThreshold: 2000,
    } as Parameters<typeof chart.setOption>[0]);

    // Bind events
    chart.on("click", (params: unknown) => {
      onEvent?.({
        type: "point_click",
        widgetId,
        timestamp: Date.now(),
        payload: params,
        nativeEvent: params,
      });
    });

    chart.on("legendselectchanged", (params: unknown) => {
      onEvent?.({
        type: "legend_click",
        widgetId,
        timestamp: Date.now(),
        payload: params,
      });
    });

    chart.on("datazoom", (params: unknown) => {
      onEvent?.({
        type: "zoom",
        widgetId,
        timestamp: Date.now(),
        payload: params,
      });
    });

    // Responsive resize observer
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initChart().then((fn) => (cleanup = fn));
    return () => cleanup?.();
  }, [initChart]);

  // Update option when it changes (no full re-init)
  useEffect(() => {
    if (!containerRef.current) return;
    import("echarts").then((echarts) => {
      const chart = echarts.getInstanceByDom(containerRef.current!);
      if (chart) {
        chart.setOption(option as Parameters<typeof chart.setOption>[0], { notMerge: false, lazyUpdate: true });
      }
    });
  }, [option]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 300 }}
      role="img"
      aria-label={accessibility?.ariaLabel ?? "Chart"}
      tabIndex={0}
    />
  );
});

// ─── ECharts Adapter Class ────────────────────────────────────

export class EChartsAdapter implements ChartAdapter {
  readonly libraryName = "echarts" as const;
  private initialized = false;
  private currentConfig: ChartRenderConfig | null = null;

  async initialize(_container: HTMLElement): Promise<void> {
    // Pre-load echarts
    await import("echarts");
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  render(config: ChartRenderConfig): React.ReactNode {
    this.currentConfig = config;
    const option = buildEChartsOption(config);
    const large =
      Array.isArray(config.data) && config.data.length > 5000;

    return React.createElement(EChartsRenderer, {
      key: `${config.chartType}-${config.theme.mode}`,
      option,
      theme: config.theme,
      onEvent: config.onEvent,
      widgetId: (config.containerRef as React.RefObject<HTMLDivElement | null> & { widgetId?: string })?.widgetId ?? "unknown",
      accessibility: config.accessibility,
      large,
    });
  }

  update(_config: ChartRenderConfig): void {
    // Handled reactively via React re-render
  }

  resize(): void {
    // Handled via ResizeObserver inside EChartsRenderer
  }

  async export(format: ExportFormat, options?: ExportConfig): Promise<Blob | string> {
    if (format === "csv" || format === "json") {
      const data = this.currentConfig?.data ?? [];
      if (format === "json") {
        return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      }
      // CSV
      const rows = data as Record<string, unknown>[];
      if (!rows.length) return new Blob([""], { type: "text/csv" });
      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(","),
        ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
      ].join("\n");
      return new Blob([csv], { type: "text/csv" });
    }

    // For image formats, we rely on the ECharts instance
    // This would be called from the toolbar export handler
    throw new Error(
      `Image export (${format}) must be triggered via the ECharts instance directly. ` +
        `Use the toolbar export button which has access to the chart DOM.`
    );
  }

  destroy(): void {
    this.initialized = false;
    this.currentConfig = null;
  }
}
