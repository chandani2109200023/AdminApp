import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CardContent, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

function TodayOrderDeliverPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://apii.agrivemart.com/api/delivery/orders');
        const data = await response.json();

        // Get today's date
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        // Filter the orders where createdAt matches today's date
        const todayOrders = data.data?.filter(order => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate === todayString;  // Compare only the date part
        });

        // Flatten the filtered orders data
        const flattenedOrders = todayOrders?.map(order => ({
          ...order,
          userId: order.address?.userId || 'N/A',
          userName: order.address?.fullName || 'N/A',
          userPhoneNumber: order.address?.phoneNumber || 'N/A',
          state: order.address?.state || 'N/A',
          pincode: order.address?.pincode || 'N/A',
          houseDetails: order.address?.houseDetails || 'N/A',
          roadDetails: order.address?.roadDetails || 'N/A',
          deliveryPersonName: order.deliveryPerson?.name || 'N/A',
          deliveryPersonPhone: order.deliveryPerson?.phone || 'N/A',
          deliveryPersonId: order.deliveryPerson?.id || 'N/A',
        }));

        setOrders(flattenedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);  // Empty dependency array to only run once on mount


  const columns = [
    { field: 'orderId', headerName: 'Order ID', width: 250 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'amount', headerName: 'Amount (₹)', width: 150 },
    { field: 'userId', headerName: 'User Id', width: 150 },
    { field: 'userName', headerName: 'User Name', width: 150 },
    { field: 'userPhoneNumber', headerName: 'User PhoneNumber', width: 150 },
    { field: 'state', headerName: 'State', width: 150 },
    { field: 'pincode', headerName: 'Pincode', width: 150 },
    { field: 'houseDetails', headerName: 'House Details', width: 250 },
    { field: 'roadDetails', headerName: 'Road Details', width: 250 },
    { field: 'deliveryPersonId', headerName: 'Delivery Person Id', width: 150 },
    { field: 'deliveryPersonName', headerName: 'Delivery Person Name', width: 200 },
    { field: 'deliveryPersonPhone', headerName: 'Delivery Person Phone', width: 150 },
    { field: 'createdAt', headerName: 'Created At', width: 180 },
  ];

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        padding: 1,
        backgroundColor: '#2C3E50',
        borderRadius: 2,
        width: '100%',
        height: '100vh',
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
          Total Orders Delivered Today
        </Typography>

        {/* Display a message if there are no orders */}
        {orders && orders.length > 0 ? (
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={orders}
              columns={columns}
              pageSize={5}
              getRowId={(row) => row?.orderId || row?.id || 'N/A'}
              sx={{
                backgroundColor: '#90B0CA',
                color: '#1C2833',
                '.MuiDataGrid-columnHeaders': { backgroundColor: '#1F618D' },
                '.MuiDataGrid-footerContainer': { backgroundColor: '#1F618D' },
              }}
            />
          </Box>
        ) : (
          <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
            No orders available
          </Typography>
        )}
      </CardContent>
    </Container>
  );
}

export default TodayOrderDeliverPage;
