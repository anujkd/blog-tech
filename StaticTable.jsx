import React from 'react';
import GenericTable from './GenericTable';
import GenericTable5 from './GenericTable5';

const StaticTableDemo = () => {
  // Sample static data
  const rowData = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      age: 28,
      city: 'New York',
      status: 'Active',
      joinDate: '2023-01-15',
      salary: 75000
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      age: 32,
      city: 'Los Angeles',
      status: 'Active',
      joinDate: '2022-11-20',
      salary: 82000
    },
    {
      id: 3,
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
      age: 45,
      city: 'Chicago',
      status: 'Inactive',
      joinDate: '2021-06-10',
      salary: 91000
    },
    {
      id: 4,
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice@example.com',
      age: 29,
      city: 'Houston',
      status: 'Active',
      joinDate: '2023-03-05',
      salary: 78000
    },
    {
      id: 5,
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie@example.com',
      age: 38,
      city: 'Phoenix',
      status: 'Active',
      joinDate: '2022-09-15',
      salary: 85000
    }
  ];

  // Column definitions with various configurations
  const columnDefs = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      sortable: true,
      filter: true
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      flex: 1,
      sortable: true,
      filter: true
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      flex: 1,
      sortable: true,
      filter: true
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      sortable: true,
      filter: true
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 90,
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params) => `${params.value} yrs`
    },
    {
      field: 'city',
      headerName: 'City',
      flex: 1,
      sortable: true,
      filter: true
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      sortable: true,
      filter: true,
      cellRenderer: (params) => (
        <div className={`text-sm px-2 py-1 rounded ${
          params.value === 'Active' 
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {params.value}
        </div>
      )
    },
    {
      field: 'joinDate',
      headerName: 'Join Date',
      flex: 1,
      sortable: true,
      filter: true,
      cellRenderer: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'salary',
      headerName: 'Salary',
      flex: 1,
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params) => `$${params.value.toLocaleString()}`
    }
  ];

  const handleGridReady = (params) => {
    console.log('Grid is ready');
    // You can add any grid initialization logic here
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Directory</h1>
      <div className="mb-4 text-sm text-gray-600">
        Showing {rowData.length} employees
      </div>
      <GenericTable5
        columnDefs={columnDefs}
        rowData={rowData}
        paginationPageSize={20}
        serverSide={false}
        onGridReady={handleGridReady}
      />
    </div>
  );
};

export default StaticTableDemo;