import React, { useState } from 'react';
import { Button, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Stepper, Step, StepLabel, Typography } from '@mui/material';
import DialogComponent from './DialogComponent';
import { useDropzone } from 'react-dropzone';
import { CheckCircle, CloudUpload, Download } from '@mui/icons-material';
import * as XLSX from 'xlsx'; // Import xlsx for parsing Excel files
import GenericTable2 from './GenericTable2'; // Assuming you have this component

const ParentComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('single'); // 'single' or 'bulk'
  const [step, setStep] = useState(0); // For stepper (Upload, Validate, Save)
  const [file, setFile] = useState(null); // For file storage
  const [fileError, setFileError] = useState(null); // For handling file errors
  const [fileData, setFileData] = useState([]); // To store parsed rows from Excel
  const [columnDefs, setColumnDefs] = useState([]); // Column definitions for Ag-Grid
  const [showTable, setShowTable] = useState(false); // To control table visibility on the page

  // Open dialog
  const openDialog = () => {
    setDialogOpen(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogOpen(false);
  };

  // Handle radio button change for entity type selection
  const handleRadioChange = (event) => {
    setSelectedEntity(event.target.value);
    setStep(0); // Reset the stepper when toggling between radio buttons
    setFile(null); // Reset file when switching
    setFileError(null); // Reset file error
  };

  // Cancel the dialog
  const handleCancel = () => {
    closeDialog();
  };

  // Handle Add (Save) action
  const handleAdd = () => {
    console.log('Data saved');
    setShowTable(true); // Display the table once the user clicks Save
    closeDialog();
  };

  // Handle re-upload action
  const handleReupload = () => {
    setFile(null); // Reset file
    setStep(0); // Reset stepper to "Upload"
    setFileError(null); // Reset any error
    setFileData([]); // Clear file data
    setShowTable(false); // Hide the table when re-uploading
  };

  // Handle file drop (upload)
  const handleDrop = (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    setStep(1); // Move to validation step immediately after file upload
    setFileError(null); // Clear any previous errors
    parseExcelFile(uploadedFile); // Parse the Excel file
  };

  // Parse Excel file
  const parseExcelFile = (uploadedFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0]; // Assuming we want the first sheet
      const sheet = workbook.Sheets[sheetName];

      // Parse the rows to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      if (jsonData.length === 0) {
        setFileError('The file is empty or invalid.');
        return;
      }

      // Set the columnDefs based on the keys in the first row
      const columns = Object.keys(jsonData[0]).map((key) => ({
        headerName: key,
        field: key,
        sortable: true,
        filter: true,
      }));
      setColumnDefs(columns);
      
      // Set the parsed rows (data)
      setFileData(jsonData);
      
      // Proceed to the next step (Save)
      setStep(2);
    };
    reader.readAsBinaryString(uploadedFile);
  };

  // File dropzone setup
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: '.xls,.xlsx,.csv', // Accepted file types
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
              </div>
            ) : (
              <div>
                {/* Bulk Entity section */}
                <Stepper activeStep={step} alternativeLabel>
                  {steps.map((label, index) => (
                    <Step key={index}>
                      <StepLabel
                        sx={{
                          color: index === step ? 'blue' : index < step ? 'green' : 'grey', // Active, completed, and default color
                          '& .MuiStepIcon-root': {
                            color: index === step ? 'blue' : index < step ? 'green' : 'grey', // Icon color
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {step === 0 && (
                  <div>
                    <Typography variant="body2" style={{ marginTop: 10 }}>
                      Upload file with entities to be added to the producer
                    </Typography>
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
          addText: file ? 'Reupload' : 'Add Item',
          onCancel: handleCancel,
          onAdd: file ? handleReupload : handleAdd,
        }}
        size="md"
        disableEscapeKeyDown={false}
        disableBackdropClick={true}
      />

      {/* Render the table only after the user clicks Save */}
      {showTable && (
        <div style={{ marginTop: '20px' }}>
          <GenericTable2
            columnDefs={columnDefs}
            rowData={fileData} // Pass the parsed data to the table
            paginationPageSize={10}
          />
        </div>
      )}
    </div>
  );
};

export default ParentComponent;
