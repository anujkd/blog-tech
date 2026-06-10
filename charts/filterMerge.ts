// ============================================================
// FILTER MERGE ENGINE
// Handles combine / widget-overrides-global / global-overrides-widget
// ============================================================

import type {
  FilterCondition,
  FilterMergeStrategy,
  FilterOperator,
  FilterValue,
  DateRangeValue,
} from "../types";

// ─── Core Merge Logic ─────────────────────────────────────────

/**
 * Merges global and widget-level filters using the specified strategy.
 *
 * Strategy behaviour:
 *   combine                — union; widget filter ADDS to global (no dedup, same field can appear twice)
 *   widget-overrides-global — same-field widget filter wins; extra globals kept
 *   global-overrides-widget — same-field global filter wins; extra widget filters kept
 */
export function mergeFilters(
  globalFilters: FilterCondition[],
  widgetFilters: FilterCondition[],
  strategy: FilterMergeStrategy = "combine"
): FilterCondition[] {
  if (!globalFilters.length && !widgetFilters.length) return [];

  switch (strategy) {
    case "combine":
      return combineFilters(globalFilters, widgetFilters);
    case "widget-overrides-global":
      return overrideFilters(globalFilters, widgetFilters, "widget");
    case "global-overrides-widget":
      return overrideFilters(globalFilters, widgetFilters, "global");
    default:
      return combineFilters(globalFilters, widgetFilters);
  }
}

/** Union — same field can appear in both, both are kept */
function combineFilters(
  global: FilterCondition[],
  widget: FilterCondition[]
): FilterCondition[] {
  return [...global, ...widget];
}

/**
 * Override — when the same field exists in both, the winner's filter replaces the other.
 * Filters unique to either source are all kept.
 */
function overrideFilters(
  global: FilterCondition[],
  widget: FilterCondition[],
  winner: "global" | "widget"
): FilterCondition[] {
  const globalMap = new Map(global.map((f) => [f.field, f]));
  const widgetMap = new Map(widget.map((f) => [f.field, f]));

  const merged = new Map<string, FilterCondition>();

  // Start with globals
  globalMap.forEach((f, field) => merged.set(field, f));

  // Apply widget filters, honouring override strategy
  widgetMap.forEach((f, field) => {
    if (merged.has(field)) {
      // Both define this field — winner takes it
      if (winner === "widget") {
        merged.set(field, f);
      }
      // else keep global (already in map)
    } else {
      // Unique to widget — always keep
      merged.set(field, f);
    }
  });

  return Array.from(merged.values());
}

// ─── Filter Validation ────────────────────────────────────────

export interface FilterValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateFilter(
  filter: FilterCondition
): FilterValidationResult {
  const errors: string[] = [];

  if (!filter.field?.trim()) {
    errors.push("Filter field is required");
  }

  if (!filter.operator) {
    errors.push("Filter operator is required");
  }

  const valueRequiredOps: FilterOperator[] = [
    "equals", "not_equals", "in", "not_in", "contains",
    "starts_with", "ends_with", "greater_than", "greater_than_or_equal",
    "less_than", "less_than_or_equal", "between",
  ];

  const noValueOps: FilterOperator[] = ["exists", "not_exists"];

  if (
    valueRequiredOps.includes(filter.operator) &&
    (filter.value === null || filter.value === undefined || filter.value === "")
  ) {
    errors.push(`Operator "${filter.operator}" requires a value`);
  }

  if (filter.operator === "between") {
    const v = filter.value as DateRangeValue;
    if (!v?.from || !v?.to) {
      errors.push('Operator "between" requires { from, to }');
    }
  }

  if (filter.operator === "in" || filter.operator === "not_in") {
    if (!Array.isArray(filter.value) || filter.value.length === 0) {
      errors.push(`Operator "${filter.operator}" requires a non-empty array`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateFilters(
  filters: FilterCondition[]
): FilterValidationResult {
  const errors: string[] = [];
  filters.forEach((f, i) => {
    const result = validateFilter(f);
    if (!result.valid) {
      result.errors.forEach((e) => errors.push(`[${i}] ${e}`));
    }
  });
  return { valid: errors.length === 0, errors };
}

// ─── Filter Matcher (in-memory data filtering) ───────────────

/**
 * Tests a single data record against a filter condition.
 * Used for static/local data transformation.
 */
export function matchesFilter(
  record: Record<string, unknown>,
  filter: FilterCondition
): boolean {
  const recordValue = record[filter.field];

  switch (filter.operator) {
    case "equals":
      return recordValue == filter.value; // loose equality for type coercion

    case "not_equals":
      return recordValue != filter.value;

    case "in":
      return Array.isArray(filter.value) &&
        (filter.value as unknown[]).includes(recordValue);

    case "not_in":
      return Array.isArray(filter.value) &&
        !(filter.value as unknown[]).includes(recordValue);

    case "contains":
      return typeof recordValue === "string" &&
        typeof filter.value === "string" &&
        recordValue.toLowerCase().includes((filter.value as string).toLowerCase());

    case "starts_with":
      return typeof recordValue === "string" &&
        typeof filter.value === "string" &&
        recordValue.toLowerCase().startsWith((filter.value as string).toLowerCase());

    case "ends_with":
      return typeof recordValue === "string" &&
        typeof filter.value === "string" &&
        recordValue.toLowerCase().endsWith((filter.value as string).toLowerCase());

    case "greater_than":
      return (recordValue as number) > (filter.value as number);

    case "greater_than_or_equal":
      return (recordValue as number) >= (filter.value as number);

    case "less_than":
      return (recordValue as number) < (filter.value as number);

    case "less_than_or_equal":
      return (recordValue as number) <= (filter.value as number);

    case "between": {
      const { from, to } = filter.value as DateRangeValue;
      const v = recordValue as string | number;
      return v >= (from as string | number) && v <= (to as string | number);
    }

    case "exists":
      return recordValue !== null && recordValue !== undefined;

    case "not_exists":
      return recordValue === null || recordValue === undefined;

    default:
      return true;
  }
}

/**
 * Filters an array of records against all provided conditions (AND logic).
 */
export function applyFiltersToData(
  data: Record<string, unknown>[],
  filters: FilterCondition[]
): Record<string, unknown>[] {
  if (!filters.length) return data;
  return data.filter((record) =>
    filters.every((filter) => matchesFilter(record, filter))
  );
}

// ─── Filter Serialisation ─────────────────────────────────────

export function serializeFilters(filters: FilterCondition[]): string {
  return JSON.stringify(filters);
}

export function deserializeFilters(serialized: string): FilterCondition[] {
  try {
    return JSON.parse(serialized) as FilterCondition[];
  } catch {
    return [];
  }
}

/** Build a stable cache key from filters */
export function buildFilterCacheKey(filters: FilterCondition[]): string {
  return filters
    .slice()
    .sort((a, b) => a.field.localeCompare(b.field))
    .map((f) => `${f.field}:${f.operator}:${JSON.stringify(f.value)}`)
    .join("|");
}
