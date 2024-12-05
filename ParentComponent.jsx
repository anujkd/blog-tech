// ParentComponent.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomTable from './GenericTable';

const ParentComponent = () => {
  // States for pagination and sorting
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortField, setSortField] = useState('name'); // Default sorting field
  const [sortOrder, setSortOrder] = useState('asc'); // Default sorting order
  const [searchQuery, setSearchQuery] = useState('');

  // Actions for "Edit" and "Delete"
  const actions = [
    {
      label: 'Delete',
      handler: (row) => alert(`Delete ${row.name}`),
    },
    {
      label: 'Edit',
      handler: (row) => alert(`Edit ${row.name}`),
    },
  ];

  // Fetch data for server-side
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/users', {
        params: {
          _page: page + 1,
          _limit: rowsPerPage,
          _sort: sortField,
          _order: sortOrder,
        },
      });
      setData(response.data);
      setTotalCount(100); // Total count can be fetched from headers or backend API
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sorting
  const handleSort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  // Static data example (simple table)
  const staticData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '123-456-7890' },
    { id: 3, name: 'Sam Green', email: 'sam@example.com', phone: '123-456-7890' },
    { id: 4, name: 'Anna Brown', email: 'anna@example.com', phone: '123-456-7890' },
    { id: 5, name: 'Peter White', email: 'peter@example.com', phone: '123-456-7890' },
    { id: 6, name: 'Anna Brown2', email: 'anna@example.com', phone: '123-456-7890' },
    { id: 7, name: 'Peter White3', email: 'peter@example.com', phone: '123-456-7890' },
  ];

  // Sorting function for static data
  const sortData = (data, sortField, sortOrder) => {
    const sortedData = [...data];
    sortedData.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
    return sortedData;
  };

  // Paginate static data
  const paginateData = (data, page, rowsPerPage) => {
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  // Static data handling
  const getStaticData = () => {
    let sortedData = sortData(staticData, sortField, sortOrder);
    return paginateData(sortedData, page, rowsPerPage);
  };

  // useEffect to fetch data when page, rowsPerPage, or sort parameters change
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, sortField, sortOrder]);

  return (
    <div>
      <h1>Custom Table Examples</h1>

      {/* Example 1: Simple Static Data Table */}
      <h2>1. Simple Static Data Table</h2>
      <CustomTable
        columns={[
          { id: 'name', label: 'Name', sortable: false },
          { id: 'email', label: 'Email', sortable: false },
          { id: 'phone', label: 'Phone', sortable: false },
        ]}
        data={getStaticData()}  // Get paginated and sorted static data
        isLoading={isLoading}
        totalCount={staticData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onSort={handleSort}
        actions={[]} // No actions in this case
      />

      {/* Example 2: Client-Side Data with Pagination */}
      <h2>2. Client-Side Data with Pagination</h2>
      <CustomTable
        columns={[
          { id: 'name', label: 'Name', sortable: false },
          { id: 'email', label: 'Email', sortable: false },
          { id: 'phone', label: 'Phone', sortable: false },
        ]}
        data={getStaticData()} // Get paginated and sorted static data
        isLoading={isLoading}
        totalCount={staticData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onSort={handleSort}
        actions={[]} // No actions in this case
      />

      {/* Example 3: Client-Side Data with Sorting */}
      <h2>3. Client-Side Data with Sorting</h2>
      <CustomTable
        columns={[
          { id: 'name', label: 'Name', sortable: true, sortActive: sortField === 'name', sortDirection: sortOrder },
          { id: 'email', label: 'Email', sortable: true, sortActive: sortField === 'email', sortDirection: sortOrder },
          { id: 'phone', label: 'Phone', sortable: false },
        ]}
        data={getStaticData()} // Get paginated and sorted static data
        isLoading={isLoading}
        totalCount={staticData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onSort={handleSort}
        actions={[]} // No actions in this case
      />

      {/* Example 4: Server-Side Data with Pagination */}
      <h2>4. Server-Side Data with Pagination</h2>
      <CustomTable
        columns={[
          { id: 'name', label: 'Name', sortable: true, sortActive: sortField === 'name', sortDirection: sortOrder },
          { id: 'email', label: 'Email', sortable: false },
          { id: 'phone', label: 'Phone', sortable: false },
        ]}
        data={data}
        isLoading={isLoading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onSort={handleSort}
        actions={[]} // No actions in this case
      />

      {/* Example 5: Server-Side Data with Actions */}
      <h2>5. Server-Side Data with Actions</h2>
      <CustomTable
        columns={[
          { id: 'name', label: 'Name', sortable: true, sortActive: sortField === 'name', sortDirection: sortOrder },
          { id: 'email', label: 'Email', sortable: false },
          { id: 'phone', label: 'Phone', sortable: false },
        ]}
        data={data}
        isLoading={isLoading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onSort={handleSort}
        actions={actions} // Pass actions here (Edit/Delete)
      />
    </div>
  );
};

export default ParentComponent;
