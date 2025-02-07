import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';

const GenericTable7 = ({
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
  const gridRef = useRef(null);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = useCallback((err) => {
    setError(err);
    onError(err);
    setLoading(false);
  }, [onError]);

  const createDataSource = useCallback(() => {
    return {
      getRows: async (params) => {
        if (!apiUrl) {
          params.failCallback();
          return;
        }

        setLoading(true);
        try {
          const response = await axios({
            method: 'get',
            url: apiUrl,
            params: {
              page: params.startRow / paginationPageSize,
              size: paginationPageSize,
              ...fetchDataParams
            },
            ...axiosConfig
          });

          const { content, totalElements } = response.data;
          setTotalRows(totalElements);

          if (content.length > 0) {
            params.successCallback(content, totalElements);
          } else {
            params.failCallback();
          }
        } catch (err) {
          handleError(err);
          params.failCallback();
        } finally {
          setLoading(false);
        }
      }
    };
  }, [apiUrl, fetchDataParams, paginationPageSize, axiosConfig, handleError]);

  const handleGridReady = useCallback((params) => {
    if (serverSide) {
      params.api.setGridOption('datasource', createDataSource());
    } else {
      params.api.setRowData(rowData);
      setTotalRows(rowData.length);
    }

    params.api.sizeColumnsToFit();
    onGridReady(params);
  }, [serverSide, rowData, createDataSource, onGridReady]);

  const exportToCSV = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        skipHeader: false,
        skipFooters: true,
        skipGroups: true,
        fileName: 'export.csv'
      });
    }
  }, []);

  const mergedDefaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    ...defaultColDef
  };

  const LoadingOverlay = () => (
    customLoadingOverlay || (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div>{loadingMessage}</div>
        </div>
      </div>
    )
  );

  const NoRowsOverlay = () => (
    <div className="flex items-center justify-center p-4">
      <div className="text-center text-gray-500">
        {noRowsMessage}
      </div>
    </div>
  );

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
          ref={gridRef}
          columnDefs={columnDefs}
          rowModelType={serverSide ? "infinite" : "clientSide"}
          onGridReady={handleGridReady}
          cacheBlockSize={paginationPageSize}
          pagination={true}
          paginationPageSize={paginationPageSize}
          defaultColDef={mergedDefaultColDef}
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
        <div className="text-red-500 mt-2">
          Error: {error.message}
        </div>
      )}
    </div>
  );
};

GenericTable7.propTypes = {
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

export default GenericTable7;