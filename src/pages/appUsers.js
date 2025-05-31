import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const AppUsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAppUsers = async () => {
      const token = localStorage.getItem('authToken');  // Get token from localStorage

      try {
        const response = await fetch('https://api.agrivemart.com/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,  // Add token to Authorization header
          }
        });
        const data = await response.json();
        console.log('Fetched app users:', data);

        // Assuming the users array is in `data` and contains name, phone, and email
        setUsers(data); 
      } catch (error) {
        console.error('Error fetching app users:', error);
      }
    };

    fetchAppUsers();
  }, []);

  const columns = [
    { field: '_id', headerName: 'ID', width: 250 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'email', headerName: 'Email', width: 250 },
  ];

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        padding: 3,
        backgroundColor: '#2C3E50',
        borderRadius: 2,
        width: '100%',
        flexDirection: 'column',
      }}
    >
      <CardContent>
         <Typography
                  variant="h4"
                  gutterBottom
                  sx={{
                    color: '#F1C40F',
                    textAlign: 'center',
                    width: '100%', // Ensures it takes full width
                    display: 'flex',
                    justifyContent: 'center', // Centers content horizontally
                  }}
                >
                  App Users
                </Typography>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            pageSize={5}
            getRowId={(row) => row._id}  // Ensure _id exists in the response
            sx={{
              backgroundColor: '#90B0CA',
              color: '#1C2833',
              '.MuiDataGrid-columnHeaders': { backgroundColor: '#1F618D' },
              '.MuiDataGrid-footerContainer': { backgroundColor: '#1F618D' },
            }}
          />
        </Box>
      </CardContent>
    </Container>
  );
};

export default AppUsersPage;
