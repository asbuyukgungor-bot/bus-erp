
import React, { useEffect, useState } from 'react';
import { getWorkOrders, type WorkOrder } from '../api';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, CircularProgress, Alert, Chip, Box, Button
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = 'default';
  if (status === 'Completed') color = 'success';
  if (status === 'In Progress') color = 'primary';
  if (status === 'Pending') color = 'warning';

  return <Chip label={status} color={color} />;
};

const WorkOrderList: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const data = await getWorkOrders();
        setWorkOrders(data);
      } catch (err) {
        setError('Failed to fetch work orders.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
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
          Work Orders
        </Typography>
        <Button variant="contained" component={RouterLink} to="/work-orders/add" startIcon={<Add />}>
          Add New Work Order
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="work order table">
          <TableHead>
            <TableRow>
              <TableCell>Vehicle VIN</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Items Used</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workOrders.length > 0 ? (
              workOrders.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell>{wo.vehicle_vin}</TableCell>
                  <TableCell>{wo.description}</TableCell>
                  <TableCell>{wo.items_used.length}</TableCell>
                  <TableCell>
                    <StatusChip status={wo.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No work orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default WorkOrderList;
