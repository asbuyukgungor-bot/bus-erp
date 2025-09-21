
import React, { useEffect, useState } from 'react';
import { getParts, type Part } from '../api';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, CircularProgress, Alert, Box, Button
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const PartsList: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        const data = await getParts();
        setParts(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch parts. Is the backend running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom component="div">
          Parts Inventory
        </Typography>
        <Button variant="contained" component={RouterLink} to="/parts/add" startIcon={<Add />}>
          Add New Part
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Part Number</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parts.length > 0 ? (
              parts.map((part, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">{part.name}</TableCell>
                  <TableCell>{part.part_number}</TableCell>
                  <TableCell>{part.supplier}</TableCell>
                  <TableCell align="right">{part.quantity}</TableCell>
                  <TableCell align="right">${part.price.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No parts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PartsList;
