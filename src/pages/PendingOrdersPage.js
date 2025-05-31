import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CardContent, Button, Modal, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

function PendingOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [deliveryPersonId, setDeliveryPersonId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Fetch orders function
  const fetchOrders = async () => {
    try {
      const response = await fetch('https://api.agrivemart.com/api/delivery/orders');
      const data = await response.json();

      console.log('Fetched orders:', data);

      // Filter the orders where status is 'pending'
      const pendingOrders = data.data?.filter(order => order.status === 'pending');

      // Flatten the filtered orders data
      const flattenedOrders = pendingOrders?.map(order => ({
        ...order,
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
      }));

      console.log('Flattened Pending Orders:', flattenedOrders);

      setOrders(flattenedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []); // Empty dependency array to only run once on mount

  // Handle accepting the order
  const handleAcceptOrder = async () => {
    if (!deliveryPersonId) {
      alert('Please enter a valid Delivery Person ID');
      return;
    }

    try {
      const response = await fetch('https://api.agrivemart.com/api/delivery/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrderId,
          deliveryPersonId: deliveryPersonId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.orderId === selectedOrderId
              ? { ...order, status: 'accepted', deliveryPersonName: data.deliveryPerson.name }
              : order
          )
        );
        fetchOrders(); // Re-fetch orders after accepting the order
      } else {
        alert(data.message || 'Failed to accept the order');
      }
      setOpenModal(false); // Close the modal after accepting the order
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Error accepting order');
    }
  };

  // Columns for DataGrid
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
    {
      field: 'accept',
      headerName: 'Accept Order',
      width: 150,
      renderCell: (params) => {
        return params.row.status === 'pending' ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedOrderId(params.row.orderId); // Store the selected order ID
              setOpenModal(true); // Open the modal
            }}
          >
            Accept
          </Button>
        ) : (
          'N/A'
        );
      },
    },
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
                  Pending Orders
                </Typography>

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
            No pending orders available
          </Typography>
        )}

        {/* Modal for entering delivery person ID */}
        <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="modal-title" aria-describedby="modal-description">
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              backgroundColor: 'white',
              padding: 2,
              borderRadius: 2,
              boxShadow: 24,
            }}
          >
            <Typography id="modal-title" variant="h6" component="h2" sx={{ marginBottom: 2 }}>
              Enter Delivery Person ID
            </Typography>
            <TextField
              fullWidth
              label="Delivery Person ID"
              variant="outlined"
              value={deliveryPersonId}
              onChange={(e) => setDeliveryPersonId(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="contained" color="secondary" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleAcceptOrder}>
                Accept Order
              </Button>
            </Box>
          </Box>
        </Modal>
      </CardContent>
    </Container>
  );
}

export default PendingOrdersPage;
