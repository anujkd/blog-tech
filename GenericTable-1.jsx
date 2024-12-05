import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Paper,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Update function parameters to provide defaults
const CustomTable = ({
  columns = [],
  data = [],
  totalCount = 0,
  page = 0,
  rowsPerPage = 5,
  isLoading = false,
  onPageChange = () => {}, // Default empty function
  onRowsPerPageChange = () => {}, // Default empty function
  onSort = () => {}, // Default empty function
  actions = [],
}) => {
  // Default totalCount if not provided
  const actualTotalCount = totalCount || data.length;

  const [sortDirection, setSortDirection] = useState('asc');
  const [sortField, setSortField] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Handle sorting direction toggle
  const handleRequestSort = (property) => {
    const isAsc = sortField === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(property);
    if (onSort) {
      onSort(property, isAsc ? 'desc' : 'asc');
    }
  };

  // Handle row action menu
  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleAction = (action) => {
    if (action.handler) {
      action.handler(selectedRow);
    }
    handleMenuClose();
  };

  const handleChangePage = (event, newPage) => {
    if (onPageChange) {
      onPageChange(event, newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(event);
    }
  };

  const renderTableBody = () => {
    return data.map((row) => (
      <TableRow hover key={row.id}>
        {columns.map((column) => (
          <TableCell key={column.id} align="left">
            {row[column.id]}
          </TableCell>
        ))}
        {/* Add action button in the last column */}
        {actions.length > 0 && (
          <TableCell>
            <IconButton onClick={(e) => handleMenuClick(e, row)}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              keepMounted
            >
              {actions.map((action, index) => (
                <MenuItem key={index} onClick={() => handleAction(action)}>
                  {action.label}
                </MenuItem>
              ))}
            </Menu>
          </TableCell>
        )}
      </TableRow>
    ));
  };

  // Handle sorting indicator for sortable columns
  const getSorting = (property) => {
    if (sortField === property) {
      return sortDirection === 'asc' ? 'ascending' : 'descending';
    }
    return false;
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} sortDirection={getSorting(column.id)}>
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortField === column.id}
                      direction={sortField === column.id ? sortDirection : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {actions.length > 0 && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)}>
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              renderTableBody()
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={actualTotalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

// Prop Types validation
CustomTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCount: PropTypes.number,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  isLoading: PropTypes.bool,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSort: PropTypes.func,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      handler: PropTypes.func.isRequired,
    })
  ),
};

export default CustomTable;
