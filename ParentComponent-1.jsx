import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomTable from './GenericTable';

const ParentComponent = () => {
  // States for pagination and sorting
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // Ensure it's an integer
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0); // Default page
  const [rowsPerPage, setRowsPerPage] = useState(5); // Default rows per page
  const [sortField, setSortField] = useState('name'); // Default sorting field
  const [sortOrder, setSortOrder] = useState('asc'); // Default sorting order

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

  // Fetch data for server-side (from API)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/users', {
        params: {
          _page: page + 1, // API uses 1-based page index
          _limit: rowsPerPage,
          _sort: sortField,
          _order: sortOrder,
        },
      });
      setData(response.data);
      const totalItems = parseInt(response.headers['x-total-count'], 10) || 100; // Default to 100 if header is missing, and ensure it's an integer
      setTotalCount(totalItems);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    // Ensure page is within valid bounds
    if (newPage >= 0 && newPage < Math.ceil(totalCount / rowsPerPage)) {
      setPage(newPage);
    }
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  // Handle sorting
  const handleSort = (field, order) => {
    setSortField(field);
    setSortOrder(order);
  };

  // useEffect to fetch data when page, rowsPerPage, or sort parameters change
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, sortField, sortOrder]);

  return (
    <div>
      <h1>Custom Table Examples</h1>
      <h2>1. Basic Table</h2>
      <CustomTable
        columns={[
          { id: 'name', label: 'Name', sortable: false },
          { id: 'email', label: 'Email', sortable: false },
          { id: 'phone', label: 'Phone', sortable: false },
        ]}
        data={data}  // Static or fetched data
        isLoading={isLoading}
      />
      {/* Example 1: Static Data Table (Simple) */}
      <h2>1. Static Data Table</h2>
      <CustomTable
        columns={[
          { id: 'name', label: 'Name', sortable: false },
          { id: 'email', label: 'Email', sortable: false },
          { id: 'phone', label: 'Phone', sortable: false },
        ]}
        data={data}  // Static or fetched data
        isLoading={isLoading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onSort={handleSort}
        actions={[]} // No actions for this table
      />

      {/* Example 2: Client-Side Data with Pagination */}
      <h2>2. Client-Side Data with Pagination</h2>
      <CustomTable
        columns={[
          { id: 'name', label: 'Name', sortable: true },
          { id: 'email', label: 'Email', sortable: true },
          { id: 'phone', label: 'Phone', sortable: false },
        ]}
        data={data}  // Static or fetched data
        isLoading={isLoading}
        totalCount={data.length} // Total items in the data array
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onSort={handleSort}
        actions={[]} // No actions for this table
      />

      {/* Example 3: Server-Side Data with Sorting */}
      <h2>3. Server-Side Data with Sorting</h2>
      <CustomTable
        columns={[
          { id: 'name', label: 'Name', sortable: true, sortActive: sortField === 'name', sortDirection: sortOrder },
          { id: 'email', label: 'Email', sortable: true, sortActive: sortField === 'email', sortDirection: sortOrder },
          { id: 'phone', label: 'Phone', sortable: false },
        ]}
        data={data}  // Static or fetched data
        isLoading={isLoading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onSort={handleSort}
        actions={[]} // No actions for this table
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
        actions={[]} // No actions for this table
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
