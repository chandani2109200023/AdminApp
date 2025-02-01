import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const DeliveryPersons = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchDeliveryPersons = async () => {
            try {
                const response = await fetch('https://sastabazar.onrender.com/api/delivery/delivery-persons');
                const data = await response.json();
                console.log('Fetched delivery persons:', data);

                // Assuming the delivery persons are in `data.data`
                if (Array.isArray(data.data)) {
                    setUsers(data.data);  // Set the delivery persons list
                } else {
                    console.error('Invalid data structure for delivery persons:', data);
                }
            } catch (error) {
                console.error('Error fetching delivery persons:', error);
            }
        };

        fetchDeliveryPersons();
    }, []);

    const columns = [
        { field: 'userId', headerName: 'ID', width: 250 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'phone', headerName: 'Phone', width: 150 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'vehicle', headerName: 'Vehicle', width: 250 },
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
                          Delivery Persons
                        </Typography>
                <Box sx={{ height: 500, width: '100%' }}>
                    <DataGrid
                        rows={users}
                        columns={columns}
                        pageSize={5}
                        getRowId={(row) => row._id || row.userId || 'N/A'} // Ensure unique row id
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

export default DeliveryPersons;
