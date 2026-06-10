// ============================================================
// CHART ADAPTER REGISTRY
// Library-agnostic adapter pattern — parent never changes
// ============================================================

import type { ChartAdapter, ChartLibrary } from "../types";

// ─── Registry ────────────────────────────────────────────────

class AdapterRegistryClass {
  private registry = new Map<ChartLibrary, () => Promise<ChartAdapter>>();

  /**
   * Register an adapter factory for a library.
   * Factories are lazy — they only run when the adapter is first requested.
   */
  register(library: ChartLibrary, factory: () => Promise<ChartAdapter>): void {
    this.registry.set(library, factory);
  }

  /**
   * Get (and instantiate) an adapter for a library.
   * Throws clearly if the adapter is not registered.
   */
  async getAdapter(library: ChartLibrary): Promise<ChartAdapter> {
    const factory = this.registry.get(library);
    if (!factory) {
      const available = [...this.registry.keys()].join(", ");
      throw new Error(
        `ChartAdapter for "${library}" is not registered. ` +
          `Available adapters: [${available || "none"}]. ` +
          `Call ChartAdapterRegistry.register("${library}", factory) at startup.`
      );
    }
    return factory();
  }

  /** Returns true if an adapter is registered for a given library */
  has(library: ChartLibrary): boolean {
    return this.registry.has(library);
  }

  /** List all registered library names */
  getRegistered(): ChartLibrary[] {
    return [...this.registry.keys()];
  }

  /**
   * Unregister an adapter (useful for testing or dynamic unloading).
   */
  unregister(library: ChartLibrary): void {
    this.registry.delete(library);
  }
}

/** Global singleton adapter registry */
export const ChartAdapterRegistry = new AdapterRegistryClass();

// ─── Register Built-in Adapters ───────────────────────────────

// ECharts — registered lazily so the library is only loaded when needed
ChartAdapterRegistry.register(
  "echarts",
  async () => {
    const { EChartsAdapter } = await import("./echarts/EChartsAdapter");
    return new EChartsAdapter();
  }
);

// Highcharts — registered but will surface a helpful error if not installed
ChartAdapterRegistry.register(
  "highcharts",
  async () => {
    const { HighchartsAdapter } = await import("./highcharts/HighchartsAdapter");
    return new HighchartsAdapter();
  }
);

// Placeholders for future adapters — fail gracefully with instructions
ChartAdapterRegistry.register("chartjs", async () => {
  throw new Error(
    "ChartJS adapter is not yet implemented. " +
      "Install: npm install chart.js react-chartjs-2, then implement ChartJSAdapter."
  );
});

ChartAdapterRegistry.register("visx", async () => {
  throw new Error(
    "Visx adapter is not yet implemented. " +
      "Install: npm install @visx/xychart, then implement VisxAdapter."
  );
});

ChartAdapterRegistry.register("d3", async () => {
  throw new Error(
    "D3 adapter is not yet implemented. " +
      "Install: npm install d3, then implement D3Adapter."
  );
});
