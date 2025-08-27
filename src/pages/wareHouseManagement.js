// WarehouseManagement.js
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CardContent, Button, Modal, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', pincode: '', location: '' });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('https://apii.agrivemart.com/api/wareHouse/');
      const data = await response.json();
      setWarehouses(data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const handleAddWarehouse = async () => {
    try {
      await fetch('https://apii.agrivemart.com/api/wareHouse/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWarehouse),
      });
      setNewWarehouse({ name: '', pincode: '', location: '' });
      setOpenAddModal(false);
      fetchWarehouses();
    } catch (error) {
      console.error('Add error:', error);
    }
  };

  const handleEditClick = (warehouse) => {
    setSelectedWarehouse({ ...warehouse });
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await fetch(`https://apii.agrivemart.com/api/wareHouse/${selectedWarehouse._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedWarehouse),
      });
      setOpenEditModal(false);
      fetchWarehouses();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await fetch(`https://apii.agrivemart.com/api/wareHouse/${id}`, { method: 'DELETE' });
        fetchWarehouses();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 220 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'pincode', headerName: 'Pincode', width: 120 },
    { field: 'location', headerName: 'Location', width: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" size="small" onClick={() => handleEditClick(params.row)}>Edit</Button>
          <Button variant="contained" color="error" size="small" onClick={() => handleDelete(params.row._id)}>Delete</Button>
        </Box>
      ),
    },
  ];

  return (
    <Container sx={{ padding: 3, backgroundColor: '#2C3E50', borderRadius: 2, width: '100%' }}>
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ color: '#F1C40F', textAlign: 'center' }}>
          Warehouse Management
        </Typography>

        {/* Add Warehouse Button */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="success" onClick={() => setOpenAddModal(true)}>
            Add Warehouse
          </Button>
        </Box>

        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={warehouses}
            columns={columns}
            pageSize={5}
            getRowId={(row) => row._id}
            sx={{
              backgroundColor: '#90B0CA',
              color: '#1C2833',
              '.MuiDataGrid-columnHeaders': { backgroundColor: '#1F618D' },
              '.MuiDataGrid-footerContainer': { backgroundColor: '#1F618D' },
            }}
          />
        </Box>
      </CardContent>

      {/* Add Warehouse Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            p: 3,
            borderRadius: 2,
            width: 400,
          }}
        >
          <Typography variant="h6" mb={2}>Add Warehouse</Typography>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={newWarehouse.name}
            onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
          />
          <TextField
            label="Pincode"
            fullWidth
            margin="normal"
            type="number"
            value={newWarehouse.pincode}
            onChange={(e) => setNewWarehouse({ ...newWarehouse, pincode: e.target.value })}
          />
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            value={newWarehouse.location}
            onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" onClick={() => setOpenAddModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddWarehouse}>Add</Button>
          </Box>
        </Box>
      </Modal>

      {/* Edit Warehouse Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            p: 3,
            borderRadius: 2,
            width: 400,
          }}
        >
          <Typography variant="h6" mb={2}>Edit Warehouse</Typography>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={selectedWarehouse?.name || ''}
            onChange={(e) => setSelectedWarehouse({ ...selectedWarehouse, name: e.target.value })}
          />
          <TextField
            label="Pincode"
            fullWidth
            margin="normal"
            type="number"
            value={selectedWarehouse?.pincode || ''}
            onChange={(e) => setSelectedWarehouse({ ...selectedWarehouse, pincode: e.target.value })}
          />
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            value={selectedWarehouse?.location || ''}
            onChange={(e) => setSelectedWarehouse({ ...selectedWarehouse, location: e.target.value })}
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" onClick={() => setOpenEditModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdate}>Update</Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default WarehouseManagement;
