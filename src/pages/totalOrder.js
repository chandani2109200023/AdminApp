import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const TotalOrderPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://api.agrivemart.com/api/delivery/orders');
        const result = await response.json();

        if (!result || !result.data) {
          console.error('Invalid API response:', result);
          return;
        }

        console.log('Fetched all orders:', result.data);

        // Map and flatten orders to ensure proper data formatting
        const formattedOrders = result.data.map(order => ({
          orderId: order.orderId || `N/A-${Math.random()}`, // Ensure valid row ID
          status: order.status || 'N/A',
          amount: order.amount || 0,
          userId: order.address?.userId || 'N/A',
          userName: order.address?.fullName || 'N/A',
          userPhoneNumber: order.address?.phoneNumber || 'N/A',
          state: order.address?.state || 'N/A',
          pincode: order.address?.pincode || 'N/A',
          houseDetails: order.address?.houseDetails || 'N/A',
          roadDetails: order.address?.roadDetails || 'N/A',
          deliveryPersonId: order.deliveryPerson?.id || 'N/A',
          deliveryPersonName: order.deliveryPerson?.name || 'N/A',
          deliveryPersonPhone: order.deliveryPerson?.phone || 'N/A',
          createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A', // Format date
        }));

        console.log('Formatted Orders:', formattedOrders);

        // Update state with all orders
        setOrders(formattedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const columns = [
    { field: 'orderId', headerName: 'Order ID', width: 250 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'amount', headerName: 'Amount (₹)', width: 150 },
    { field: 'userId', headerName: 'User ID', width: 150 },
    { field: 'userName', headerName: 'User Name', width: 200 },
    { field: 'userPhoneNumber', headerName: 'User Phone Number', width: 180 },
    { field: 'state', headerName: 'State', width: 150 },
    { field: 'pincode', headerName: 'Pincode', width: 150 },
    { field: 'houseDetails', headerName: 'House Details', width: 250 },
    { field: 'roadDetails', headerName: 'Road Details', width: 250 },
    { field: 'deliveryPersonId', headerName: 'Delivery Person ID', width: 180 },
    { field: 'deliveryPersonName', headerName: 'Delivery Person Name', width: 200 },
    { field: 'deliveryPersonPhone', headerName: 'Delivery Person Phone', width: 180 },
    { field: 'createdAt', headerName: 'Created At', width: 200 },
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
          All Orders
        </Typography>
        {orders.length > 0 ? (
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={orders}
              columns={columns}
              pageSize={5}
              getRowId={(row) => row.orderId} // Ensure row ID is correctly set
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
};

export default TotalOrderPage;
