import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DialogComponent = ({
  open,
  onClose,
  title,
  content,
  footerActions,
  className,
  size = 'sm', // Default size is 'sm'
  disableEscapeKeyDown = true, // Default is true
  disableBackdropClick = false, // New prop to disable clicking outside to close
}) => {
  const { cancelText = 'Cancel', addText = 'Add', onCancel, onAdd } = footerActions || {};

  // Updated onClose handler
  const handleClose = (event, reason) => {
    // Prevent dialog close if clicking on backdrop (when disableBackdropClick is true)
    if (reason === 'backdropClick' && disableBackdropClick) {
      event.stopPropagation();
      return;
    }

    // Call the passed onClose handler
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose} // Use handleClose to handle both escape key and backdrop click
      maxWidth={size}  // Customize size (sm, md, lg, xl)
      fullWidth
      disableEscapeKeyDown={disableEscapeKeyDown}
      className={className}  // Allow for custom classes
    >
      {title && (
        <DialogTitle>
          {title}
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}

      {content && (
        <DialogContent
          dividers
          sx={{
            maxHeight: '60vh', // Allow for scrolling if content exceeds height
            overflowY: 'auto',
          }}
        >
          {content}
        </DialogContent>
      )}

      {footerActions && (
        <DialogActions>
          <Button onClick={onCancel} color="primary">
            {cancelText}
          </Button>
          <Button onClick={onAdd} color="primary">
            {addText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

// Prop validation
DialogComponent.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  content: PropTypes.node,
  footerActions: PropTypes.shape({
    cancelText: PropTypes.string,
    addText: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
  }),
  className: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']), // Support different dialog sizes
  disableEscapeKeyDown: PropTypes.bool,
  disableBackdropClick: PropTypes.bool, // New prop to control backdrop click behavior
};

export default DialogComponent;
