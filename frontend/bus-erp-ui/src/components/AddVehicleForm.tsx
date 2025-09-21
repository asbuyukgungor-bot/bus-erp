
import React, { useState } from 'react';
import { addVehicle } from '../api';
import { TextField, Button, Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';

const AddVehicleForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await addVehicle(formData);
      setSuccess(`Successfully added vehicle: ${formData.name}`);
      setFormData({ name: '', vin: '', make: '', model: '', year: new Date().getFullYear() });
    } catch (err) {
      setError('Failed to add vehicle. Please check the details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Add New Vehicle
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField margin="normal" required fullWidth id="name" label="Vehicle Name (e.g., Bus-103)" name="name" autoFocus value={formData.name} onChange={handleChange} />
        <TextField margin="normal" required fullWidth id="vin" label="VIN" name="vin" value={formData.vin} onChange={handleChange} />
        <TextField margin="normal" required fullWidth id="make" label="Make (e.g., Mercedes-Benz)" name="make" value={formData.make} onChange={handleChange} />
        <TextField margin="normal" required fullWidth id="model" label="Model (e.g., Tourismo)" name="model" value={formData.model} onChange={handleChange} />
        <TextField margin="normal" required fullWidth id="year" label="Year" name="year" type="number" value={formData.year} onChange={handleChange} />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Add Vehicle'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Box>
    </Paper>
  );
};

export default AddVehicleForm;
