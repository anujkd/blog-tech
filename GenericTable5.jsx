import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';

const GenericTable5 = ({
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
  customGridOptions = {}
}) => {
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [currentData, setCurrentData] = useState(rowData);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastPage, setLastPage] = useState(null);
  const [error, setError] = useState(null);

  // Enhanced error handling
  const handleError = useCallback((error) => {
    setError(error);
    onError(error);
    setLoading(false);
  }, [onError]);

  // Enhanced data fetching with better error handling and request cancellation
  const fetchServerData = useCallback(async (page) => {
    if (!apiUrl || loading || page === lastPage) return;
    
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await axios({
        method: 'get',
        url: apiUrl,
        params: {
          _page: page + 1,
          _limit: paginationPageSize,
          ...fetchDataParams
        },
        signal: controller.signal,
        ...axiosConfig
      });
      
      const totalCount = parseInt(response.headers['x-total-count'], 10);
      setTotalRows(totalCount);
      setCurrentData(response.data);
      setLastPage(page);
    } catch (error) {
      if (!axios.isCancel(error)) {
        handleError(error);
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [apiUrl, fetchDataParams, paginationPageSize, loading, lastPage, axiosConfig, handleError]);

  // Handle static data updates
  useEffect(() => {
    if (!serverSide) {
      setCurrentData(rowData);
      setTotalRows(rowData.length);
    }
  }, [rowData, serverSide]);

  // Export data functionality
  const exportToCSV = useCallback(() => {
    if (gridApi) {
      const params = {
        skipHeader: false,
        skipFooters: true,
        skipGroups: true,
        fileName: 'export.csv'
      };
      gridApi.exportDataAsCsv(params);
    }
  }, [gridApi]);

  // Enhanced grid ready handler
  const onGridReadyHandler = useCallback((params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    
    if (serverSide) {
      fetchServerData(0);
    }
    
    // Auto-size columns on initial load
    params.api.sizeColumnsToFit();
    onGridReady(params);
  }, [onGridReady, serverSide, fetchServerData]);

  // Enhanced pagination handler
  const onPaginationChanged = useCallback(() => {
    if (gridApi && serverSide) {
      const newPage = gridApi.paginationGetCurrentPage();
      fetchServerData(newPage);
    }
  }, [gridApi, serverSide, fetchServerData]);

  // Custom loading overlay
  const LoadingOverlay = () => (
    customLoadingOverlay || (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div>{loadingMessage}</div>
        </div>
      </div>
    )
  );

  // Custom no rows overlay
  const NoRowsOverlay = () => (
    <div className="flex items-center justify-center p-4">
      <div className="text-center text-gray-500">
        {noRowsMessage}
      </div>
    </div>
  );

  // Merge default column definitions
  const mergedDefaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    ...defaultColDef
  };

  return (
    <div className="flex flex-col gap-4">
      {enableExport && (
        <div className="flex justify-end">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Export to CSV
          </button>
        </div>
      )}
      
      <div 
        className={gridTheme} 
        style={{ height: gridHeight, width: gridWidth }}
      >
        <AgGridReact
          onGridReady={onGridReadyHandler}
          onPaginationChanged={onPaginationChanged}
          columnDefs={columnDefs}
          rowData={currentData}
          pagination={true}
          paginationPageSize={paginationPageSize}
          domLayout="autoHeight"
          rowModelType="clientSide"
          suppressPaginationPanel={false}
          enableCellTextSelection={true}
          copyHeadersToClipboard={true}
          suppressAggFuncInHeader={true}
          paginationAutoPageSize={false}
          loadingOverlayComponent={LoadingOverlay}
          noRowsOverlayComponent={NoRowsOverlay}
          defaultColDef={mergedDefaultColDef}
          overlayLoadingTemplate={
            '<span class="ag-overlay-loading-center">' + loadingMessage + '</span>'
          }
          overlayNoRowsTemplate={
            '<span class="ag-overlay-no-rows-center">' + noRowsMessage + '</span>'
          }
          {...(serverSide && {
            maxBlocksInCache: 1,
            cacheBlockSize: paginationPageSize,
            paginationTotalRows: totalRows
          })}
          {...customGridOptions}
        />
      </div>
      
      {error && (
        <div className="text-red-500 mt-2">
          Error: {error.message}
        </div>
      )}
    </div>
  );
};

GenericTable5.propTypes = {
  columnDefs: PropTypes.array.isRequired,
  rowData: PropTypes.array,
  paginationPageSize: PropTypes.number,
  serverSide: PropTypes.bool,
  apiUrl: PropTypes.string,
  fetchDataParams: PropTypes.object,
  onGridReady: PropTypes.func,
  onError: PropTypes.func,
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

export default GenericTable5;