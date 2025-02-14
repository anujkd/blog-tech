import React, { useState, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';

const GenericTable13 = ({
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
  const [filterModel, setFilterModel] = useState({});

  const handleError = useCallback((err) => {
    const errorMessage = err?.response?.data?.message || err.message || 'An error occurred';
    setError({ message: errorMessage, timestamp: new Date() });
    onError(err);
    setLoading(false);
  }, [onError]);

  const mergedDefaultColDef = useMemo(() => ({
    sortable: true,
    filter: 'agTextColumnFilter',
    floatingFilter: true,
    resizable: true,
    minWidth: 100,
    filterParams: {
      buttons: ['reset', 'apply'],
      closeOnApply: true,
    },
    ...defaultColDef
  }), [defaultColDef]);

  const processedColumnDefs = useMemo(() => {
    return columnDefs.map(colDef => {
      const baseColDef = {
        ...colDef,
        filter: true,
        floatingFilter: true,
      };

      if (colDef.type === 'number') {
        return {
          ...baseColDef,
          filter: 'agNumberColumnFilter',
          filterParams: {
            buttons: ['apply', 'reset'],
            closeOnApply: true,
            filterOptions: ['equals', 'greaterThan', 'lessThan', 'notEqual'],
          }
        };
      } else if (colDef.type === 'date') {
        return {
          ...baseColDef,
          filter: 'agDateColumnFilter',
          filterParams: {
            buttons: ['apply', 'reset'],
            closeOnApply: true,
            filterOptions: ['equals', 'greaterThan', 'lessThan', 'notEqual'],
          }
        };
      } else if (colDef.type === 'boolean') {
        return {
          ...baseColDef,
          filter: 'agSetColumnFilter',
          filterParams: {
            buttons: ['apply', 'reset'],
            closeOnApply: true,
          }
        };
      }

      return {
        ...baseColDef,
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['apply', 'reset'],
          closeOnApply: true,
          filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        }
      };
    });
  }, [columnDefs]);

  const onFilterChanged = useCallback((params) => {
    const newFilterModel = params.api.getFilterModel();
    setFilterModel(newFilterModel);
    
    if (serverSide) {
      const dataSource = createDataSource(currentPageSize, newFilterModel);
      params.api.setGridOption('datasource', dataSource);
    }
  }, [currentPageSize]);

  const onPaginationChanged = useCallback(async (params) => {
    if (!gridRef.current?.api) return;

    const newPageSize = params.api.paginationGetPageSize();
    if (newPageSize !== currentPageSize) {
      setCurrentPageSize(newPageSize);
      
      if (serverSide) {
        const dataSource = createDataSource(newPageSize, filterModel);
        params.api.setGridOption('datasource', dataSource);
      }
    }
  }, [currentPageSize, filterModel]);

  const createDataSource = useCallback((pageSize = currentPageSize, currentFilterModel = filterModel) => {
    return {
      getRows: async (params) => {
        if (!apiUrl) {
          params.failCallback();
          return;
        }

        setLoading(true);
        setIsDataLoaded(false);
        
        try {
          const filterParams = Object.entries(currentFilterModel).reduce((acc, [field, filterDef]) => {
            if (filterDef.type === 'contains') {
              acc[field] = filterDef.filter;
            } else if (filterDef.type === 'equals') {
              acc[`${field}Equals`] = filterDef.filter;
            } else if (filterDef.filterType === 'number') {
              acc[field] = filterDef.filter;
            }
            return acc;
          }, {});

          const response = await axios({
            method: 'get',
            url: apiUrl,
            params: {
              page: params.startRow / pageSize,
              size: pageSize,
              sort: params.sortModel?.[0]?.sort,
              sortField: params.sortModel?.[0]?.colId,
              ...filterParams,
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
  }, [apiUrl, currentPageSize, fetchDataParams, axiosConfig, handleError, onDataLoaded, filterModel]);

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
          defaultColDef={mergedDefaultColDef}
          rowModelType={serverSide ? "infinite" : "clientSide"}
          onGridReady={handleGridReady}
          onFilterChanged={onFilterChanged}
          onPaginationChanged={onPaginationChanged}
          cacheBlockSize={currentPageSize}
          pagination={true}
          paginationPageSize={currentPageSize}
          enableCellTextSelection={true}
          copyHeadersToClipboard={true}
          suppressAggFuncInHeader={true}
          loadingOverlayComponent={LoadingOverlay}
          noRowsOverlayComponent={NoRowsOverlay}
          maxBlocksInCache={serverSide ? 2 : undefined}
          infiniteInitialRowCount={serverSide ? totalRows : undefined}
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

GenericTable13.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.shape({
    field: PropTypes.string.isRequired,
    headerName: PropTypes.string,
    type: PropTypes.oneOf(['text', 'number', 'date', 'boolean']),
    filter: PropTypes.bool,
    sortable: PropTypes.bool,
    cellRenderer: PropTypes.func
  })).isRequired,
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

export default GenericTable13;