import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CardContent,Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const TotalOrderPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://apii.agrivemart.com/api/delivery/orders');
        const result = await response.json();

        if (!result || !result.data) {
          console.error('Invalid API response:', result);
          return;
        }

        console.log('Fetched all orders:', result.data);
        const formattedOrders = result.data.map((order) => {
          const createdAtDate = order.createdAt ? new Date(order.createdAt) : null;
          return {
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
            items: order.items?.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              image: item.imageUrl, // make sure API sends image URL
            })) || [],
          };
        });
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
    { field: 'status', headerName: 'Status', width: 150, sortable: true, },
    { field: 'amount', headerName: 'Amount (₹)', width: 150, sortable: true, },
    { field: 'userId', headerName: 'User ID', width: 150, sortable: true, },
    { field: 'userName', headerName: 'User Name', width: 200, sortable: true, },
    { field: 'userPhoneNumber', headerName: 'User Phone Number', width: 180, sortable: true },
    { field: 'state', headerName: 'State', width: 150, sortable: true },
    { field: 'pincode', headerName: 'Pincode', width: 150, sortable: true },
    { field: 'houseDetails', headerName: 'House Details', width: 250, sortable: true },
    { field: 'roadDetails', headerName: 'Road Details', width: 250, sortable: true },
    { field: 'deliveryPersonId', headerName: 'Delivery Person ID', width: 180, sortable: true },
    { field: 'deliveryPersonName', headerName: 'Delivery Person Name', width: 200, sortable: true },
    { field: 'deliveryPersonPhone', headerName: 'Delivery Person Phone', width: 180, sortable: true },
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
              maxHeight: 120,   // ✅ limit height
              overflowY: 'auto', // ✅ scroll if too many items
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
                {/* Product Image */}
                <img
                  src={item.image || "https://via.placeholder.com/40"}
                  alt={item.name}
                  width={40}
                  height={40}
                  style={{ borderRadius: '6px', objectFit: 'cover' }}
                />

                {/* Product details */}
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
    }
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
              getRowHeight={() => 'auto'}
              getRowId={(row) => row.orderId} // Ensure row ID is correctly set
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
            No orders available
          </Typography>
        )}
      </CardContent>
    </Container>
  );
};

export default TotalOrderPage;
