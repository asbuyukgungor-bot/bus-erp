import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import Dashboard from './components/Dashboard';
import PartsList from './components/PartsList';
import AddPartForm from './components/AddPartForm';
import VehicleList from './components/VehicleList';
import AddVehicleForm from './components/AddVehicleForm';
import WorkOrderList from './components/WorkOrderList';
import AddWorkOrderForm from './components/AddWorkOrderForm';
import LocationsList from './components/LocationsList';
import './App.css';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Bus ERP
            </Typography>
            <Button color="inherit" component={RouterLink} to="/">
              Dashboard
            </Button>
            <Button color="inherit" component={RouterLink} to="/work-orders">
              Work Orders
            </Button>
            <Button color="inherit" component={RouterLink} to="/vehicles">
              Vehicles
            </Button>
            <Button color="inherit" component={RouterLink} to="/parts">
              Parts
            </Button>
            <Button color="inherit" component={RouterLink} to="/locations">
              Locations
            </Button>
          </Toolbar>
        </AppBar>
        <Container component="main" sx={{ mt: 10, p: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/parts" element={<PartsList />} />
            <Route path="/parts/add" element={<AddPartForm />} />
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/add" element={<AddVehicleForm />} />
            <Route path="/work-orders" element={<WorkOrderList />} />
            <Route path="/work-orders/add" element={<AddWorkOrderForm />} />
            <Route path="/locations" element={<LocationsList />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;