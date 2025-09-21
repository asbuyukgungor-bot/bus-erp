
import React from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import Dashboard from './components/Dashboard';
import PartsList from './components/PartsList';
import AddPartForm from './components/AddPartForm';
import VehicleList from './components/VehicleList';
import AddVehicleForm from './components/AddVehicleForm';
import WorkOrderList from './components/WorkOrderList';
import AddWorkOrderForm from './components/AddWorkOrderForm';
import LocationsList from './components/LocationsList';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import './App.css';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
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
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 10, p: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/parts" element={<ProtectedRoute><AppLayout><PartsList /></AppLayout></ProtectedRoute>} />
        <Route path="/parts/add" element={<ProtectedRoute><AppLayout><AddPartForm /></AppLayout></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><AppLayout><VehicleList /></AppLayout></ProtectedRoute>} />
        <Route path="/vehicles/add" element={<ProtectedRoute><AppLayout><AddVehicleForm /></AppLayout></ProtectedRoute>} />
        <Route path="/work-orders" element={<ProtectedRoute><AppLayout><WorkOrderList /></AppLayout></ProtectedRoute>} />
        <Route path="/work-orders/add" element={<ProtectedRoute><AppLayout><AddWorkOrderForm /></AppLayout></ProtectedRoute>} />
        <Route path="/locations" element={<ProtectedRoute><AppLayout><LocationsList /></AppLayout></ProtectedRoute>} />
      </Routes>
  );
}

export default App;
