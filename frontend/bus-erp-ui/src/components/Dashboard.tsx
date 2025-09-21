import React, { useEffect, useState } from 'react';
import { getDashboardStats, type DashboardStats as Stats } from '../api';
import { Grid, Card, CardContent, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { Inventory, Warning, DirectionsBus, Build } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: color, color: '#fff' }}>
    <Box sx={{ mr: 2 }}>{icon}</Box>
    <Box>
      <Typography variant="h6">{value}</Typography>
      <Typography variant="subtitle2">{title}</Typography>
    </Box>
  </Card>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
        <Typography variant="h4" gutterBottom>
            Dashboard
        </Typography>
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Parts" value={stats?.total_parts ?? 0} icon={<Inventory sx={{ fontSize: 40 }}/>} color="#1976d2" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Low Stock" value={stats?.low_stock_parts ?? 0} icon={<Warning sx={{ fontSize: 40 }}/>} color="#d32f2f" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Vehicles" value={stats?.total_vehicles ?? 0} icon={<DirectionsBus sx={{ fontSize: 40 }}/>} color="#388e3c" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Open Work Orders" value={stats?.open_work_orders ?? 0} icon={<Build sx={{ fontSize: 40 }}/>} color="#f57c00" />
            </Grid>
        </Grid>
    </Box>
  );
};

export default Dashboard;