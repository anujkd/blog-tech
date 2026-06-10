// ============================================================
// CORE TYPES — Chart Widget Framework
// Enterprise Generic Chart Widget Framework
// ============================================================

// ─── Filter Layer ────────────────────────────────────────────

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "in"
  | "not_in"
  | "contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal"
  | "between"
  | "exists"
  | "not_exists";

export type FilterMergeStrategy =
  | "combine"
  | "widget-overrides-global"
  | "global-overrides-widget";

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface FilterDefinition {
  id: string;
  field: string;
  label: string;
  type:
    | "text"
    | "number"
    | "boolean"
    | "single-select"
    | "multi-select"
    | "date"
    | "date-range";
  operators: FilterOperator[];
  defaultOperator?: FilterOperator;
  options?: FilterOption[];
  required?: boolean;
  placeholder?: string;
  description?: string;
}

export interface DateRangeValue {
  from: string;
  to: string;
}

export type FilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | DateRangeValue
  | null
  | undefined;

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
  /** Optional label for display */
  label?: string;
  /** Widget ID scope — undefined means global */
  widgetId?: string;
}

// ─── Data Layer ──────────────────────────────────────────────

export type DataSourceType =
  | "static"
  | "rest"
  | "graphql"
  | "async"
  | "websocket"
  | "sse";

export interface RestDataSourceConfig {
  type: "rest";
  url: string;
  method?: "GET" | "POST" | "PUT";
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: unknown;
  /** Transform raw response to data array */
  responseTransformer?: (response: unknown) => unknown[];
  /** Polling interval in ms (0 = no polling) */
  pollingInterval?: number;
}

export interface GraphQLDataSourceConfig {
  type: "graphql";
  url: string;
  query: string;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  /** Path to data in response e.g. "data.sales.items" */
  dataPath?: string;
}

export interface StaticDataSourceConfig {
  type: "static";
  data: unknown[];
}

export interface AsyncDataSourceConfig {
  type: "async";
  dataProvider: (filters: FilterCondition[]) => Promise<unknown[]>;
}

export interface WebSocketDataSourceConfig {
  type: "websocket";
  url: string;
  /** Message to send on connect */
  subscribeMessage?: unknown;
  /** Message to send on disconnect */
  unsubscribeMessage?: unknown;
  /** Transform incoming messages */
  messageTransformer?: (msg: unknown) => unknown[];
}

export interface SSEDataSourceConfig {
  type: "sse";
  url: string;
  eventName?: string;
  headers?: Record<string, string>;
  messageTransformer?: (msg: unknown) => unknown[];
}

export type DataSourceConfig =
  | RestDataSourceConfig
  | GraphQLDataSourceConfig
  | StaticDataSourceConfig
  | AsyncDataSourceConfig
  | WebSocketDataSourceConfig
  | SSEDataSourceConfig;

// ─── Data Transformation ─────────────────────────────────────

export type TransformationType =
  | "sort"
  | "filter"
  | "group"
  | "aggregate"
  | "pivot"
  | "normalize"
  | "calculate"
  | "custom";

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
}

export interface AggregationConfig {
  field: string;
  function: "sum" | "avg" | "min" | "max" | "count" | "distinct";
  alias?: string;
}

export interface TransformationStep {
  type: TransformationType;
  config: Record<string, unknown>;
  /** custom transformer function */
  transform?: (data: unknown[], config: Record<string, unknown>) => unknown[];
}

// ─── Chart Configuration ─────────────────────────────────────

export type ChartLibrary = "echarts" | "highcharts" | "chartjs" | "visx" | "d3";

export type ChartType =
  | "line"
  | "bar"
  | "area"
  | "stackedBar"
  | "stackedArea"
  | "pie"
  | "donut"
  | "scatter"
  | "bubble"
  | "radar"
  | "heatmap"
  | "treemap"
  | "waterfall"
  | "gauge"
  | "funnel"
  | "mixed"
  | "custom";

export type ExportFormat = "png" | "jpeg" | "svg" | "pdf" | "csv" | "excel" | "json";

export interface ToolbarButton {
  id: string;
  icon: string;
  label: string;
  tooltip?: string;
  handler: () => void;
  disabled?: boolean;
  visible?: boolean;
}

export interface ToolbarConfig {
  visible?: boolean;
  position?: "top" | "bottom";
  items?: Array<
    | "refresh"
    | "download"
    | "fullscreen"
    | "print"
    | "share"
    | "settings"
    | "resetZoom"
    | "legendToggle"
    | "separator"
  >;
  customButtons?: ToolbarButton[];
}

export interface ExportConfig {
  enabled?: boolean;
  formats?: ExportFormat[];
  filename?: string;
  /** PNG/JPEG quality 0-1 */
  quality?: number;
  /** Width override for export */
  width?: number;
  /** Height override for export */
  height?: number;
}

export interface DrilldownConfig {
  enabled?: boolean;
  levels?: DrilldownLevel[];
  currentLevel?: number;
}

export interface DrilldownLevel {
  field: string;
  label: string;
  /** Filter to apply when drilling into this level */
  filterField?: string;
}

export interface InteractionConfig {
  drilldown?: DrilldownConfig;
  crossFilter?: boolean;
  tooltip?: boolean;
  zoom?: boolean;
  brush?: boolean;
  selection?: boolean;
  click?: boolean;
  hover?: boolean;
}

export interface RealtimeConfig {
  enabled?: boolean;
  maxDataPoints?: number;
  animationDuration?: number;
  bufferSize?: number;
}

export interface ThemeConfig {
  mode?: "light" | "dark" | "system" | "custom";
  colorPalette?: string[];
  backgroundColor?: string;
  textColor?: string;
  gridColor?: string;
  fontFamily?: string;
  fontSize?: number;
  customTokens?: Record<string, string>;
}

export interface CacheConfig {
  enabled?: boolean;
  ttl?: number; // seconds
  strategy?: "memory" | "localStorage" | "sessionStorage";
  key?: string;
}

export interface AccessibilityConfig {
  enabled?: boolean;
  ariaLabel?: string;
  ariaDescription?: string;
  announceDataUpdates?: boolean;
  highContrastMode?: boolean;
  keyboardNavigation?: boolean;
  focusIndicator?: boolean;
}

export interface PermissionConfig {
  canExport?: boolean;
  canDrilldown?: boolean;
  canFilter?: boolean;
  canRefresh?: boolean;
  canFullscreen?: boolean;
  roles?: string[];
}

export interface ResponsiveConfig {
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  aspectRatio?: string;
  minHeight?: number;
  maxHeight?: number;
}

export interface ChartWidgetConfig {
  id: string;
  title?: string;
  description?: string;
  library: ChartLibrary;
  chartType: ChartType;
  dataSource: DataSourceConfig;
  /** Library-specific option overrides — merged with adapter defaults */
  chartOptions?: Record<string, unknown>;
  /** Data field mappings */
  fieldMapping?: FieldMapping;
  /** Transformation pipeline to run on raw data */
  transformations?: TransformationStep[];
  toolbar?: ToolbarConfig;
  export?: ExportConfig;
  interactions?: InteractionConfig;
  realtime?: RealtimeConfig;
  theme?: ThemeConfig;
  cache?: CacheConfig;
  accessibility?: AccessibilityConfig;
  permissions?: PermissionConfig;
  responsive?: ResponsiveConfig;
  /** Loading indicator config */
  loading?: { text?: string; spinner?: boolean };
  /** Error display config */
  errorDisplay?: { message?: string; showRetry?: boolean };
}

export interface FieldMapping {
  xAxis?: string;
  yAxis?: string | string[];
  value?: string;
  label?: string;
  category?: string;
  series?: string;
  size?: string;
  color?: string;
  lat?: string;
  lng?: string;
  children?: string;
}

// ─── Chart Adapter Contracts ─────────────────────────────────

export interface ChartRenderConfig {
  chartType: ChartType;
  data: unknown[];
  fieldMapping?: FieldMapping;
  chartOptions?: Record<string, unknown>;
  theme: ResolvedTheme;
  interactions?: InteractionConfig;
  realtime?: RealtimeConfig;
  accessibility?: AccessibilityConfig;
  onEvent?: (event: ChartEvent) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export interface ChartAdapter {
  readonly libraryName: ChartLibrary;
  initialize(container: HTMLElement): Promise<void>;
  render(config: ChartRenderConfig): React.ReactNode;
  update(config: ChartRenderConfig): void;
  resize(): void;
  export(format: ExportFormat, options?: ExportConfig): Promise<Blob | string>;
  destroy(): void;
  isInitialized(): boolean;
}

// ─── Events ──────────────────────────────────────────────────

export type ChartEventType =
  | "chart_loaded"
  | "chart_error"
  | "point_click"
  | "point_hover"
  | "legend_click"
  | "zoom"
  | "brush"
  | "refresh"
  | "download"
  | "fullscreen"
  | "drilldown"
  | "selection_change"
  | "filter_change"
  | "data_update"
  | "custom";

export interface ChartEvent {
  type: ChartEventType;
  widgetId: string;
  timestamp: number;
  payload?: unknown;
  /** Original native library event */
  nativeEvent?: unknown;
}

export interface EventBusMessage {
  id: string;
  type: ChartEventType;
  sourceWidgetId: string;
  targetWidgetId?: string; // undefined = broadcast
  timestamp: number;
  payload?: unknown;
}

// ─── Chart Data Request ──────────────────────────────────────

export interface ChartDataRequest {
  widgetId: string;
  chartType: ChartType;
  filters: FilterCondition[];
  sorting?: SortConfig[];
  pagination?: PaginationConfig;
  metrics?: string[];
  dimensions?: string[];
  drilldown?: DrilldownConfig;
  aggregations?: AggregationConfig[];
  transformations?: TransformationStep[];
}

// ─── Theme ───────────────────────────────────────────────────

export type ThemeMode = "light" | "dark" | "system" | "custom";

export interface ResolvedTheme {
  mode: ThemeMode;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    grid: string;
    palette: string[];
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
  };
  spacing: {
    unit: number;
  };
  borderRadius: number;
}

// ─── Widget Props ─────────────────────────────────────────────

export interface ChartWidgetProps {
  config: ChartWidgetConfig;
  data?: unknown[];
  globalFilters?: FilterCondition[];
  widgetFilters?: FilterCondition[];
  filterDefinitions?: FilterDefinition[];
  mergeStrategy?: FilterMergeStrategy;
  onFilterChange?: (filters: FilterCondition[]) => void;
  onChartEvent?: (event: ChartEvent) => void;
  /** Override loading state */
  isLoading?: boolean;
  /** Override error state */
  error?: string | null;
  /** CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Test ID */
  testId?: string;
}

// ─── Redux State Shapes ───────────────────────────────────────

export interface DashboardState {
  id: string;
  title: string;
  isFullscreen: boolean;
  activeWidgetId: string | null;
  layoutDirty: boolean;
}

export interface GlobalFilterState {
  filters: FilterCondition[];
  appliedAt: number | null;
  isDirty: boolean;
}

export interface WidgetFilterEntry {
  widgetId: string;
  filters: FilterCondition[];
  appliedAt: number | null;
}

export interface ChartWidgetState {
  id: string;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  data: unknown[];
  lastFetchedAt: number | null;
  drilldownStack: DrilldownLevel[];
  isFullscreen: boolean;
  legendVisible: boolean;
  zoomState: Record<string, unknown> | null;
}

export interface WidgetConfigState {
  id: string;
  config: ChartWidgetConfig;
  isDirty: boolean;
}

export interface DrilldownState {
  widgetId: string;
  stack: Array<{
    level: DrilldownLevel;
    filter: FilterCondition;
    timestamp: number;
  }>;
}

export interface ThemeState {
  mode: ThemeMode;
  customTokens?: Record<string, string>;
  systemPreference: "light" | "dark";
  resolved: ResolvedTheme;
}
