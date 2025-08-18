import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, CardContent,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Switch, FormControlLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const CouponManagementPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    _id: null,
    code: '',
    discount: '',
    isPercentage: true,
    expiryDate: '',
  });

  const token = localStorage.getItem('authToken');

  const fetchCoupons = async () => {
    try {
      const res = await fetch('https://apii.agrivemart.com/api/coupons/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to fetch coupons', err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddCoupon = () => {
    setEditMode(false);
    setForm({ _id: null, code: '', discount: '', isPercentage: true, expiryDate: '' });
    setOpenDialog(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditMode(true);
    setForm({ ...coupon });
    setOpenDialog(true);
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await fetch(`https://apii.agrivemart.com/api/coupons/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCoupons();
      } catch (err) {
        console.error('Delete failed', err);
      }
    }
  };

  const handleSave = async () => {
    try {
      const method = editMode ? 'PUT' : 'POST';
      const url = editMode
        ? `https://apii.agrivemart.com/api/coupons/${form._id}`
        : `https://apii.agrivemart.com/api/coupons`;

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      setOpenDialog(false);
      fetchCoupons();
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 240 },
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'discount', headerName: 'Discount', width: 100 },
    {
      field: 'isPercentage',
      headerName: 'Type',
      width: 120,
      valueFormatter: ({ value }) => (value ? 'Percentage' : 'Flat'),
    },
    {
      field: 'expiryDate',
      headerName: 'Expiry',
      width: 180,
      valueFormatter: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: ({ row }) => (
        <>
          <Button variant="outlined" size="small" onClick={() => handleEditCoupon(row)}>
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => handleDeleteCoupon(row._id)}
            sx={{ ml: 1 }}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Container sx={{ p: 3, backgroundColor: '#2C3E50', borderRadius: 2 }}>
      <CardContent>
        <Typography
          variant="h4"
          sx={{ color: '#F1C40F', textAlign: 'center', mb: 2 }}
        >
          Manage Coupons
        </Typography>
        <Button variant="contained" onClick={handleAddCoupon} sx={{ mb: 2 }}>
          Add New Coupon
        </Button>
        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={coupons}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={5}
            sx={{
              backgroundColor: '#90B0CA',
              color: '#1C2833',
              '.MuiDataGrid-columnHeaders': { backgroundColor: '#1F618D' },
              '.MuiDataGrid-footerContainer': { backgroundColor: '#1F618D' },
            }}
          />
        </Box>
      </CardContent>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editMode ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Coupon Code"
            name="code"
            value={form.code}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Discount"
            name="discount"
            type="number"
            value={form.discount}
            onChange={handleFormChange}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isPercentage}
                onChange={handleFormChange}
                name="isPercentage"
              />
            }
            label="Is Percentage"
          />
          <TextField
            fullWidth
            margin="dense"
            label="Expiry Date"
            type="date"
            name="expiryDate"
            value={form.expiryDate.split('T')[0]} // For date input format
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CouponManagementPage;
