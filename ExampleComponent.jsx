import React, { useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

// Global Snackbar Configuration
const snackbarConfig = {
  defaultDuration: 3000,
  defaultPosition: { 
    vertical: 'top', 
    horizontal: 'right' 
  },
  defaultVariant: 'filled'
};

// Snackbar Configuration Utilities
export const snackbarUtils = {
  // Update global snackbar configuration
  updateConfig: (config) => {
    Object.assign(snackbarConfig, config);
  },

  // Get current configuration
  getConfig: () => ({ ...snackbarConfig })
};

// Custom Snackbar Hook
export const useSnackbar = () => {
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'info',
    variant: snackbarConfig.defaultVariant
  });

  // Show Snackbar with flexible configuration
  const showSnackbar = useCallback((
    message, 
    severity = 'info', 
    options = {}
  ) => {
    setSnackbarState({
      open: true,
      message,
      severity,
      variant: options.variant || snackbarConfig.defaultVariant,
      ...options
    });
  }, []);

  // Hide Snackbar
  const hideSnackbar = useCallback(() => {
    setSnackbarState(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  return {
    showSnackbar,
    hideSnackbar,
    snackbarState
  };
};

// Configurable Snackbar Component
export const ConfigurableSnackbar = ({ 
  open, 
  onClose, 
  message, 
  severity = 'info', 
  variant,
  autoHideDuration,
  anchorOrigin,
  ...props 
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration || snackbarConfig.defaultDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin || snackbarConfig.defaultPosition}
      {...props}
    >
      <Alert 
        onClose={onClose} 
        severity={severity}
        variant={variant || snackbarConfig.defaultVariant}
        sx={{ width: '100%', ...props.sx }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Example Usage Component
export const ExampleComponent = () => {
  const { showSnackbar, hideSnackbar, snackbarState } = useSnackbar();

  // Update global Snackbar configuration
  const handleUpdateConfig = () => {
    snackbarUtils.updateConfig({
      defaultDuration: 5000,
      defaultVariant: 'outlined'
    });
  };

  // Show different types of Snackbars
  const handleShowSnackbars = () => {
    // Success Snackbar with default configuration
    showSnackbar('Operation successful!', 'success');

    // Error Snackbar with custom configuration
    showSnackbar('An error occurred', 'success', {
      variant: 'filled',
      anchorOrigin: { vertical: 'top', horizontal: 'center' }
    });
  };

  return (
    <div>
      <button onClick={handleShowSnackbars}>
        Show Snackbars
      </button>

      <ConfigurableSnackbar
        open={snackbarState.open}
        onClose={hideSnackbar}
        message={snackbarState.message}
        severity={snackbarState.severity}
        variant={snackbarState.variant}
      />
    </div>
  );
};

export default ExampleComponent;