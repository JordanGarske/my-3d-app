import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, Box } from '@mui/material';

export const BoxWithPopup = ({ data, onUpdateDimensions }) => {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState('');
  const [length, setLength] = useState('');
  const [objectType, setObjectType] = useState('');

  useEffect(() => {
    if (data) {
      setHeight(data.height || 132); // Default height if not present
      setLength(data.length || 100); // Default length if not present
      setObjectType('cabinet'); // Default object type, you can adjust based on your need
      setOpen(true); // Open the popup when data is available
    }
  }, [data]);

  // Open the popup
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Close the popup
  const handleClose = () => {
    setOpen(false);
  };

  // Handle form submission
  const handleSubmit = (e) => {

    e.preventDefault();
    const updatedData = { ...data, height, newLength: Number(length ), objectType };
    onUpdateDimensions(updatedData); // Update the object dimensions
    setOpen(false);
  };

  return (
    <div>
      {/* Popup Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Enter Object Details</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Box mb={2}>
              <TextField
                label="Height (cm)"
                type="number"
                fullWidth
                variant="outlined"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
              />
            </Box>
            <Box mb={2}>
              <TextField
                label="Length (cm)"
                type="number"
                fullWidth
                variant="outlined"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                required
              />
            </Box>
            <Box mb={2}>
              <FormControl fullWidth>
                <InputLabel>Object Type</InputLabel>
                <Select
                  value={objectType}
                  onChange={(e) => setObjectType(e.target.value)}
                  label="Object Type"
                  required
                >
                  <MenuItem value="cabinet">Cabinet</MenuItem>
                  <MenuItem value="window">Window</MenuItem>
                  <MenuItem value="shelve">Shelve</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Submit
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoxWithPopup;
