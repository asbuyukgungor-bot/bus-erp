import React, { useEffect, useState } from 'react';
import { addWorkOrder, getVehicles, getParts, type Vehicle, type Part, type WorkOrderItem } from '../api';
import { 
    TextField, Button, Box, Typography, Paper, CircularProgress, Alert, Select, 
    MenuItem, InputLabel, FormControl, Grid, IconButton, List, ListItem, ListItemText 
} from '@mui/material';
import { AddCircleOutline, Delete } from '@mui/icons-material';

const AddWorkOrderForm: React.FC = () => {
  // Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  
  // Form states
  const [description, setDescription] = useState('');
  const [selectedVin, setSelectedVin] = useState('');
  const [itemsUsed, setItemsUsed] = useState<WorkOrderItem[]>([]);

  // Item selection states
  const [selectedPartNumber, setSelectedPartNumber] = useState('');
  const [quantity, setQuantity] = useState(1);

  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, partsData] = await Promise.all([getVehicles(), getParts()]);
        setVehicles(vehiclesData);
        setParts(partsData);
      } catch (err) {
        setError('Failed to load vehicles and parts data.');
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    if (!selectedPartNumber || quantity <= 0) {
        setError('Please select a part and specify a valid quantity.');
        return;
    }
    // Prevent adding the same part twice
    if (itemsUsed.find(item => item.part_number === selectedPartNumber)) {
        setError('This part has already been added to the work order.');
        return;
    }
    setItemsUsed(prev => [...prev, { part_number: selectedPartNumber, quantity_used: quantity }]);
    setSelectedPartNumber('');
    setQuantity(1);
    setError(null);
  };

  const handleRemoveItem = (partNumber: string) => {
    setItemsUsed(prev => prev.filter(item => item.part_number !== partNumber));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVin || !description) {
        setError('Please select a vehicle and provide a description.');
        return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await addWorkOrder({ vehicle_vin: selectedVin, description, items_used: itemsUsed });
      setSuccess(`Successfully created work order for vehicle ${selectedVin}`);
      // Reset form
      setDescription('');
      setSelectedVin('');
      setItemsUsed([]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create work order.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Add New Work Order</Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <FormControl fullWidth required>
                    <InputLabel id="vehicle-select-label">Vehicle</InputLabel>
                    <Select
                        labelId="vehicle-select-label"
                        value={selectedVin}
                        label="Vehicle"
                        onChange={e => setSelectedVin(e.target.value)}
                    >
                        {vehicles.map(v => <MenuItem key={v.vin} value={v.vin}>{v.name} ({v.vin})</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12}>
                <TextField required fullWidth label="Description" name="description" value={description} onChange={e => setDescription(e.target.value)} />
            </Grid>
            <Grid item xs={12}><Typography variant="h6">Parts Used</Typography></Grid>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel id="part-select-label">Part</InputLabel>
                    <Select
                        labelId="part-select-label"
                        value={selectedPartNumber}
                        label="Part"
                        onChange={e => setSelectedPartNumber(e.target.value)}
                    >
                        {parts.map(p => <MenuItem key={p.part_number} value={p.part_number}>{p.name} (Stock: {p.quantity})</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
                <TextField label="Quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} InputProps={{ inputProps: { min: 1 } }} />
            </Grid>
            <Grid item xs={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button variant="outlined" onClick={handleAddItem} startIcon={<AddCircleOutline />}>Add Part</Button>
            </Grid>
            {itemsUsed.length > 0 && (
                <Grid item xs={12}>
                    <List dense>
                        {itemsUsed.map(item => {
                            const part = parts.find(p => p.part_number === item.part_number);
                            return (
                                <ListItem key={item.part_number} secondaryAction={<IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(item.part_number)}><Delete /></IconButton>}>
                                    <ListItemText primary={part?.name || item.part_number} secondary={`Quantity: ${item.quantity_used}`} />
                                </ListItem>
                            );
                        })}
                    </List>
                </Grid>
            )}
            <Grid item xs={12}>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Create Work Order'}
                </Button>
            </Grid>
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Box>
    </Paper>
  );
};

export default AddWorkOrderForm;