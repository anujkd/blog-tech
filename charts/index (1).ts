// ============================================================
// REDUX STORE — All slices, selectors, entity adapters
// ============================================================

import {
  configureStore,
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  createSelector,
  PayloadAction,
  EntityState,
} from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { resolveTheme, LIGHT_THEME } from "../services/theme";
import {
  FilterCondition,
  FilterMergeStrategy,
  ChartWidgetState,
  WidgetConfigState,
  DashboardState,
  GlobalFilterState,
  WidgetFilterEntry,
  DrilldownState,
  ThemeState,
  ThemeMode,
  ResolvedTheme,
  EventBusMessage,
  ChartEventType,
  ChartWidgetConfig,
  DrilldownLevel,
  FilterCondition as FC,
} from "../types";
import { mergeFilters } from "../services/filterMerge";

// ─── 1. Dashboard Slice ───────────────────────────────────────

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    id: "default",
    title: "Analytics Dashboard",
    isFullscreen: false,
    activeWidgetId: null,
    layoutDirty: false,
  } as DashboardState,
  reducers: {
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    setFullscreen(state, action: PayloadAction<boolean>) {
      state.isFullscreen = action.payload;
    },
    setActiveWidget(state, action: PayloadAction<string | null>) {
      state.activeWidgetId = action.payload;
    },
    setLayoutDirty(state, action: PayloadAction<boolean>) {
      state.layoutDirty = action.payload;
    },
  },
});

// ─── 2. Global Filter Slice ───────────────────────────────────

const globalFilterSlice = createSlice({
  name: "globalFilter",
  initialState: {
    filters: [] as FilterCondition[],
    appliedAt: null,
    isDirty: false,
  } as GlobalFilterState,
  reducers: {
    setGlobalFilters(state, action: PayloadAction<FilterCondition[]>) {
      state.filters = action.payload;
      state.appliedAt = Date.now();
      state.isDirty = false;
    },
    addGlobalFilter(state, action: PayloadAction<FilterCondition>) {
      const idx = state.filters.findIndex(
        (f) => f.field === action.payload.field
      );
      if (idx >= 0) {
        state.filters[idx] = action.payload;
      } else {
        state.filters.push(action.payload);
      }
      state.isDirty = true;
    },
    removeGlobalFilter(state, action: PayloadAction<string>) {
      state.filters = state.filters.filter((f) => f.field !== action.payload);
      state.isDirty = true;
    },
    clearGlobalFilters(state) {
      state.filters = [];
      state.appliedAt = Date.now();
      state.isDirty = false;
    },
    applyPendingFilters(state) {
      state.appliedAt = Date.now();
      state.isDirty = false;
    },
  },
});

// ─── 3. Widget Filter Slice ───────────────────────────────────

const widgetFilterAdapter = createEntityAdapter<WidgetFilterEntry>({
  selectId: (entry) => entry.widgetId,
});

const widgetFilterSlice = createSlice({
  name: "widgetFilter",
  initialState: widgetFilterAdapter.getInitialState(),
  reducers: {
    setWidgetFilters(
      state,
      action: PayloadAction<{ widgetId: string; filters: FilterCondition[] }>
    ) {
      widgetFilterAdapter.upsertOne(state, {
        widgetId: action.payload.widgetId,
        filters: action.payload.filters,
        appliedAt: Date.now(),
      });
    },
    addWidgetFilter(
      state,
      action: PayloadAction<{ widgetId: string; filter: FilterCondition }>
    ) {
      const existing = state.entities[action.payload.widgetId];
      const filters = existing?.filters ?? [];
      const idx = filters.findIndex(
        (f: FC) => f.field === action.payload.filter.field
      );
      const updated =
        idx >= 0
          ? filters.map((f: FC, i: number) =>
              i === idx ? action.payload.filter : f
            )
          : [...filters, action.payload.filter];
      widgetFilterAdapter.upsertOne(state, {
        widgetId: action.payload.widgetId,
        filters: updated,
        appliedAt: Date.now(),
      });
    },
    removeWidgetFilter(
      state,
      action: PayloadAction<{ widgetId: string; field: string }>
    ) {
      const existing = state.entities[action.payload.widgetId];
      if (existing) {
        widgetFilterAdapter.updateOne(state, {
          id: action.payload.widgetId,
          changes: {
            filters: existing.filters.filter(
              (f: FC) => f.field !== action.payload.field
            ),
          },
        });
      }
    },
    clearWidgetFilters(state, action: PayloadAction<string>) {
      widgetFilterAdapter.upsertOne(state, {
        widgetId: action.payload,
        filters: [],
        appliedAt: Date.now(),
      });
    },
  },
});

// ─── 4. Chart Widget Slice (normalized) ──────────────────────

const chartWidgetAdapter = createEntityAdapter<ChartWidgetState>({
  selectId: (w) => w.id,
});

// Async thunk: fetch data for a widget
export const fetchWidgetData = createAsyncThunk(
  "chartWidget/fetchData",
  async (
    payload: {
      widgetId: string;
      config: ChartWidgetConfig;
      filters: FilterCondition[];
    },
    { rejectWithValue }
  ) => {
    const { widgetId, config, filters } = payload;
    try {
      const { loadDataForWidget } = await import("../services/dataProviders");
      const data = await loadDataForWidget(config.dataSource, filters);
      return { widgetId, data };
    } catch (err) {
      return rejectWithValue({
        widgetId,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }
);

const chartWidgetSlice = createSlice({
  name: "chartWidget",
  initialState: chartWidgetAdapter.getInitialState(),
  reducers: {
    registerWidget(
      state,
      action: PayloadAction<Pick<ChartWidgetState, "id">>
    ) {
      chartWidgetAdapter.upsertOne(state, {
        id: action.payload.id,
        status: "idle",
        error: null,
        data: [],
        lastFetchedAt: null,
        drilldownStack: [],
        isFullscreen: false,
        legendVisible: true,
        zoomState: null,
      });
    },
    unregisterWidget(state, action: PayloadAction<string>) {
      chartWidgetAdapter.removeOne(state, action.payload);
    },
    setWidgetData(
      state,
      action: PayloadAction<{ widgetId: string; data: unknown[] }>
    ) {
      chartWidgetAdapter.updateOne(state, {
        id: action.payload.widgetId,
        changes: { data: action.payload.data, lastFetchedAt: Date.now() },
      });
    },
    setWidgetFullscreen(
      state,
      action: PayloadAction<{ widgetId: string; fullscreen: boolean }>
    ) {
      chartWidgetAdapter.updateOne(state, {
        id: action.payload.widgetId,
        changes: { isFullscreen: action.payload.fullscreen },
      });
    },
    toggleLegend(state, action: PayloadAction<string>) {
      const w = state.entities[action.payload];
      if (w) {
        chartWidgetAdapter.updateOne(state, {
          id: action.payload,
          changes: { legendVisible: !w.legendVisible },
        });
      }
    },
    setZoomState(
      state,
      action: PayloadAction<{
        widgetId: string;
        zoomState: Record<string, unknown> | null;
      }>
    ) {
      chartWidgetAdapter.updateOne(state, {
        id: action.payload.widgetId,
        changes: { zoomState: action.payload.zoomState },
      });
    },
    appendRealtimeData(
      state,
      action: PayloadAction<{
        widgetId: string;
        newData: unknown[];
        maxDataPoints?: number;
      }>
    ) {
      const w = state.entities[action.payload.widgetId];
      if (w) {
        const max = action.payload.maxDataPoints ?? 500;
        const combined = [...w.data, ...action.payload.newData];
        chartWidgetAdapter.updateOne(state, {
          id: action.payload.widgetId,
          changes: {
            data: combined.slice(-max),
            lastFetchedAt: Date.now(),
          },
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWidgetData.pending, (state, action) => {
        const widgetId = action.meta.arg.widgetId;
        chartWidgetAdapter.updateOne(state, {
          id: widgetId,
          changes: { status: "loading", error: null },
        });
      })
      .addCase(fetchWidgetData.fulfilled, (state, action) => {
        chartWidgetAdapter.updateOne(state, {
          id: action.payload.widgetId,
          changes: {
            status: "success",
            data: action.payload.data,
            lastFetchedAt: Date.now(),
          },
        });
      })
      .addCase(fetchWidgetData.rejected, (state, action) => {
        const payload = action.payload as { widgetId: string; error: string };
        chartWidgetAdapter.updateOne(state, {
          id: payload.widgetId,
          changes: { status: "error", error: payload.error },
        });
      });
  },
});

// ─── 5. Widget Config Slice ───────────────────────────────────

const widgetConfigAdapter = createEntityAdapter<WidgetConfigState>({
  selectId: (c) => c.id,
});

const widgetConfigSlice = createSlice({
  name: "widgetConfig",
  initialState: widgetConfigAdapter.getInitialState(),
  reducers: {
    setWidgetConfig(
      state,
      action: PayloadAction<ChartWidgetConfig>
    ) {
      widgetConfigAdapter.upsertOne(state, {
        id: action.payload.id,
        config: action.payload,
        isDirty: false,
      });
    },
    updateWidgetConfig(
      state,
      action: PayloadAction<{
        id: string;
        patch: Partial<ChartWidgetConfig>;
      }>
    ) {
      const existing = state.entities[action.payload.id];
      if (existing) {
        widgetConfigAdapter.updateOne(state, {
          id: action.payload.id,
          changes: {
            config: { ...existing.config, ...action.payload.patch },
            isDirty: true,
          },
        });
      }
    },
    markConfigClean(state, action: PayloadAction<string>) {
      widgetConfigAdapter.updateOne(state, {
        id: action.payload,
        changes: { isDirty: false },
      });
    },
    removeWidgetConfig(state, action: PayloadAction<string>) {
      widgetConfigAdapter.removeOne(state, action.payload);
    },
  },
});

// ─── 6. Event Bus Slice ───────────────────────────────────────

const eventBusSlice = createSlice({
  name: "eventBus",
  initialState: {
    events: [] as EventBusMessage[],
    /** Keep only last 50 events to avoid memory growth */
    maxEvents: 50,
  },
  reducers: {
    publishEvent(state, action: PayloadAction<Omit<EventBusMessage, "id" | "timestamp">>) {
      const event: EventBusMessage = {
        ...action.payload,
        id: uuidv4(),
        timestamp: Date.now(),
      };
      state.events = [...state.events.slice(-(state.maxEvents - 1)), event];
    },
    clearEvents(state) {
      state.events = [];
    },
    setMaxEvents(state, action: PayloadAction<number>) {
      state.maxEvents = action.payload;
    },
  },
});

// ─── 7. Theme Slice ───────────────────────────────────────────

const getSystemPreference = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const themeSlice = createSlice({
  name: "theme",
  initialState: (): ThemeState => {
    const systemPreference = getSystemPreference();
    return {
      mode: "light" as ThemeMode,
      systemPreference,
      resolved: LIGHT_THEME,
    };
  },
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      state.resolved = resolveTheme(
        action.payload,
        state.systemPreference,
        state.customTokens
      );
    },
    setSystemPreference(state, action: PayloadAction<"light" | "dark">) {
      state.systemPreference = action.payload;
      if (state.mode === "system") {
        state.resolved = resolveTheme(
          state.mode,
          action.payload,
          state.customTokens
        );
      }
    },
    setCustomTokens(
      state,
      action: PayloadAction<Record<string, string> | undefined>
    ) {
      state.customTokens = action.payload;
      state.resolved = resolveTheme(
        state.mode,
        state.systemPreference,
        action.payload
      );
    },
  },
});

// ─── 8. Drilldown Slice ───────────────────────────────────────

const drilldownAdapter = createEntityAdapter<DrilldownState>({
  selectId: (d) => d.widgetId,
});

const drilldownSlice = createSlice({
  name: "drilldown",
  initialState: drilldownAdapter.getInitialState(),
  reducers: {
    pushDrilldown(
      state,
      action: PayloadAction<{
        widgetId: string;
        level: DrilldownLevel;
        filter: FilterCondition;
      }>
    ) {
      const existing = state.entities[action.payload.widgetId];
      const stack = existing?.stack ?? [];
      drilldownAdapter.upsertOne(state, {
        widgetId: action.payload.widgetId,
        stack: [
          ...stack,
          {
            level: action.payload.level,
            filter: action.payload.filter,
            timestamp: Date.now(),
          },
        ],
      });
    },
    popDrilldown(state, action: PayloadAction<string>) {
      const existing = state.entities[action.payload];
      if (existing && existing.stack.length > 0) {
        drilldownAdapter.updateOne(state, {
          id: action.payload,
          changes: {
            stack: existing.stack.slice(0, -1),
          },
        });
      }
    },
    resetDrilldown(state, action: PayloadAction<string>) {
      drilldownAdapter.upsertOne(state, {
        widgetId: action.payload,
        stack: [],
      });
    },
  },
});

// ─── Store Assembly ───────────────────────────────────────────

export const store = configureStore({
  reducer: {
    dashboard: dashboardSlice.reducer,
    globalFilter: globalFilterSlice.reducer,
    widgetFilter: widgetFilterSlice.reducer,
    chartWidget: chartWidgetSlice.reducer,
    widgetConfig: widgetConfigSlice.reducer,
    eventBus: eventBusSlice.reducer,
    theme: themeSlice.reducer,
    drilldown: drilldownSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // dataProvider functions in config are non-serializable — OK
        ignoredPaths: ["widgetConfig.entities"],
        ignoredActionPaths: ["payload.config.dataSource.dataProvider"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ─── Action Exports ───────────────────────────────────────────

export const dashboardActions = dashboardSlice.actions;
export const globalFilterActions = globalFilterSlice.actions;
export const widgetFilterActions = widgetFilterSlice.actions;
export const chartWidgetActions = chartWidgetSlice.actions;
export const widgetConfigActions = widgetConfigSlice.actions;
export const eventBusActions = eventBusSlice.actions;
export const themeActions = themeSlice.actions;
export const drilldownActions = drilldownSlice.actions;

// ─── Base Selectors ───────────────────────────────────────────

const { selectAll: selectAllWidgetStates, selectById: selectWidgetStateById } =
  chartWidgetAdapter.getSelectors((state: RootState) => state.chartWidget);

const { selectById: selectWidgetFilterById } =
  widgetFilterAdapter.getSelectors((state: RootState) => state.widgetFilter);

const { selectById: selectWidgetConfigById } =
  widgetConfigAdapter.getSelectors((state: RootState) => state.widgetConfig);

const { selectById: selectDrilldownById } =
  drilldownAdapter.getSelectors((state: RootState) => state.drilldown);

// ─── Memoized Selectors ───────────────────────────────────────

export const selectGlobalFilters = (state: RootState) =>
  state.globalFilter.filters;

export const selectTheme = (state: RootState) => state.theme.resolved;
export const selectThemeMode = (state: RootState) => state.theme.mode;

export const selectEventBusEvents = (state: RootState) =>
  state.eventBus.events;

export const selectLatestEvent = createSelector(
  selectEventBusEvents,
  (events) => events[events.length - 1] ?? null
);

export const selectWidgetFilters = (widgetId: string) =>
  createSelector(
    (state: RootState) => selectWidgetFilterById(state, widgetId),
    (entry) => entry?.filters ?? []
  );

export const selectWidgetData = (widgetId: string) =>
  createSelector(
    (state: RootState) => selectWidgetStateById(state, widgetId),
    (ws) => ws?.data ?? []
  );

export const selectWidgetStatus = (widgetId: string) =>
  createSelector(
    (state: RootState) => selectWidgetStateById(state, widgetId),
    (ws) => ws?.status ?? "idle"
  );

export const selectWidgetError = (widgetId: string) =>
  createSelector(
    (state: RootState) => selectWidgetStateById(state, widgetId),
    (ws) => ws?.error ?? null
  );

export const selectWidgetConfig = (widgetId: string) =>
  createSelector(
    (state: RootState) => selectWidgetConfigById(state, widgetId),
    (entry) => entry?.config ?? null
  );

export const selectWidgetIsFullscreen = (widgetId: string) =>
  createSelector(
    (state: RootState) => selectWidgetStateById(state, widgetId),
    (ws) => ws?.isFullscreen ?? false
  );

export const selectWidgetLegendVisible = (widgetId: string) =>
  createSelector(
    (state: RootState) => selectWidgetStateById(state, widgetId),
    (ws) => ws?.legendVisible ?? true
  );

export const selectDrilldownStack = (widgetId: string) =>
  createSelector(
    (state: RootState) => selectDrilldownById(state, widgetId),
    (d) => d?.stack ?? []
  );

export const selectMergedFilters = (
  widgetId: string,
  strategy: FilterMergeStrategy = "combine"
) =>
  createSelector(
    selectGlobalFilters,
    (state: RootState) => selectWidgetFilterById(state, widgetId),
    (global, widgetEntry) =>
      mergeFilters(global, widgetEntry?.filters ?? [], strategy)
  );

export const selectLastEventByType = (type: ChartEventType) =>
  createSelector(selectEventBusEvents, (events) =>
    [...events].reverse().find((e) => e.type === type) ?? null
  );

export const selectEventsForWidget = (widgetId: string) =>
  createSelector(selectEventBusEvents, (events) =>
    events.filter(
      (e) =>
        e.sourceWidgetId === widgetId || e.targetWidgetId === widgetId
    )
  );
