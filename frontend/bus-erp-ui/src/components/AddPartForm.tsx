import React, { useState } from 'react';
import { addPart, type Part } from '../api';
import { TextField, Button, Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';

const AddPartForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    part_number: '',
    supplier: '',
    quantity: 0,
    price: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await addPart(formData);
      setSuccess(`Successfully added part: ${formData.name}`);
      // Reset form
      setFormData({
        name: '',
        part_number: '',
        supplier: '',
        quantity: 0,
        price: 0,
      });
    } catch (err) {
      setError('Failed to add part. Please check the details and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Add New Part
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Part Name"
          name="name"
          autoFocus
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="part_number"
          label="Part Number"
          name="part_number"
          value={formData.part_number}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="supplier"
          label="Supplier"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="quantity"
          label="Quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="price"
          label="Price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Part'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Box>
    </Paper>
  );
};

export default AddPartForm;