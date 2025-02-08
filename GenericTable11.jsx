import React, { useState, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';

const GenericTable11 = ({
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
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [currentPageSize, setCurrentPageSize] = useState(paginationPageSize);

  // Enhanced error handling
  const handleError = useCallback((err) => {
    const errorMessage = err?.response?.data?.message || err.message || 'An error occurred';
    setError({ message: errorMessage, timestamp: new Date() });
    onError(err);
    setLoading(false);
  }, [onError]);

  // Memoized default column definitions
  const mergedDefaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    ...defaultColDef
  }), [defaultColDef]);

  // Enhanced cell renderer wrapper with loading state
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

  // Process column definitions with loading states
  const processedColumnDefs = useMemo(() => {
    return columnDefs.map(colDef => ({
      ...colDef,
      cellRenderer: colDef.cellRenderer ? wrapCellRenderer(colDef.cellRenderer) : undefined,
      sortable: !loading && colDef.sortable,
      filter: !loading && colDef.filter
    }));
  }, [columnDefs, wrapCellRenderer, loading]);

  // Handle page size change
  const onPaginationChanged = useCallback(async (params) => {
    if (!gridRef.current?.api) return;

    const newPageSize = params.api.paginationGetPageSize();
    if (newPageSize !== currentPageSize) {
      setCurrentPageSize(newPageSize);
      
      if (serverSide) {
        // Reset data source with new page size
        const dataSource = createDataSource(newPageSize);
        params.api.setGridOption('datasource', dataSource);
      }
    }
  }, [currentPageSize, serverSide]);

  // Enhanced data source with page size handling
  const createDataSource = useCallback((pageSize = currentPageSize) => {
    return {
      getRows: async (params) => {
        if (!apiUrl) {
          params.failCallback();
          return;
        }

        setLoading(true);
        setIsDataLoaded(false);
        
        try {
          const response = await axios({
            method: 'get',
            url: apiUrl,
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
          setTotalRows(totalElements);

          if (Array.isArray(content) && content.length >= 0) {
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
  }, [apiUrl, currentPageSize, fetchDataParams, axiosConfig, handleError, onDataLoaded]);

  // Enhanced grid ready handler with error boundary
  const handleGridReady = useCallback((params) => {
    try {
      if (serverSide) {
        const dataSource = createDataSource();
        params.api.setGridOption('datasource', dataSource);
      } else {
        params.api.setGridOption('rowData', rowData);
        setTotalRows(rowData.length);
        setIsDataLoaded(true);
        onDataLoaded(rowData);
      }

      params.api.sizeColumnsToFit();
      onGridReady(params);
    } catch (err) {
      handleError(err);
    }
  }, [serverSide, rowData, createDataSource, onGridReady, handleError, onDataLoaded]);

  // Enhanced CSV export with error handling
  const exportToCSV = useCallback(() => {
    if (!gridRef.current?.api) {
      console.error('Grid API not available');
      return;
    }

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

  // Enhanced loading overlay with animation
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
            {loading ? 'Loading...' : `Total rows: ${totalRows}`}
          </div>
          <button
            onClick={exportToCSV}
            disabled={loading || !isDataLoaded}
            className={`px-4 py-2 rounded transition-colors ${
              loading || !isDataLoaded
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Export to CSV
          </button>
        </div>
      )}
      
      <div 
        className={`${gridTheme} relative`}
        style={{ height: gridHeight, width: gridWidth }}
      >
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 z-10" />
        )}
        <AgGridReact
          ref={gridRef}
          columnDefs={processedColumnDefs}
          rowModelType={serverSide ? "infinite" : "clientSide"}
          onGridReady={handleGridReady}
          onPaginationChanged={onPaginationChanged}
          cacheBlockSize={currentPageSize}
          pagination={true}
          paginationPageSize={currentPageSize}
          defaultColDef={mergedDefaultColDef}
          enableCellTextSelection={true}
          copyHeadersToClipboard={true}
          suppressAggFuncInHeader={true}
          loadingOverlayComponent={LoadingOverlay}
          noRowsOverlayComponent={NoRowsOverlay}
          maxBlocksInCache={serverSide ? 2 : undefined}
          infiniteInitialRowCount={serverSide ? totalRows : undefined}
          overlayLoadingTemplate={loading ? '<span class="loading"></span>' : ''}
          overlayNoRowsTemplate={error ? error.message : noRowsMessage}
          {...customGridOptions}
        />
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error.message}</span>
        </div>
      )}
    </div>
  );
};

GenericTable11.propTypes = {
  columnDefs: PropTypes.array.isRequired,
  rowData: PropTypes.array,
  paginationPageSize: PropTypes.number,
  serverSide: PropTypes.bool,
  apiUrl: PropTypes.string,
  fetchDataParams: PropTypes.object,
  onGridReady: PropTypes.func,
  onError: PropTypes.func,
  onDataLoaded: PropTypes.func,
  gridTheme: PropTypes.string,
  gridHeight: PropTypes.string,
  gridWidth: PropTypes.string,
  customLoadingOverlay: PropTypes.node,
  axiosConfig: PropTypes.object,
  defaultColDef: PropTypes.object,
  enableExport: PropTypes.bool,
  noRowsMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  customGridOptions: PropTypes.object
};

export default GenericTable11;