import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CardContent,
  Button,
  Modal,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

function PendingOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [deliveryPersonId, setDeliveryPersonId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [deliveryPersons, setDeliveryPersons] = useState([]);

  // ✅ Fetch delivery persons
  const fetchDeliveryPersons = async () => {
    try {
      const response = await fetch('https://apii.agrivemart.com/api/delivery/delivery-persons');
      const data = await response.json();
      if (Array.isArray(data.data)) {
        setDeliveryPersons(data.data);
      } else {
        console.error('Invalid delivery persons data:', data);
      }
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
    }
  };

  // ✅ Fetch pending orders
  const fetchOrders = async () => {
    try {
      const response = await fetch('https://apii.agrivemart.com/api/delivery/orders');
      const data = await response.json();

      console.log('Fetched orders:', data);

      const pendingOrders = data.data?.filter((order) => order.status === 'pending') || [];

      const flattenedOrders = pendingOrders.map((order) => {
        const createdAtDate = order.createdAt ? new Date(order.createdAt) : null;
        return {
          ...order,
          orderId: order.orderId || `N/A-${Math.random()}`,
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
          createdAt: createdAtDate ? createdAtDate.getTime() : null,
          createdAtFormatted: createdAtDate ? createdAtDate.toLocaleString() : 'N/A',
          items:
            order.items?.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              image: item.imageUrl || item.image || 'https://via.placeholder.com/40',
            })) || [],
        };
      });

      console.log('Flattened Pending Orders:', flattenedOrders);
      setOrders(flattenedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  // ✅ Handle order acceptance
  const handleAcceptOrder = async () => {
    if (!deliveryPersonId) {
      alert('Please select a delivery person');
      return;
    }

    try {
      const response = await fetch('https://apii.agrivemart.com/api/delivery/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          deliveryPersonId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Order accepted');

        const selectedPerson = deliveryPersons.find((p) => p.userId === deliveryPersonId);

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === selectedOrderId
              ? {
                ...order,
                status: 'accepted',
                deliveryPersonId: deliveryPersonId,
                deliveryPersonName: selectedPerson?.name || 'N/A',
                deliveryPersonPhone: selectedPerson?.phone || 'N/A',
              }
              : order
          )
        );

        setOpenModal(false);
        fetchOrders();
      } else {
        alert(data.message || 'Failed to accept the order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Error accepting order');
    }
  };

  // ✅ DataGrid columns
  const columns = [
    {
      field: 'orderId',
      headerName: 'Order ID',
      width: 250,
      sortable: true,
      renderCell: (params) => (
        <Button
          variant="text"
          color="primary"
          onClick={() => {
            // Open invoice in a new browser tab
            window.open(`https://apii.agrivemart.com/api/invoice/${params.row.orderId}`, '_blank');
          }}
        >
          {params.value}
        </Button>
      ),
    },

    { field: 'status', headerName: 'Status', width: 150, sortable: true },
    { field: 'amount', headerName: 'Amount (₹)', width: 150, sortable: true },
    { field: 'userId', headerName: 'User Id', width: 150, sortable: true },
    { field: 'userName', headerName: 'User Name', width: 150, sortable: true },
    { field: 'userPhoneNumber', headerName: 'User PhoneNumber', width: 150, sortable: true },
    { field: 'state', headerName: 'State', width: 150, sortable: true },
    { field: 'pincode', headerName: 'Pincode', width: 150 },
    { field: 'houseDetails', headerName: 'House Details', width: 250 },
    { field: 'roadDetails', headerName: 'Road Details', width: 250 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      hide: true,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        return new Date(Number(params.value)).toLocaleString();
      },
      sortComparator: (v1, v2) => v1 - v2, // still numeric
    },
    {
      field: "createdAtFormatted",
      headerName: "Date",
      width: 200,
    },
    {
      field: 'items',
      headerName: 'Items',
      width: 450,
      renderCell: (params) => {
        const items = params.row.items;
        if (!items || items.length === 0) {
          return <Typography>No items</Typography>;
        }
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              maxHeight: 120,
              overflowY: 'auto',
              width: '100%',
              pr: 1,
              pb: 1,
            }}
          >
            {items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  background: '#f8f9fa',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  width={40}
                  height={40}
                  style={{ borderRadius: '6px', objectFit: 'cover' }}
                />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {item.quantity} {item.unit}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        );
      },
    },
    {
      field: 'accept',
      headerName: 'Accept Order',
      width: 150,
      renderCell: (params) =>
        params.row.status === 'pending' ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedOrderId(params.row.orderId);
              setOpenModal(true);
            }}
          >
            Accept
          </Button>
        ) : (
          'N/A'
        ),
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
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
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
              getRowHeight={() => 'auto'}
              sx={{
                backgroundColor: '#90B0CA',
                color: '#1C2833',
                '.MuiDataGrid-columnHeaders': { backgroundColor: '#1F618D' },
                '.MuiDataGrid-footerContainer': { backgroundColor: '#1F618D' },
              }}
              initialState={{
                sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] }, // ✅ newest first
              }}
            />
          </Box>
        ) : (
          <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
            No pending orders available
          </Typography>
        )}

        {/* Modal for selecting delivery person */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
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
              Select Delivery Person
            </Typography>
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel id="delivery-person-label">Delivery Person</InputLabel>
              <Select
                labelId="delivery-person-label"
                value={deliveryPersonId}
                onChange={(e) => {
                  console.log('Selected personId:', e.target.value);
                  setDeliveryPersonId(e.target.value);
                }}
              >
                <MenuItem value="">
                  <em>Select Delivery Person</em>
                </MenuItem>
                {deliveryPersons.map((person) => (
                  <MenuItem key={person.userId} value={person.userId}>
                    {person.name} ({person.phone})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
