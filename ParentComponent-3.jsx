import React, { useState } from 'react';
import { Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Stepper, Step, StepLabel, Typography } from '@mui/material';
import DialogComponent from './DialogComponent';
import { useDropzone } from 'react-dropzone'; // Importing react-dropzone
import { CheckCircle, CloudUpload, Download } from '@mui/icons-material'; // Import the Download icon

const ParentComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('single'); // 'single' or 'bulk'
  const [step, setStep] = useState(0); // For stepper (Upload, Validate, Save)
  const [file, setFile] = useState(null); // For file storage
  const [fileError, setFileError] = useState(null); // For handling file errors

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleRadioChange = (event) => {
    setSelectedEntity(event.target.value);
    setStep(0); // Reset the stepper when toggling between radio buttons
    setFile(null); // Reset file when switching
    setFileError(null); // Reset file error
  };

  const handleCancel = () => {
    console.log('Cancel button clicked');
    closeDialog();
  };

  const handleAdd = () => {
    console.log('Add button clicked');
    closeDialog();
  };

  const handleReupload = () => {
    setFile(null); // Reset file
    setStep(0); // Reset stepper to "Upload"
    setFileError(null); // Reset any error
  };

  const handleDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    setStep(1); // Move to validation step immediately after file upload
    setFileError(null); // Clear any previous errors
    validateFile(acceptedFiles[0]); // Simulate file validation
  };

  // Simulated file validation function
  const validateFile = (file) => {
    // Example: Simulate validation (in real case, you can check file content or type)
    if (file.size > 2000000) { // Simulate file size validation (2MB limit)
      setFileError('File is too large. Please upload a smaller file.');
    } else {
      setStep(2); // Move to the next step if valid
    }
  };

  // File dropzone setup
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: '.csv,.xlsx,.xls', // Accepted file types
  });

  const steps = ['Upload File', 'Validate', 'Save'];

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
            <FormControl component="fieldset">
              <FormLabel component="legend">Select Entity Type</FormLabel>
              <RadioGroup value={selectedEntity} onChange={handleRadioChange}>
                <FormControlLabel value="single" control={<Radio />} label="Single Entity" />
                <FormControlLabel value="bulk" control={<Radio />} label="Bulk Entity" />
              </RadioGroup>
            </FormControl>

            {selectedEntity === 'single' ? (
              <div>
                <Typography variant="body1">Single Entity selected</Typography>
                {/* Add the content for Single Entity here */}
              </div>
            ) : (
              <div>
                {/* Bulk Entity section */}
                <Stepper activeStep={step} alternativeLabel>
                  {steps.map((label, index) => (
                    <Step key={index}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {step === 0 && (
                  <div>
                    <Typography variant="body2" style={{ marginTop: 10 }}>
                      Upload file with entities to be added to the producer
                    </Typography>
                    {/* Always visible Download Template button with icon */}
                    <Button
                      variant="outlined"
                      color="secondary"
                      style={{ marginTop: 10 }}
                      startIcon={<Download />} // Adding the Download icon to the button
                    >
                      Download Template
                    </Button>

                    {!file ? (
                      <div
                        {...getRootProps()}
                        style={{
                          border: '2px dashed #ccc',
                          padding: '20px',
                          marginTop: '20px',
                          textAlign: 'center',
                        }}
                      >
                        <input {...getInputProps()} />
                        <Typography variant="body2">
                          <CloudUpload color="primary" />
                          <div>Drag & Drop or Click to Upload</div>
                        </Typography>
                      </div>
                    ) : (
                      <div>
                        <Typography variant="body2" style={{ marginTop: 10 }}>
                          File Selected: {file.name}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="primary"
                          style={{ marginTop: 10 }}
                          onClick={() => setStep(1)}
                        >
                          File Selected
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <Typography variant="body2" style={{ marginTop: 10 }}>
                      Validating file...
                    </Typography>
                    {fileError && (
                      <Typography variant="body2" color="error" style={{ marginTop: 10 }}>
                        {fileError}
                      </Typography>
                    )}
                    {!fileError && (
                      <Button
                        variant="outlined"
                        color="primary"
                        style={{ marginTop: 10 }}
                        onClick={() => setStep(2)}
                      >
                        Validate
                      </Button>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <Typography variant="body2" style={{ marginTop: 10 }}>
                      File successfully validated. Click Save to proceed.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      style={{ marginTop: 10 }}
                      onClick={handleAdd}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        }
        footerActions={{
          cancelText: 'Cancel',
          addText: file ? 'Reupload' : 'Add Item', // Change button text after file is uploaded
          onCancel: handleCancel,
          onAdd: file ? handleReupload : handleAdd, // Reupload on clicking "Reupload"
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
