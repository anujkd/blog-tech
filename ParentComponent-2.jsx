import React, { useState } from 'react';
import { Button } from '@mui/material';
import DialogComponent from './DialogComponent';

const ParentComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleCancel = () => {
    console.log('Cancel button clicked');
    closeDialog();
  };

  const handleAdd = () => {
    console.log('Add button clicked');
    closeDialog();
  };

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={openDialog}>
        Open Dialog
      </Button>

      <DialogComponent
        open={dialogOpen}
        onClose={closeDialog}
        title="Dialog Title"
        content={
          <div>
            <p>
              This is some content that may be long enough to require scrolling.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia
              odio vitae vestibulum. Etiam vehicula eros ac augue scelerisque, ac scelerisque
              arcu condimentum. Curabitur et nisi ut orci hendrerit aliquet.
            </p>
            <p>
              More content can go here...
            </p>
          </div>
        }
        footerActions={{
          cancelText: 'Cancel',
          addText: 'Add Item',
          onCancel: handleCancel,
          onAdd: handleAdd,
        }}
        size="md" // You can change this to sm, lg, xl as needed
        disableEscapeKeyDown={false} // Optionally disable the escape key behavior
        disableBackdropClick={true} // Disable closing the dialog by clicking outside
        className="custom-dialog" // Custom class for styling
      />
    </div>
  );
};

export default ParentComponent;
