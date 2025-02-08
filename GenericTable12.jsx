import React, { useState, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';

const GenericTable12 = ({
  columnDefs,
  rowData = [],
  paginationPageSize = 20,
  serverSide = false,
  apiUrl = '',
  fetchDataParams = {},
  onGridReady = () => {},
  onError = () => {},
  gridTheme = 'ag-theme-alpine',
  gridHeight = '500px',
  gridWidth = '100%',
  customLoadingOverlay,
  axiosConfig = {},
  defaultColDef = {},
  enableExport = false,
  noRowsMessage = 'No rows to show',
  loadingMessage = 'Loading data...',
  customGridOptions = {},
  onDataLoaded = () => {},
}) => {
  const gridRef = useRef(null);
  const totalRowsRef = useRef(0);
  const currentPageSizeRef = useRef(paginationPageSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Handle API errors
  const handleError = useCallback((err) => {
    const errorMessage = err?.response?.data?.message || err.message || 'An error occurred';
    setError({ message: errorMessage, timestamp: new Date() });
    onError(err);
    setLoading(false);
  }, [onError]);

  // Default column definitions
  const mergedDefaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    ...defaultColDef
  }), [defaultColDef]);

  // Wrap cell renderers for loading state
  const wrapCellRenderer = useCallback((renderer) => {
    return (params) => {
      if (!params.data || loading) {
        return <div className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>;
      }
      if (!isDataLoaded) {
        return '';
      }
      return renderer(params);
    };
  }, [isDataLoaded, loading]);

  // Process column definitions
  const processedColumnDefs = useMemo(() => {
    return columnDefs.map(colDef => ({
      ...colDef,
      cellRenderer: colDef.cellRenderer ? wrapCellRenderer(colDef.cellRenderer) : undefined,
      sortable: !loading && colDef.sortable,
      filter: !loading && colDef.filter
    }));
  }, [columnDefs, wrapCellRenderer, loading]);

  // Create data source (memoized)
  const createDataSource = useCallback((pageSize) => {
    return {
      getRows: async (params) => {
        if (!apiUrl) {
          params.failCallback();
          return;
        }

        setLoading(true);
        setIsDataLoaded(false);

        try {
          const response = await axios.get(apiUrl, {
            params: {
              page: params.startRow / pageSize,
              size: pageSize,
              sort: params.sortModel?.[0]?.sort,
              sortField: params.sortModel?.[0]?.colId,
              ...fetchDataParams
            },
            ...axiosConfig
          });

          const { content, totalElements } = response.data;
          totalRowsRef.current = totalElements;

          if (Array.isArray(content)) {
            setIsDataLoaded(true);
            params.successCallback(content, totalElements);
            onDataLoaded(content);
          } else {
            throw new Error('Invalid data format received from server');
          }
        } catch (err) {
          handleError(err);
          params.failCallback();
        } finally {
          setLoading(false);
        }
      }
    };
  }, [apiUrl, fetchDataParams, axiosConfig, handleError, onDataLoaded]);

  // Handle grid ready event
  const handleGridReady = useCallback((params) => {
    try {
      if (serverSide) {
        params.api.setGridOption('datasource', createDataSource(currentPageSizeRef.current));
      } else {
        params.api.setGridOption('rowData', rowData);
        totalRowsRef.current = rowData.length;
        setIsDataLoaded(true);
        onDataLoaded(rowData);
      }

      params.api.sizeColumnsToFit();
      onGridReady(params);
    } catch (err) {
      handleError(err);
    }
  }, [serverSide, rowData, createDataSource, onGridReady, handleError, onDataLoaded]);

  // Handle page size change
  const onPaginationChanged = useCallback((params) => {
    if (!gridRef.current?.api) return;

    const newPageSize = params.api.paginationGetPageSize();
    if (newPageSize !== currentPageSizeRef.current) {
      currentPageSizeRef.current = newPageSize;

      if (serverSide) {
        params.api.setGridOption('datasource', createDataSource(newPageSize));
      }
    }
  }, [serverSide, createDataSource]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (!gridRef.current?.api) return;
    try {
      gridRef.current.api.exportDataAsCsv({
        skipHeader: false,
        skipFooters: true,
        skipGroups: true,
        fileName: `export-${new Date().toISOString()}.csv`
      });
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // Loading and no rows overlay components
  const LoadingOverlay = () => (
    customLoadingOverlay || (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
          <div>{loadingMessage}</div>
        </div>
      </div>
    )
  );

  const NoRowsOverlay = () => (
    <div className="flex items-center justify-center p-4">
      <div className="text-center text-gray-500">
        {error ? error.message : noRowsMessage}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {enableExport && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {loading ? 'Loading...' : `Total rows: ${totalRowsRef.current}`}
          </div>
          <button
            onClick={exportToCSV}
            disabled={loading || !isDataLoaded}
            className={`px-4 py-2 rounded transition-colors ${
              loading || !isDataLoaded ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Export to CSV
          </button>
        </div>
      )}

      <div className={`${gridTheme} relative`} style={{ height: gridHeight, width: gridWidth }}>
        <AgGridReact
          ref={gridRef}
          columnDefs={processedColumnDefs}
          rowModelType={serverSide ? "infinite" : "clientSide"}
          onGridReady={handleGridReady}
          onPaginationChanged={onPaginationChanged}
          cacheBlockSize={currentPageSizeRef.current}
          pagination
          paginationPageSize={currentPageSizeRef.current}
          defaultColDef={mergedDefaultColDef}
          enableCellTextSelection
          copyHeadersToClipboard
          suppressAggFuncInHeader
          loadingOverlayComponent={LoadingOverlay}
          noRowsOverlayComponent={NoRowsOverlay}
          {...customGridOptions}
        />
      </div>
    </div>
  );
};

export default GenericTable12;
