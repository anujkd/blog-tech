// ============================================================
// DATA TRANSFORMATION PIPELINE
// Pluggable, composable transforms: sort · filter · group · aggregate · pivot · normalize · calculate · custom
// ============================================================

import type { TransformationStep, FilterCondition, SortConfig, AggregationConfig } from "../types";
import { applyFiltersToData } from "./filterMerge";

type DataRecord = Record<string, unknown>;

// ─── Pipeline Runner ─────────────────────────────────────────

/**
 * Runs data through a sequential transformation pipeline.
 * Each step's output becomes the next step's input.
 * Throws on unknown step types unless a custom transform is provided.
 */
export function runTransformationPipeline(
  data: unknown[],
  steps: TransformationStep[]
): unknown[] {
  return steps.reduce((current, step) => {
    try {
      return applyTransformation(current as DataRecord[], step);
    } catch (err) {
      console.error(`[Transform] Step "${step.type}" failed:`, err);
      return current;
    }
  }, data as DataRecord[]);
}

function applyTransformation(
  data: DataRecord[],
  step: TransformationStep
): DataRecord[] {
  // Custom transformer always wins
  if (step.transform) {
    return step.transform(data, step.config) as DataRecord[];
  }

  switch (step.type) {
    case "sort":
      return sortTransform(data, step.config);
    case "filter":
      return filterTransform(data, step.config);
    case "group":
      return groupTransform(data, step.config);
    case "aggregate":
      return aggregateTransform(data, step.config);
    case "pivot":
      return pivotTransform(data, step.config);
    case "normalize":
      return normalizeTransform(data, step.config);
    case "calculate":
      return calculateTransform(data, step.config);
    case "custom":
      throw new Error(
        'Custom transformation requires a "transform" function in the step config'
      );
    default:
      return data;
  }
}

// ─── Sort ─────────────────────────────────────────────────────

function sortTransform(
  data: DataRecord[],
  config: Record<string, unknown>
): DataRecord[] {
  const sortKeys = config.sortKeys as SortConfig[] | undefined;
  if (!sortKeys?.length) return data;

  return [...data].sort((a, b) => {
    for (const { field, direction } of sortKeys) {
      const aVal = a[field] as string | number;
      const bVal = b[field] as string | number;
      let cmp = 0;
      if (aVal < bVal) cmp = -1;
      else if (aVal > bVal) cmp = 1;
      if (cmp !== 0) return direction === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

// ─── Filter ───────────────────────────────────────────────────

function filterTransform(
  data: DataRecord[],
  config: Record<string, unknown>
): DataRecord[] {
  const filters = config.filters as FilterCondition[] | undefined;
  if (!filters?.length) return data;
  return applyFiltersToData(data, filters);
}

// ─── Group ────────────────────────────────────────────────────

interface GroupConfig {
  groupBy: string[];
  aggregations?: AggregationConfig[];
}

function groupTransform(
  data: DataRecord[],
  config: Record<string, unknown>
): DataRecord[] {
  const { groupBy, aggregations } = config as GroupConfig;
  if (!groupBy?.length) return data;

  const groups = new Map<string, DataRecord[]>();

  for (const row of data) {
    const key = groupBy.map((f) => String(row[f] ?? "")).join("__");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  const result: DataRecord[] = [];
  groups.forEach((rows, _key) => {
    const base: DataRecord = {};
    groupBy.forEach((f) => (base[f] = rows[0][f]));

    if (aggregations?.length) {
      for (const agg of aggregations) {
        base[agg.alias ?? `${agg.function}_${agg.field}`] = computeAgg(
          rows,
          agg
        );
      }
    } else {
      base["_count"] = rows.length;
    }

    result.push(base);
  });

  return result;
}

// ─── Aggregate ────────────────────────────────────────────────

function aggregateTransform(
  data: DataRecord[],
  config: Record<string, unknown>
): DataRecord[] {
  const aggregations = config.aggregations as AggregationConfig[] | undefined;
  if (!aggregations?.length) return data;

  const result: DataRecord = {};
  for (const agg of aggregations) {
    result[agg.alias ?? `${agg.function}_${agg.field}`] = computeAgg(
      data,
      agg
    );
  }

  return [result];
}

function computeAgg(rows: DataRecord[], agg: AggregationConfig): number {
  const values = rows.map((r) => Number(r[agg.field]) || 0);

  switch (agg.function) {
    case "sum":
      return values.reduce((s, v) => s + v, 0);
    case "avg":
      return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    case "count":
      return rows.length;
    case "distinct":
      return new Set(rows.map((r) => r[agg.field])).size;
    default:
      return 0;
  }
}

// ─── Pivot ────────────────────────────────────────────────────

interface PivotConfig {
  rowField: string;
  columnField: string;
  valueField: string;
  aggFunction?: AggregationConfig["function"];
}

function pivotTransform(
  data: DataRecord[],
  config: Record<string, unknown>
): DataRecord[] {
  const { rowField, columnField, valueField, aggFunction = "sum" } =
    config as PivotConfig;

  const columns = [...new Set(data.map((r) => String(r[columnField])))];
  const rowGroups = new Map<string, DataRecord[]>();

  for (const row of data) {
    const rowKey = String(row[rowField]);
    if (!rowGroups.has(rowKey)) rowGroups.set(rowKey, []);
    rowGroups.get(rowKey)!.push(row);
  }

  const result: DataRecord[] = [];
  rowGroups.forEach((rows, rowKey) => {
    const pivotRow: DataRecord = { [rowField]: rowKey };
    for (const col of columns) {
      const colRows = rows.filter((r) => String(r[columnField]) === col);
      if (colRows.length === 0) {
        pivotRow[col] = 0;
      } else {
        pivotRow[col] = computeAgg(colRows, {
          field: valueField,
          function: aggFunction,
          alias: col,
        });
      }
    }
    result.push(pivotRow);
  });

  return result;
}

// ─── Normalize ────────────────────────────────────────────────

interface NormalizeConfig {
  fields: string[];
  method?: "min-max" | "z-score" | "percent-of-total";
}

function normalizeTransform(
  data: DataRecord[],
  config: Record<string, unknown>
): DataRecord[] {
  const { fields, method = "min-max" } = config as NormalizeConfig;
  if (!fields?.length) return data;

  const stats: Record<string, { min: number; max: number; sum: number; mean: number; std: number }> = {};

  for (const field of fields) {
    const values = data.map((r) => Number(r[field]) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((s, v) => s + v, 0);
    const mean = sum / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance) || 1;
    stats[field] = { min, max, sum, mean, std };
  }

  return data.map((row) => {
    const updated = { ...row };
    for (const field of fields) {
      const v = Number(row[field]) || 0;
      const s = stats[field];
      if (method === "min-max") {
        updated[field] = s.max === s.min ? 0 : (v - s.min) / (s.max - s.min);
      } else if (method === "z-score") {
        updated[field] = (v - s.mean) / s.std;
      } else if (method === "percent-of-total") {
        updated[field] = s.sum === 0 ? 0 : v / s.sum;
      }
    }
    return updated;
  });
}

// ─── Calculate (derived fields) ───────────────────────────────

interface CalculateConfig {
  calculations: Array<{
    alias: string;
    expression: string; // e.g. "revenue - cost", "units * price"
    fields?: string[];
    fn?: (row: DataRecord) => unknown;
  }>;
}

function calculateTransform(
  data: DataRecord[],
  config: Record<string, unknown>
): DataRecord[] {
  const { calculations } = config as CalculateConfig;
  if (!calculations?.length) return data;

  return data.map((row) => {
    const updated = { ...row };
    for (const calc of calculations) {
      if (calc.fn) {
        updated[calc.alias] = calc.fn(row);
      } else if (calc.expression) {
        try {
          // Safe expression evaluator using field substitution
          updated[calc.alias] = evaluateExpression(calc.expression, row);
        } catch {
          updated[calc.alias] = null;
        }
      }
    }
    return updated;
  });
}

/**
 * Minimal safe expression evaluator: substitutes field names, evaluates arithmetic.
 * Only handles +, -, *, /, (, ) and numbers. No eval().
 */
function evaluateExpression(
  expression: string,
  row: DataRecord
): number | null {
  // Replace field names with their values
  let expr = expression;
  const fieldPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  const fieldNames = [...new Set(expression.match(fieldPattern) ?? [])];

  for (const field of fieldNames) {
    const value = row[field];
    if (value !== undefined && value !== null) {
      expr = expr.replaceAll(field, String(Number(value)));
    }
  }

  // Validate: only allow digits, whitespace, and arithmetic operators
  if (!/^[\d\s+\-*/().]+$/.test(expr)) return null;

  // Use Function constructor as a controlled alternative to eval
  try {
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${expr})`)() as number;
  } catch {
    return null;
  }
}

// ─── Transform Builder ────────────────────────────────────────

/** Fluent builder for constructing transformation pipelines */
export class TransformPipelineBuilder {
  private steps: TransformationStep[] = [];

  sort(sortKeys: SortConfig[]): this {
    this.steps.push({ type: "sort", config: { sortKeys } });
    return this;
  }

  filter(filters: FilterCondition[]): this {
    this.steps.push({ type: "filter", config: { filters } });
    return this;
  }

  groupBy(groupBy: string[], aggregations?: AggregationConfig[]): this {
    this.steps.push({ type: "group", config: { groupBy, aggregations } });
    return this;
  }

  aggregate(aggregations: AggregationConfig[]): this {
    this.steps.push({ type: "aggregate", config: { aggregations } });
    return this;
  }

  pivot(rowField: string, columnField: string, valueField: string): this {
    this.steps.push({ type: "pivot", config: { rowField, columnField, valueField } });
    return this;
  }

  normalize(fields: string[], method: NormalizeConfig["method"] = "min-max"): this {
    this.steps.push({ type: "normalize", config: { fields, method } });
    return this;
  }

  calculate(
    calculations: CalculateConfig["calculations"]
  ): this {
    this.steps.push({ type: "calculate", config: { calculations } });
    return this;
  }

  custom(transform: (data: unknown[], config: Record<string, unknown>) => unknown[]): this {
    this.steps.push({ type: "custom", config: {}, transform });
    return this;
  }

  build(): TransformationStep[] {
    return this.steps;
  }
}
