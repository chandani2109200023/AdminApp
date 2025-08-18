import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CardContent, Button, Modal, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const AppUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchAppUsers();
  }, []);

  const fetchAppUsers = async () => {
    try {
      const response = await fetch('https://apii.agrivemart.com/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching app users:', error);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser({ ...user });
    setOpenEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`https://apii.agrivemart.com/api/user/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const result = await res.json();
        alert(result.message);
        fetchAppUsers();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`https://apii.agrivemart.com/api/user/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(selectedUser),
      });
      const result = await res.json();
      alert(result.message);
      setOpenEditModal(false);
      fetchAppUsers();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 250 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'email', headerName: 'Email', width: 220 },
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
        <Typography variant="h4" gutterBottom sx={{ color: '#F1C40F', textAlign: 'center' }}>App Users</Typography>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={users}
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

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'white', p: 3, borderRadius: 2, width: 400 }}>
          <Typography variant="h6" mb={2}>Edit User</Typography>
          <TextField label="Name" fullWidth margin="normal" value={selectedUser?.name || ''} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })} />
          <TextField label="Phone" fullWidth margin="normal" value={selectedUser?.phone || ''} onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })} />
          <TextField label="Email" fullWidth margin="normal" value={selectedUser?.email || ''} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" onClick={() => setOpenEditModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdate}>Update</Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default AppUsersPage;
