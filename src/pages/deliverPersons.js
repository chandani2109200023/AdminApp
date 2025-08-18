import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CardContent,
  Button,
  Modal,
  TextField,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Edit, Delete, Add } from '@mui/icons-material';

const DeliveryPersons = () => {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle: '',
    password: '',
  });

  useEffect(() => {
    fetchDeliveryPersons();
  }, []);

  const fetchDeliveryPersons = async () => {
    try {
      const response = await fetch('https://apii.agrivemart.com/api/delivery/delivery-persons');
      const data = await response.json();
      if (Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        console.error('Invalid delivery persons data:', data);
      }
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', phone: '', email: '', vehicle: '', password: '' });
    setOpenModal(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      vehicle: user.vehicle || '',
      password: '',  // Password not required on Edit
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingUser(null);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name || !formData.phone) {
      alert('Name and Phone are required');
      return;
    }

    if (!formData.phone.match(/^\d{10}$/)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    if (!editingUser && !formData.password) {
      alert('Password is required');
      return;
    }

    const url = editingUser
      ? `https://apii.agrivemart.com/api/delivery/update-delivery-person/${editingUser.userId}`
      : 'https://apii.agrivemart.com/api/delivery/registerDelivery';

    const method = editingUser ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Something went wrong');

      alert(result.message || (editingUser ? 'Updated successfully' : 'Added successfully'));
      fetchDeliveryPersons();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving delivery person:', error);
      alert(error.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery person?')) {
      try {
        const response = await fetch(`https://apii.agrivemart.com/api/delivery/delete-delivery-person/${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Delete failed');

        alert(result.message || 'Deleted successfully');
        fetchDeliveryPersons();
      } catch (error) {
        console.error('Error deleting delivery person:', error);
        alert(error.message || 'Failed to delete');
      }
    }
  };

  const columns = [
    { field: 'userId', headerName: 'ID', width: 220 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'vehicle', headerName: 'Vehicle', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpenEdit(params.row)}><Edit /></IconButton>
          <IconButton onClick={() => handleDelete(params.row.userId)}><Delete /></IconButton>
        </>
      ),
    },
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
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          Delivery Persons
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAdd}
            sx={{ backgroundColor: '#28a745' }}
          >
            Add Delivery Person
          </Button>
        </Box>

        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={columns}
            pageSize={5}
            getRowId={(row) => row._id || row.userId || row.id}
            sx={{
              backgroundColor: '#90B0CA',
              color: '#1C2833',
              '.MuiDataGrid-columnHeaders': { backgroundColor: '#1F618D' },
              '.MuiDataGrid-footerContainer': { backgroundColor: '#1F618D' },
            }}
          />
        </Box>
      </CardContent>

      <Modal open={openModal} onClose={handleCloseModal}>
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
            {editingUser ? 'Edit Delivery Person' : 'Add Delivery Person'}
          </Typography>

          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Vehicle"
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          {!editingUser && (
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              {editingUser ? 'Update' : 'Add'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default DeliveryPersons;
