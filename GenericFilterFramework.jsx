import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";

// ─── Demo Filter Config ────────────────────────────────────────────────────
const DEMO_CONFIG = [
  {
    id: "country", key: "country", label: "Country", type: "multi-select", scope: "global", order: 1,
    defaultValue: ["India"],
    ui: { width: "medium" },
    behavior: { required: false, clearable: true, visible: true },
    dataSource: { type: "static", options: [
      { label: "India", value: "India" }, { label: "USA", value: "USA" },
      { label: "UK", value: "UK" }, { label: "Germany", value: "Germany" },
      { label: "Australia", value: "Australia" }, { label: "Canada", value: "Canada" },
      { label: "Japan", value: "Japan" }, { label: "Brazil", value: "Brazil" },
    ]},
    queryMapping: { field: "country", operator: "in" }
  },
  {
    id: "region", key: "region", label: "Region", type: "single-select", scope: "global", order: 2,
    defaultValue: null,
    dependsOn: ["country"],
    ui: { width: "medium" },
    behavior: { required: false, clearable: true, visible: true },
    dataSource: { type: "dynamic" },
    queryMapping: { field: "region", operator: "equals" }
  },
  {
    id: "dateRange", key: "date_range", label: "Date Range", type: "date-range", scope: "global", order: 3,
    defaultValue: { from: "2025-01-01", to: "2025-12-31" },
    ui: { width: "large" },
    behavior: { required: false, clearable: true, visible: true },
    dataSource: { type: "static", options: [] },
    queryMapping: { field: "date", operator: "between" }
  },
  {
    id: "salesMin", key: "sales", label: "Min Sales", type: "comparison", scope: "global", order: 4,
    defaultValue: null,
    ui: { width: "medium" },
    behavior: { required: false, clearable: true, visible: true },
    dataSource: { type: "static", options: [] },
    queryMapping: { field: "sales", operator: "gte" }
  },
  {
    id: "usSales", key: "us_sales", label: "US Sales", type: "radio-group", scope: "global", order: 5,
    defaultValue: null,
    ui: { width: "small", variant: "inline" },
    behavior: { required: false, clearable: true, visible: true },
    dataSource: { type: "static", options: [
      { label: "Yes", value: true }, { label: "No", value: false }
    ]},
    queryMapping: { field: "us_sales", operator: "equals" }
  },
  {
    id: "status", key: "status", label: "Status", type: "checkbox-group", scope: "global", order: 6,
    defaultValue: [],
    ui: { width: "medium" },
    behavior: { required: false, clearable: true, visible: true },
    dataSource: { type: "static", options: [
      { label: "Active", value: "active" }, { label: "Pending", value: "pending" },
      { label: "Closed", value: "closed" }, { label: "On Hold", value: "on_hold" }
    ]},
    queryMapping: { field: "status", operator: "in" }
  },
  {
    id: "category", key: "category", label: "Category", type: "text", scope: "chart", order: 7,
    defaultValue: "",
    ui: { width: "medium" },
    behavior: { required: false, clearable: true, visible: true },
    dataSource: { type: "static", options: [] },
    queryMapping: { field: "category", operator: "contains" }
  },
  {
    id: "revenueRange", key: "revenue", label: "Revenue Range", type: "between", scope: "global", order: 8,
    defaultValue: null,
    ui: { width: "large" },
    behavior: { required: false, clearable: true, visible: true },
    visibleWhen: { country: "USA" },
    dataSource: { type: "static", options: [] },
    queryMapping: { field: "revenue", operator: "between" }
  },
  {
    id: "rmTeam", key: "rm_team", label: "RM Team", type: "multi-select", scope: "global", order: 9,
    defaultValue: [],
    ui: { width: "medium" },
    behavior: { required: false, clearable: true, visible: true },
    dataSource: {
      type: "api",
      endpoint: "/api/rm-teams",
      method: "GET",
      labelField: "name",
      valueField: "id"
    },
    queryMapping: { field: "rm_team", operator: "in" }
  },
];

// ─── Mock API / Dynamic Data ───────────────────────────────────────────────
const REGION_MAP = {
  India: ["North", "South", "East", "West"],
  USA: ["Northeast", "Southeast", "Midwest", "West Coast"],
  UK: ["England", "Scotland", "Wales", "N. Ireland"],
  Germany: ["Bavaria", "Berlin", "Hamburg", "Saxony"],
  Australia: ["NSW", "VIC", "QLD", "WA"],
  Canada: ["Ontario", "Quebec", "BC", "Alberta"],
  Japan: ["Kanto", "Kansai", "Chubu", "Kyushu"],
  Brazil: ["Southeast", "Northeast", "South", "North"],
};

const mockFetchOptions = (config, currentFilters) =>
  new Promise((resolve) => {
    setTimeout(() => {
      if (config.dataSource?.endpoint?.includes("rm-teams")) {
        resolve([
          { id: "t1", name: "Alpha Team" }, { id: "t2", name: "Beta Team" },
          { id: "t3", name: "Gamma Team" }, { id: "t4", name: "Delta Team" },
        ]);
      } else {
        resolve([]);
      }
    }, 800 + Math.random() * 400);
  });

// ─── Cache & Abort ─────────────────────────────────────────────────────────
const optionCache = new Map();
const activeControllers = new Map();

async function fetchFilterOptions(config, currentFilters, onSuccess, onError, onLoading) {
  const cacheKey = JSON.stringify({ id: config.id, deps: config.dependsOn?.map(d => currentFilters[d]) });
  if (optionCache.has(cacheKey)) { onSuccess(optionCache.get(cacheKey)); return; }
  if (activeControllers.has(config.id)) activeControllers.get(config.id).abort();
  const controller = new AbortController();
  activeControllers.set(config.id, controller);
  onLoading(true);
  try {
    const data = await mockFetchOptions(config, currentFilters);
    if (!controller.signal.aborted) {
      optionCache.set(cacheKey, data);
      onSuccess(data);
    }
  } catch (e) {
    if (!controller.signal.aborted) onError(e.message || "Failed to load options");
  } finally {
    if (!controller.signal.aborted) onLoading(false);
  }
}

// ─── Query Builder ─────────────────────────────────────────────────────────
function buildQuery(config, value) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return null;
  const { field, operator } = config.queryMapping;
  return { field, operator, value };
}

function buildAllQueries(filterConfigs, filterState) {
  return filterConfigs
    .map(c => buildQuery(c, filterState[c.key]))
    .filter(Boolean);
}

// ─── Visibility & Enable evaluators ───────────────────────────────────────
function evaluateCondition(rules, filterState) {
  if (!rules) return true;
  return Object.entries(rules).every(([key, val]) => {
    const v = filterState[key];
    if (Array.isArray(v)) return v.includes(val);
    return v === val;
  });
}

// ─── Persistence ───────────────────────────────────────────────────────────
function persistToURL(state) {
  const params = new URLSearchParams();
  Object.entries(state).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") {
      params.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    }
  });
  window.history?.replaceState?.({}, "", `?${params.toString()}`);
}

function persistToStorage(key, state) {
  try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
}

function loadFromStorage(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}

// ─── Individual Filter Components ─────────────────────────────────────────
const MultiSelect = memo(({ config, value, onChange, options, loading, error }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const vals = value || [];
  const filtered = useMemo(() =>
    options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())), [options, search]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = useCallback((v) => {
    onChange(vals.includes(v) ? vals.filter(x => x !== v) : [...vals, v]);
  }, [vals, onChange]);

  const selectAll = () => onChange(options.map(o => o.value));
  const clearAll = () => onChange([]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          minHeight: 36, padding: "4px 10px", border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-md)", cursor: "pointer", display: "flex",
          flexWrap: "wrap", gap: 4, alignItems: "center", background: "var(--color-background-primary)",
          fontSize: 13
        }}
      >
        {vals.length === 0
          ? <span style={{ color: "var(--color-text-tertiary)" }}>Select...</span>
          : vals.map(v => {
            const opt = options.find(o => o.value === v);
            return (
              <span key={v} style={{
                background: "var(--color-background-info)", color: "var(--color-text-info)",
                borderRadius: "var(--border-radius-md)", padding: "2px 8px", fontSize: 12, display: "flex", gap: 4, alignItems: "center"
              }}>
                {opt?.label || v}
                <span onClick={e => { e.stopPropagation(); toggle(v); }} style={{ cursor: "pointer", fontWeight: 500 }}>×</span>
              </span>
            );
          })
        }
        <span style={{ marginLeft: "auto", color: "var(--color-text-tertiary)" }}>▾</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-md)", marginTop: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          maxHeight: 220, overflow: "hidden", display: "flex", flexDirection: "column"
        }}>
          <div style={{ padding: "8px 8px 4px" }}>
            <input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", fontSize: 13, padding: "4px 8px" }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div style={{ display: "flex", gap: 8, padding: "0 8px 6px" }}>
            <button onClick={e => { e.stopPropagation(); selectAll(); }} style={{ fontSize: 11, padding: "2px 8px" }}>All</button>
            <button onClick={e => { e.stopPropagation(); clearAll(); }} style={{ fontSize: 11, padding: "2px 8px" }}>None</button>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading && <div style={{ padding: "12px 12px", fontSize: 13, color: "var(--color-text-secondary)" }}>Loading...</div>}
            {error && <div style={{ padding: "12px 12px", fontSize: 13, color: "var(--color-text-danger)" }}>{error}</div>}
            {filtered.map(opt => (
              <div
                key={String(opt.value)}
                onClick={() => toggle(opt.value)}
                style={{
                  padding: "7px 12px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  background: vals.includes(opt.value) ? "var(--color-background-info)" : "transparent",
                  color: vals.includes(opt.value) ? "var(--color-text-info)" : "var(--color-text-primary)"
                }}
              >
                <span style={{
                  width: 14, height: 14, border: "1.5px solid", borderColor: vals.includes(opt.value) ? "var(--color-text-info)" : "var(--color-border-primary)",
                  borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  {vals.includes(opt.value) && <span style={{ fontSize: 10, lineHeight: 1 }}>✓</span>}
                </span>
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const SingleSelect = memo(({ config, value, onChange, options, loading, error }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          height: 36, padding: "0 10px", border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-md)", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "space-between", background: "var(--color-background-primary)", fontSize: 13
        }}
      >
        <span style={{ color: selected ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>
          {selected ? selected.label : "Select..."}
        </span>
        <span style={{ color: "var(--color-text-tertiary)", display: "flex", gap: 4 }}>
          {value && config.behavior?.clearable && (
            <span onClick={e => { e.stopPropagation(); onChange(null); }} style={{ cursor: "pointer" }}>×</span>
          )}
          ▾
        </span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)",
          borderRadius: "var(--border-radius-md)", marginTop: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          maxHeight: 200, overflow: "hidden", display: "flex", flexDirection: "column"
        }}>
          <div style={{ padding: "6px 8px" }}>
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", fontSize: 13, padding: "4px 8px" }} onClick={e => e.stopPropagation()} />
          </div>
          <div style={{ overflowY: "auto" }}>
            {loading && <div style={{ padding: "10px 12px", fontSize: 13, color: "var(--color-text-secondary)" }}>Loading...</div>}
            {error && <div style={{ padding: "10px 12px", fontSize: 13, color: "var(--color-text-danger)" }}>{error}</div>}
            {filtered.map(opt => (
              <div key={String(opt.value)} onClick={() => { onChange(opt.value); setOpen(false); }} style={{
                padding: "7px 12px", fontSize: 13, cursor: "pointer",
                background: value === opt.value ? "var(--color-background-info)" : "transparent",
                color: value === opt.value ? "var(--color-text-info)" : "var(--color-text-primary)"
              }}>
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const RadioGroup = memo(({ config, value, onChange, options }) => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {options.map(opt => (
      <label key={String(opt.value)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
        <input
          type="radio"
          name={config.id}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          style={{ accentColor: "var(--color-text-info)" }}
        />
        {opt.label}
      </label>
    ))}
    {config.behavior?.clearable && value !== null && (
      <button onClick={() => onChange(null)} style={{ fontSize: 11, padding: "2px 8px" }}>Clear</button>
    )}
  </div>
));

const CheckboxGroup = memo(({ config, value, onChange, options }) => {
  const vals = value || [];
  const toggle = (v) => onChange(vals.includes(v) ? vals.filter(x => x !== v) : [...vals, v]);
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map(opt => (
        <label key={String(opt.value)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
          <input type="checkbox" checked={vals.includes(opt.value)} onChange={() => toggle(opt.value)} style={{ accentColor: "var(--color-text-info)" }} />
          {opt.label}
        </label>
      ))}
    </div>
  );
});

const DateRangeFilter = memo(({ value, onChange }) => {
  const v = value || {};
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input type="date" value={v.from || ""} onChange={e => onChange({ ...v, from: e.target.value })} style={{ fontSize: 13 }} />
      <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>to</span>
      <input type="date" value={v.to || ""} onChange={e => onChange({ ...v, to: e.target.value })} style={{ fontSize: 13 }} />
    </div>
  );
});

const ComparisonFilter = memo(({ value, onChange }) => {
  const v = value || { operator: ">=", value: "" };
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <select value={v.operator} onChange={e => onChange({ ...v, operator: e.target.value })} style={{ fontSize: 13, height: 36, padding: "0 8px" }}>
        {[">=", "<=", "=", ">", "<"].map(op => <option key={op} value={op}>{op}</option>)}
      </select>
      <input
        type="number"
        placeholder="Value"
        value={v.value}
        onChange={e => onChange({ ...v, value: e.target.value })}
        style={{ fontSize: 13, width: 100 }}
      />
    </div>
  );
});

const BetweenFilter = memo(({ value, onChange }) => {
  const v = value || { min: "", max: "" };
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input type="number" placeholder="Min" value={v.min} onChange={e => onChange({ ...v, min: e.target.value })} style={{ fontSize: 13, width: 90 }} />
      <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>–</span>
      <input type="number" placeholder="Max" value={v.max} onChange={e => onChange({ ...v, max: e.target.value })} style={{ fontSize: 13, width: 90 }} />
    </div>
  );
});

const TextFilter = memo(({ config, value, onChange }) => (
  <input
    type="text"
    placeholder={`Search ${config.label.toLowerCase()}...`}
    value={value || ""}
    onChange={e => onChange(e.target.value)}
    style={{ fontSize: 13, height: 36, padding: "0 10px", width: "100%" }}
  />
));

// Skeleton loader
const Skeleton = () => (
  <div style={{
    height: 36, borderRadius: "var(--border-radius-md)",
    background: "var(--color-background-secondary)",
    animation: "pulse 1.5s ease-in-out infinite"
  }} />
);

// ─── Single Filter Renderer ────────────────────────────────────────────────
const FilterItem = memo(({ config, value, onChange, dynamicOptions, filterState, apiOptions, apiLoading, apiErrors }) => {
  const isVisible = useMemo(() => evaluateCondition(config.visibleWhen, filterState), [config.visibleWhen, filterState]);
  const isEnabled = useMemo(() => evaluateCondition(config.enabledWhen, filterState), [config.enabledWhen, filterState]);
  if (!isVisible) return null;

  const getOptions = () => {
    if (config.dataSource?.type === "static") return config.dataSource.options || [];
    if (config.dataSource?.type === "dynamic") {
      const dynOpts = dynamicOptions?.[config.key] || [];
      return dynOpts.map(o => typeof o === "string" ? { label: o, value: o } : o);
    }
    if (config.dataSource?.type === "api") return apiOptions[config.id] || [];
    return [];
  };

  const options = getOptions();
  const loading = apiLoading[config.id] || false;
  const error = apiErrors[config.id] || null;

  const renderControl = () => {
    if (loading && options.length === 0) return <Skeleton />;
    switch (config.type) {
      case "multi-select": return <MultiSelect config={config} value={value} onChange={onChange} options={options} loading={loading} error={error} />;
      case "single-select": return <SingleSelect config={config} value={value} onChange={onChange} options={options} loading={loading} error={error} />;
      case "radio-group": return <RadioGroup config={config} value={value} onChange={onChange} options={options} />;
      case "checkbox-group": return <CheckboxGroup config={config} value={value} onChange={onChange} options={options} />;
      case "date-range": return <DateRangeFilter value={value} onChange={onChange} />;
      case "comparison": return <ComparisonFilter value={value} onChange={onChange} />;
      case "between": return <BetweenFilter value={value} onChange={onChange} />;
      case "text": return <TextFilter config={config} value={value} onChange={onChange} />;
      default: return <TextFilter config={config} value={value} onChange={onChange} />;
    }
  };

  return (
    <div style={{ opacity: isEnabled ? 1 : 0.45, pointerEvents: isEnabled ? "auto" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", letterSpacing: "0.03em" }}>
          {config.label.toUpperCase()}
          {config.behavior?.required && <span style={{ color: "var(--color-text-danger)", marginLeft: 3 }}>*</span>}
        </label>
        {config.scope === "chart" && (
          <span style={{
            fontSize: 10, padding: "2px 6px", borderRadius: 4,
            background: "var(--color-background-warning)", color: "var(--color-text-warning)", fontWeight: 500
          }}>chart</span>
        )}
      </div>
      {renderControl()}
    </div>
  );
});

// ─── Applied Filter Chips ──────────────────────────────────────────────────
const FilterChip = memo(({ config, value, onRemove }) => {
  const label = () => {
    if (!value && value !== false) return null;
    if (Array.isArray(value) && value.length === 0) return null;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      if (value.from && value.to) return `${value.from} → ${value.to}`;
      if (value.operator && value.value !== "") return `${value.operator} ${value.value}`;
      if (value.min !== undefined || value.max !== undefined) return `${value.min || "?"} – ${value.max || "?"}`;
    }
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };
  const text = label();
  if (!text) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
      background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)",
      borderRadius: 999, fontSize: 12, color: "var(--color-text-primary)"
    }}>
      <span style={{ color: "var(--color-text-secondary)", fontWeight: 500 }}>{config.label}:</span>
      <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</span>
      <button onClick={() => onRemove(config.key)} style={{
        border: "none", background: "none", cursor: "pointer", padding: 0,
        color: "var(--color-text-secondary)", fontSize: 14, lineHeight: 1, fontWeight: 400
      }}>×</button>
    </span>
  );
});

// ─── Main GenericFilter Component ─────────────────────────────────────────
export default function GenericFilter({ config = DEMO_CONFIG, dynamicOptions = {}, persistenceKey = "dashboardFilters", onFilterChange }) {
  const sorted = useMemo(() => [...config].sort((a, b) => (a.order || 0) - (b.order || 0)), [config]);

  // Build initial state from defaultValues or storage
  const buildInitialState = useCallback(() => {
    const saved = loadFromStorage(persistenceKey);
    const initial = {};
    sorted.forEach(c => {
      initial[c.key] = saved[c.key] !== undefined ? saved[c.key] : (c.defaultValue ?? null);
    });
    return initial;
  }, [sorted, persistenceKey]);

  const [filterState, setFilterState] = useState(buildInitialState);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [apiOptions, setApiOptions] = useState({});
  const [apiLoading, setApiLoading] = useState({});
  const [apiErrors, setApiErrors] = useState({});
  const [queryOutput, setQueryOutput] = useState([]);
  const [activeTab, setActiveTab] = useState("filters");
  const prevFilterState = useRef({});

  // Inject dynamic region options
  const computedDynamicOptions = useMemo(() => {
    const countryVal = filterState["country"];
    const regions = countryVal
      ? (Array.isArray(countryVal) ? countryVal : [countryVal])
          .flatMap(c => (REGION_MAP[c] || []).map(r => ({ label: r, value: r })))
      : [];
    return { ...dynamicOptions, region: regions };
  }, [filterState, dynamicOptions]);

  // Fetch API-based options
  useEffect(() => {
    sorted.forEach(c => {
      if (c.dataSource?.type !== "api") return;
      const depsChanged = (c.dependsOn || []).some(d => prevFilterState.current[d] !== filterState[d]);
      const notYetLoaded = !apiOptions[c.id];
      if (!notYetLoaded && !depsChanged) return;
      fetchFilterOptions(
        c, filterState,
        (data) => {
          const mapped = data.map(o => ({ label: o[c.dataSource.labelField] || o.label, value: o[c.dataSource.valueField] || o.value }));
          setApiOptions(prev => ({ ...prev, [c.id]: mapped }));
          setApiErrors(prev => ({ ...prev, [c.id]: null }));
        },
        (err) => setApiErrors(prev => ({ ...prev, [c.id]: err })),
        (loading) => setApiLoading(prev => ({ ...prev, [c.id]: loading }))
      );
    });
    prevFilterState.current = { ...filterState };
  }, [filterState, sorted]);

  // Reset dependent filters when parent changes
  const resetDependents = useCallback((changedKey) => {
    const deps = sorted.filter(c => c.dependsOn?.includes(changedKey));
    if (deps.length === 0) return {};
    const resets = {};
    deps.forEach(c => { resets[c.key] = c.defaultValue ?? null; });
    return resets;
  }, [sorted]);

  const handleChange = useCallback((key, value) => {
    setFilterState(prev => {
      const resets = resetDependents(key);
      const next = { ...prev, [key]: value, ...resets };
      persistToStorage(persistenceKey, next);
      return next;
    });
  }, [resetDependents, persistenceKey]);

  const handleRemove = useCallback((key) => {
    const cfg = sorted.find(c => c.key === key);
    handleChange(key, cfg?.defaultValue ?? null);
  }, [sorted, handleChange]);

  const resetAll = useCallback(() => {
    const initial = {};
    sorted.forEach(c => { initial[c.key] = c.defaultValue ?? null; });
    setFilterState(initial);
    persistToStorage(persistenceKey, initial);
  }, [sorted, persistenceKey]);

  // Rebuild query on filter change
  useEffect(() => {
    const queries = buildAllQueries(sorted, filterState);
    setQueryOutput(queries);
    onFilterChange?.(filterState, queries);
    persistToURL(filterState);
  }, [filterState, sorted, onFilterChange]);

  // Active filter count
  const activeCount = useMemo(() => {
    return sorted.filter(c => {
      const v = filterState[c.key];
      if (v === null || v === undefined || v === "") return false;
      if (Array.isArray(v) && v.length === 0) return false;
      if (typeof v === "object" && v !== null) {
        const vals = Object.values(v);
        return vals.some(x => x !== "" && x !== null && x !== undefined);
      }
      return true;
    }).length;
  }, [filterState, sorted]);

  // Visible chips
  const chips = useMemo(() => sorted.filter(c => {
    const v = filterState[c.key];
    if (v === null || v === undefined || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  }), [sorted, filterState]);

  // Primary (top 5 visible) vs drawer filters
  const primaryFilters = sorted.filter((_, i) => i < 5);
  const drawerFilters = sorted.slice(5);

  const renderFilters = (filters) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px 20px" }}>
      {filters.map(c => (
        <FilterItem
          key={c.id}
          config={c}
          value={filterState[c.key]}
          onChange={(v) => handleChange(c.key, v)}
          dynamicOptions={computedDynamicOptions}
          filterState={filterState}
          apiOptions={apiOptions}
          apiLoading={apiLoading}
          apiErrors={apiErrors}
        />
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Filters</span>
          {activeCount > 0 && (
            <span style={{
              background: "var(--color-background-info)", color: "var(--color-text-info)",
              borderRadius: 999, fontSize: 11, fontWeight: 500, padding: "2px 8px", minWidth: 22, textAlign: "center"
            }}>{activeCount}</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {activeCount > 0 && (
            <button onClick={resetAll} style={{ fontSize: 12, padding: "4px 12px", color: "var(--color-text-danger)" }}>
              Reset all
            </button>
          )}
          <button onClick={() => setDrawerOpen(true)} style={{ fontSize: 12, padding: "4px 12px" }}>
            More filters {drawerFilters.length > 0 && `(${drawerFilters.length})`}
          </button>
        </div>
      </div>

      {/* Primary filters */}
      {renderFilters(primaryFilters)}

      {/* Applied chips */}
      {chips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {chips.map(c => (
            <FilterChip key={c.id} config={c} value={filterState[c.key]} onRemove={handleRemove} />
          ))}
        </div>
      )}

      {/* More Filters Drawer */}
      {drawerOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999, display: "flex", justifyContent: "flex-end"
        }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.35)" }} onClick={() => setDrawerOpen(false)} />
          <div style={{
            width: 380, background: "var(--color-background-primary)",
            borderLeft: "0.5px solid var(--color-border-secondary)",
            display: "flex", flexDirection: "column",
            animation: "slideIn 0.22s ease-out"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>More Filters</span>
              <button onClick={() => setDrawerOpen(false)} style={{ fontSize: 18, padding: "2px 8px" }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
              {drawerFilters.map(c => (
                <FilterItem
                  key={c.id}
                  config={c}
                  value={filterState[c.key]}
                  onChange={(v) => handleChange(c.key, v)}
                  dynamicOptions={computedDynamicOptions}
                  filterState={filterState}
                  apiOptions={apiOptions}
                  apiLoading={apiLoading}
                  apiErrors={apiErrors}
                />
              ))}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
              <button onClick={() => setDrawerOpen(false)} style={{ width: "100%", padding: "8px", fontSize: 13, fontWeight: 500 }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Query Output & Debug Panel */}
      <div style={{
        marginTop: 24, border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          {["filters", "query", "config"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px", fontSize: 12, fontWeight: 500, border: "none",
                borderBottom: activeTab === tab ? "2px solid var(--color-text-info)" : "2px solid transparent",
                background: "transparent", cursor: "pointer",
                color: activeTab === tab ? "var(--color-text-info)" : "var(--color-text-secondary)"
              }}
            >
              {tab === "filters" ? "Filter state" : tab === "query" ? "Query output" : "Config"}
            </button>
          ))}
        </div>
        <pre style={{
          margin: 0, padding: "14px 16px", fontSize: 12, lineHeight: 1.7,
          background: "var(--color-background-secondary)", overflowX: "auto", maxHeight: 240,
          color: "var(--color-text-primary)"
        }}>
          {activeTab === "filters" && JSON.stringify(
            Object.fromEntries(Object.entries(filterState).filter(([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0))),
            null, 2
          )}
          {activeTab === "query" && JSON.stringify(queryOutput, null, 2)}
          {activeTab === "config" && JSON.stringify(config.slice(0, 3), null, 2)}
        </pre>
      </div>
    </div>
  );
}
