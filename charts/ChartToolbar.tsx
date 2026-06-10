// ============================================================
// CHART TOOLBAR
// Configurable toolbar — refresh, download, fullscreen, legend, custom
// ============================================================

import React, { memo, useState, useRef, useEffect } from "react";
import type { ToolbarConfig, ExportConfig, PermissionConfig, ResolvedTheme, ExportFormat } from "../../types";

interface ChartToolbarProps {
  config: ToolbarConfig;
  exportConfig?: ExportConfig;
  permissions?: PermissionConfig;
  theme: ResolvedTheme;
  isLoading: boolean;
  isFullscreen: boolean;
  legendVisible: boolean;
  onRefresh: () => void;
  onExport: (format: ExportFormat) => Promise<void>;
  onFullscreen: () => void;
  onLegendToggle: () => void;
  onPrint: () => void;
}

export const ChartToolbar = memo(function ChartToolbar({
  config,
  exportConfig,
  permissions,
  theme,
  isLoading,
  isFullscreen,
  legendVisible,
  onRefresh,
  onExport,
  onFullscreen,
  onLegendToggle,
  onPrint,
}: ChartToolbarProps) {
  const items = config.items ?? ["refresh", "download", "legendToggle", "fullscreen"];
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    if (exportMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportMenuOpen]);

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 6,
    border: `1px solid ${active ? theme.colors.primary : "transparent"}`,
    background: active ? `${theme.colors.primary}18` : "transparent",
    color: active ? theme.colors.primary : theme.colors.textSecondary,
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.15s",
    outline: "none",
    padding: 0,
  });

  const exportFormats: ExportFormat[] = exportConfig?.formats ?? ["png", "jpeg", "svg", "csv", "json"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexShrink: 0,
      }}
      role="toolbar"
      aria-label="Chart actions"
    >
      {items.map((item, idx) => {
        if (item === "separator") {
          return (
            <div
              key={`sep-${idx}`}
              style={{
                width: 1,
                height: 20,
                background: theme.colors.border,
                margin: "0 4px",
              }}
            />
          );
        }

        if (item === "refresh") {
          return (
            <button
              key="refresh"
              onClick={onRefresh}
              disabled={isLoading}
              style={btnStyle()}
              title="Refresh"
              aria-label="Refresh chart"
            >
              <span
                style={{
                  display: "inline-block",
                  animation: isLoading ? "cwf-spin 1s linear infinite" : "none",
                }}
              >
                ↻
              </span>
            </button>
          );
        }

        if (item === "download" && permissions?.canExport !== false && exportConfig?.enabled !== false) {
          return (
            <div key="download" ref={exportRef} style={{ position: "relative" }}>
              <button
                onClick={() => setExportMenuOpen((v) => !v)}
                style={btnStyle(exportMenuOpen)}
                title="Export"
                aria-label="Export chart"
                aria-haspopup="menu"
                aria-expanded={exportMenuOpen}
              >
                ↓
              </button>

              {exportMenuOpen && (
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: 0,
                    background: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius,
                    padding: "4px 0",
                    minWidth: 140,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 100,
                  }}
                >
                  {exportFormats.map((fmt) => (
                    <button
                      key={fmt}
                      role="menuitem"
                      onClick={async () => {
                        setExportMenuOpen(false);
                        await onExport(fmt);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        padding: "8px 16px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: theme.colors.text,
                        fontSize: 13,
                        fontFamily: theme.typography.fontFamily,
                        textAlign: "left",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          theme.colors.grid;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }}
                    >
                      <span style={{ opacity: 0.6, fontSize: 11, width: 32, fontFamily: "monospace" }}>
                        {fmt.toUpperCase()}
                      </span>
                      <span>Download {fmt.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        if (item === "legendToggle") {
          return (
            <button
              key="legend"
              onClick={onLegendToggle}
              style={btnStyle(legendVisible)}
              title={legendVisible ? "Hide legend" : "Show legend"}
              aria-label={legendVisible ? "Hide legend" : "Show legend"}
              aria-pressed={legendVisible}
            >
              ≡
            </button>
          );
        }

        if (item === "fullscreen" && permissions?.canFullscreen !== false) {
          return (
            <button
              key="fullscreen"
              onClick={onFullscreen}
              style={btnStyle(isFullscreen)}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? "⊠" : "⊞"}
            </button>
          );
        }

        if (item === "print") {
          return (
            <button
              key="print"
              onClick={onPrint}
              style={btnStyle()}
              title="Print"
              aria-label="Print chart"
            >
              ⎙
            </button>
          );
        }

        return null;
      })}

      {/* Custom buttons */}
      {config.customButtons?.map((btn) =>
        btn.visible !== false ? (
          <button
            key={btn.id}
            onClick={btn.handler}
            disabled={btn.disabled}
            style={btnStyle()}
            title={btn.tooltip ?? btn.label}
            aria-label={btn.label}
          >
            {btn.icon}
          </button>
        ) : null
      )}

      <style>{`
        @keyframes cwf-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});
