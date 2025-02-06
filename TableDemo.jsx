import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';

// Column definitions for the posts data
const columnDefs = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 100,
    sortable: true,
    filter: true 
  },
  { 
    field: 'title', 
    headerName: 'Title',
    flex: 2,
    sortable: true,
    filter: true 
  },
  { 
    field: 'body', 
    headerName: 'Content',
    flex: 3,
    sortable: true,
    filter: true 
  }
];

const TableDemo = () => {
  const [gridApi, setGridApi] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const pageSize = 10;

  const onGridReady = async (params) => {
    setGridApi(params.api);
    await fetchData(1);
  };

  const fetchData = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://jsonplaceholder.typicode.com/posts`, {
        params: {
          _page: page,
          _limit: pageSize
        }
      });
      
      setTotalRows(parseInt(response.headers['x-total-count']));
      setRowData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const onPaginationChanged = async () => {
    if (gridApi) {
      const currentPage = gridApi.paginationGetCurrentPage() + 1;
      await fetchData(currentPage);
    }
  };

  const loadingOverlayComponent = () => (
    <div className="text-center p-4">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
      <div className="mt-2">Loading data...</div>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Posts Table</h1>
      {loading && <div className="mb-2">Loading...</div>}
      <div className="ag-theme-alpine h-[600px] w-full">
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          pagination={true}
          paginationPageSize={pageSize}
          onGridReady={onGridReady}
          onPaginationChanged={onPaginationChanged}
          domLayout="autoHeight"
          enableSorting={true}
          enableFilter={true}
          suppressPaginationPanel={false}
          paginationTotalRows={totalRows}
          loadingOverlayComponent={loadingOverlayComponent}
          loadingOverlayComponentParams={{ loadingMessage: 'One moment please...' }}
          defaultColDef={{
            resizable: true,
            minWidth: 100
          }}
        />
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Total Posts: {totalRows}
      </div>
    </div>
  );
};

export default TableDemo;