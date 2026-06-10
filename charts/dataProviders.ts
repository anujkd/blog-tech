// ============================================================
// DATA PROVIDER SERVICE
// REST · GraphQL · Static · Async · WebSocket · SSE
// ============================================================

import type {
  DataSourceConfig,
  FilterCondition,
  RestDataSourceConfig,
  GraphQLDataSourceConfig,
  StaticDataSourceConfig,
  AsyncDataSourceConfig,
  WebSocketDataSourceConfig,
  SSEDataSourceConfig,
} from "../types";

// ─── Main Dispatcher ─────────────────────────────────────────

export async function loadDataForWidget(
  dataSource: DataSourceConfig,
  filters: FilterCondition[]
): Promise<unknown[]> {
  switch (dataSource.type) {
    case "static":
      return loadStatic(dataSource, filters);
    case "rest":
      return loadREST(dataSource, filters);
    case "graphql":
      return loadGraphQL(dataSource, filters);
    case "async":
      return loadAsync(dataSource, filters);
    case "websocket":
    case "sse":
      // For one-shot fetch from WS/SSE we return empty — real-time handled by hooks
      return [];
    default:
      throw new Error(`Unknown data source type`);
  }
}

// ─── Static Loader ────────────────────────────────────────────

function loadStatic(
  config: StaticDataSourceConfig,
  _filters: FilterCondition[]
): unknown[] {
  // Static data filtering is handled by the transformation pipeline downstream
  return config.data;
}

// ─── REST Loader ──────────────────────────────────────────────

async function loadREST(
  config: RestDataSourceConfig,
  filters: FilterCondition[]
): Promise<unknown[]> {
  const url = new URL(config.url, typeof window !== "undefined" ? window.location.origin : "http://localhost");

  // Encode filters as query param for GET requests
  if (config.method !== "POST" && filters.length > 0) {
    url.searchParams.set("filters", JSON.stringify(filters));
  }

  // Append static params
  if (config.params) {
    Object.entries(config.params).forEach(([k, v]) =>
      url.searchParams.set(k, String(v))
    );
  }

  const body =
    config.method === "POST"
      ? JSON.stringify(config.body ?? { filters })
      : undefined;

  const res = await fetch(url.toString(), {
    method: config.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`REST fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (config.responseTransformer) {
    return config.responseTransformer(json);
  }

  // Auto-unwrap common response shapes
  if (Array.isArray(json)) return json;
  if (json?.data && Array.isArray(json.data)) return json.data;
  if (json?.items && Array.isArray(json.items)) return json.items;
  if (json?.results && Array.isArray(json.results)) return json.results;

  return [json];
}

// ─── GraphQL Loader ───────────────────────────────────────────

async function loadGraphQL(
  config: GraphQLDataSourceConfig,
  filters: FilterCondition[]
): Promise<unknown[]> {
  const variables = {
    ...config.variables,
    filters,
  };

  const res = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    body: JSON.stringify({ query: config.query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(`GraphQL error: ${json.errors[0].message}`);
  }

  // Walk the data path e.g. "data.sales.items"
  if (config.dataPath) {
    const path = config.dataPath.split(".");
    let result: unknown = json;
    for (const key of path) {
      result = (result as Record<string, unknown>)?.[key];
    }
    if (Array.isArray(result)) return result;
  }

  if (Array.isArray(json?.data)) return json.data;

  // Return first array value found in data
  if (json?.data && typeof json.data === "object") {
    const firstArray = Object.values(json.data as Record<string, unknown>).find(
      Array.isArray
    );
    if (firstArray) return firstArray as unknown[];
  }

  return [];
}

// ─── Async Provider Loader ────────────────────────────────────

async function loadAsync(
  config: AsyncDataSourceConfig,
  filters: FilterCondition[]
): Promise<unknown[]> {
  return config.dataProvider(filters);
}

// ─── WebSocket Provider ───────────────────────────────────────

export interface WebSocketHandle {
  close: () => void;
  send: (data: unknown) => void;
}

/**
 * Opens a WebSocket subscription and calls onData with each parsed message.
 * Returns a handle to close the connection.
 */
export function openWebSocket(
  config: WebSocketDataSourceConfig,
  onData: (data: unknown[]) => void,
  onError?: (err: Event) => void
): WebSocketHandle {
  const ws = new WebSocket(config.url);

  ws.onopen = () => {
    if (config.subscribeMessage) {
      ws.send(JSON.stringify(config.subscribeMessage));
    }
  };

  ws.onmessage = (event) => {
    try {
      const raw = JSON.parse(event.data);
      const data = config.messageTransformer
        ? config.messageTransformer(raw)
        : Array.isArray(raw)
        ? raw
        : [raw];
      onData(data);
    } catch {
      // silently ignore parse errors — keep connection alive
    }
  };

  ws.onerror = (err) => {
    onError?.(err);
  };

  return {
    close: () => {
      if (config.unsubscribeMessage && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(config.unsubscribeMessage));
      }
      ws.close();
    },
    send: (data) => ws.send(JSON.stringify(data)),
  };
}

// ─── SSE Provider ─────────────────────────────────────────────

export interface SSEHandle {
  close: () => void;
}

/**
 * Opens an SSE connection and calls onData with each parsed event.
 * Returns a handle to close the connection.
 */
export function openSSE(
  config: SSEDataSourceConfig,
  onData: (data: unknown[]) => void,
  onError?: (err: Event) => void
): SSEHandle {
  // EventSource doesn't support custom headers natively — headers passed via URL params if needed
  const es = new EventSource(config.url);
  const eventName = config.eventName ?? "message";

  const handler = (event: MessageEvent) => {
    try {
      const raw = JSON.parse(event.data);
      const data = config.messageTransformer
        ? config.messageTransformer(raw)
        : Array.isArray(raw)
        ? raw
        : [raw];
      onData(data);
    } catch {
      // ignore parse errors
    }
  };

  es.addEventListener(eventName, handler as EventListener);
  es.onerror = (err) => onError?.(err);

  return {
    close: () => {
      es.removeEventListener(eventName, handler as EventListener);
      es.close();
    },
  };
}

// ─── Polling Provider ─────────────────────────────────────────

export interface PollingHandle {
  stop: () => void;
  forceRefresh: () => void;
}

/**
 * Wraps any data loader in a polling interval.
 */
export function createPollingProvider(
  loader: () => Promise<unknown[]>,
  intervalMs: number,
  onData: (data: unknown[]) => void,
  onError?: (err: Error) => void
): PollingHandle {
  let timerId: ReturnType<typeof setInterval>;
  let stopped = false;

  const tick = async () => {
    if (stopped) return;
    try {
      const data = await loader();
      if (!stopped) onData(data);
    } catch (err) {
      if (!stopped) onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  };

  // Immediate first fetch
  tick();
  timerId = setInterval(tick, intervalMs);

  return {
    stop: () => {
      stopped = true;
      clearInterval(timerId);
    },
    forceRefresh: () => tick(),
  };
}

// ─── Cache Layer ──────────────────────────────────────────────

interface CacheEntry {
  data: unknown[];
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

export function getCached(key: string): unknown[] | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key: string, data: unknown[], ttlSeconds: number): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function invalidateCache(key?: string): void {
  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
}
