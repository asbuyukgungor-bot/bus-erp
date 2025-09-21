import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';
import { getLocations, Location } from '../../api';

const LocationsList: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Locations
      </Typography>
      <List>
        {locations.map((location) => (
          <ListItem key={location.id}>
            <ListItemText primary={location.name} secondary={`ID: ${location.id}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default LocationsList;
