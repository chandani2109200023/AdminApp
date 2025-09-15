import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CardContent,
  Select,
  Modal,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

function TodayOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [openUpdateStatusModal, setOpenUpdateStatusModal] = useState(false);

  const statusOptions = ['pending', 'accepted', 'shipped', 'out for delivery', 'delivered'];

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://apii.agrivemart.com/api/delivery/orders');
      const data = await response.json();
      const today = new Date().toISOString().split('T')[0];

      const todayOrders = data.data?.filter(
        order => new Date(order.createdAt).toISOString().split('T')[0] === today
      );

      const flattenedOrders = todayOrders?.map(order => {
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
          deliveryPersonId: order.deliveryPerson?.id || '',
          deliveryPersonName: order.deliveryPerson?.name || 'N/A',
          deliveryPersonPhone: order.deliveryPerson?.phone || 'N/A',
          createdAt: createdAtDate ? createdAtDate.getTime() : null,
          createdAtFormatted: createdAtDate ? createdAtDate.toLocaleString() : 'N/A',
          items:
            order.items?.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              image: item.imageUrl,
            })) || [],
        };
      });

      setOrders(flattenedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchDeliveryPersons = async () => {
    try {
      const response = await fetch('https://apii.agrivemart.com/api/delivery/delivery-persons');
      const data = await response.json();
      setDeliveryPersons(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
    }
  };

  const handleAcceptOrder = async () => {
    if (!selectedDeliveryPersonId) {
      alert('Please select a Delivery Person');
      return;
    }

    try {
      const response = await fetch('https://apii.agrivemart.com/api/delivery/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          deliveryPersonId: selectedDeliveryPersonId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchOrders();
        setOpenModal(false);
      } else {
        alert(data.message || 'Failed to accept the order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleStatusChange = (orderId, deliveryPersonId) => {
    setSelectedOrderId(orderId);
    setSelectedDeliveryPersonId(deliveryPersonId);
    const order = orders.find(o => o.orderId === orderId);
    setSelectedStatus(order?.status || '');
    setOpenUpdateStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedDeliveryPersonId) {
      alert('Delivery Person is required');
      return;
    }

    try {
      const response = await fetch(
        `https://apii.agrivemart.com/api/delivery/status/${selectedOrderId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: selectedStatus,
            orderId: selectedOrderId,
            deliveryPersonId: selectedDeliveryPersonId,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setOrders(prev =>
          prev.map(order =>
            order.orderId === selectedOrderId ? { ...order, status: selectedStatus } : order
          )
        );
        setOpenUpdateStatusModal(false);
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

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
    { field: 'amount', headerName: 'Amount (₹)', width: 120, sortable: true },
    { field: 'userName', headerName: 'User Name', width: 150, sortable: true },
    {
      field: 'deliveryPersonName',
      headerName: 'Delivery Person',
      width: 200,
      sortable: true,
    },
    {
      field: 'deliveryPersonPhone',
      headerName: 'Delivery Person Phone',
      width: 200,
    },
    {
      field: " createdAt",
      headerName: "Created At",
      width: 200,
      valueFormatter: (params) => {
        if (!params.value) return "N/A";
        const date = new Date(params.value);
        return date.toLocaleString(); // display readable
      },
      sortComparator: (v1, v2) => new Date(v1) - new Date(v2), // ensure correct sorting
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
      sortable: false,
      renderCell: params => {
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
                  src={item.image || 'https://via.placeholder.com/40'}
                  alt={item.name}
                  width={40}
                  height={40}
                  style={{ borderRadius: '6px', objectFit: 'cover' }}
                />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: '#2c3e50' }}
                  >
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
      width: 160,
      sortable: false,
      renderCell: params =>
        params.row.status === 'pending' ? (
          <Button
            variant="contained"
            onClick={() => {
              setSelectedOrderId(params.row.orderId);
              setOpenModal(true);
            }}
          >
            Accept
          </Button>
        ) : (
          'Accepted'
        ),
    },
    {
      field: 'updateStatus',
      headerName: 'Update Status',
      width: 180,
      sortable: false,
      renderCell: params => {
        const status = params.row.status;
        return status !== 'delivered' ? (
          <Button
            variant="contained"
            onClick={() =>
              handleStatusChange(params.row.orderId, params.row.deliveryPersonId)
            }
          >
            {status === 'pending'
              ? 'Update Status'
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ) : (
          'Delivered'
        );
      },
    },
  ];

  return (
    <Container
      sx={{
        padding: 2,
        backgroundColor: '#2C3E50',
        borderRadius: 2,
        width: '100%',
        minHeight: '100vh',
      }}
    >
      <CardContent>
        <Typography
          variant="h4"
          sx={{ color: '#F1C40F', textAlign: 'center', marginBottom: 2 }}
        >
          Today's Orders
        </Typography>

        {orders.length > 0 ? (
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={orders}
              columns={columns}
              pageSize={5}
              getRowId={row => row.orderId}
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
          <Typography color="textSecondary" align="center">
            No orders available
          </Typography>
        )}

        {/* Accept Order Modal */}
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'white',
              p: 3,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Select Delivery Person
            </Typography>
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Delivery Person</InputLabel>
              <Select
                value={selectedDeliveryPersonId}
                onChange={e => setSelectedDeliveryPersonId(e.target.value)}
              >
                {deliveryPersons.length > 0 ? (
                  deliveryPersons.map(person => (
                    <MenuItem key={person.id} value={person.id}>
                      {person.name} - {person.phone}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No delivery persons available</MenuItem>
                )}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAcceptOrder}
              >
                Accept Order
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Update Status Modal */}
        <Modal
          open={openUpdateStatusModal}
          onClose={() => setOpenUpdateStatusModal(false)}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'white',
              p: 3,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Update Order Status
            </Typography>
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setOpenUpdateStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateStatus}
              >
                Update Status
              </Button>
            </Box>
          </Box>
        </Modal>
      </CardContent>
    </Container>
  );
}

export default TodayOrdersPage;
