import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  CardContent,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const isValidImageUrl = (url) => {
  return (
    url &&
    (url.startsWith('http://') || url.startsWith('https://')) &&
    (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif'))
  );
};

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('https://sastabazar.onrender.com/api/user/products');
        const data = await response.json();
        console.log('Fetched items:', data);
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://sastabazar.onrender.com/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setItems(items.filter((item) => item._id !== id));
      } else {
        console.error('Error deleting item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = (id) => {
    const itemToEdit = items.find((item) => item._id === id);
    setEditItem(itemToEdit);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditItem(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editItem?.imageUrl && !isValidImageUrl(editItem.imageUrl)) {
      alert('Please provide a valid image URL.');
      return;
    }
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://sastabazar.onrender.com/api/admin/products/${editItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editItem),
      });

      if (response.ok) {
        setItems(items.map((item) => (item._id === editItem._id ? { ...editItem } : item)));
        handleClose();
      } else {
        alert('Error updating item, please try again.');
      }
    } catch (error) {
      alert('Error updating item, please try again.');
    }
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 250 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'description', headerName: 'Description', width: 250 },
    { field: 'price', headerName: 'Price (₹)', width: 80 },
    { field: 'category', headerName: 'Category', width: 200 },
    { field: 'stock', headerName: 'Stock', width: 70 },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 100,
      renderCell: (params) => {
        const quantity = params.row.quantity || 0;
        const unit = params.row.unit || '';
        return `${quantity} ${unit}`;
      },
    },
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 100,
      renderCell: (params) =>
        params.row.imageUrl ? (
          <img
            src={params.row.imageUrl}
            alt={params.row.name}
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
          />
        ) : (
          <span>No Image</span>
        ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEdit(params.row._id)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)} color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Container
      sx={{
        display: 'flex',
        marginRight: 4,
        justifyContent: 'center',
        padding: 1,
        backgroundColor: '#2C3E50',
        borderRadius: 2,
        width: '100%',
      }}
    >
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ color: '#F1C40F', marginLeft: 20 }}>
          Grocery Items
        </Typography>
        <Box style={{ marginLeft: '120px', height: 500, width: '70%' }}>
          <DataGrid
            rows={items}
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

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Name"
                fullWidth
                value={editItem?.name || ''}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={editItem?.description || ''}
                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Price (₹)"
                type="number"
                fullWidth
                value={editItem?.price || ''}
                onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <Select
                  value={editItem?.category || ''}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select Category
                  </MenuItem>
                  <MenuItem value="Atta, Rice & Dal">Atta, Rice & Dal</MenuItem>
                  <MenuItem value="Bakery & Biscuits">Bakery & Biscuits</MenuItem>
                  <MenuItem value="Chicken, Meat & Fish">Chicken, Meat & Fish</MenuItem>
                  <MenuItem value="Dairy, Bread & Eggs">Dairy, Bread & Eggs</MenuItem>
                  <MenuItem value="Dry Fruits">Dry Fruits</MenuItem>
                  <MenuItem value="Oil, Ghee & Masala">Oil, Ghee & Masala</MenuItem>
                  <MenuItem value="Vegetables & Fruits">Vegetables & Fruits</MenuItem>
                  <MenuItem value="Air Fresheners">Air Fresheners</MenuItem>
                  <MenuItem value="Cleaning Supplies">Cleaning Supplies</MenuItem>
                  <MenuItem value="Baby Care">Baby Care</MenuItem>
                  <MenuItem value="Pooja Essentials">Pooja Essentials</MenuItem>
                  <MenuItem value="Personal Care">Personal Care</MenuItem>
                  <MenuItem value="Laundry Care">Laundry Care</MenuItem>
                  <MenuItem value="Paper Products">Paper Products</MenuItem>
                  <MenuItem value="Toiletries">Toiletries</MenuItem>
                  <MenuItem value="Chips & Namkeen">Chips & Namkeen</MenuItem>
                  <MenuItem value="Drink & Juices">Drink & Juices</MenuItem>
                  <MenuItem value="Ice Creams & More">Ice Creams & More</MenuItem>
                  <MenuItem value="Instant Food">Instant Food</MenuItem>
                  <MenuItem value="Sauces & Spreads">Sauces & Spreads</MenuItem>
                  <MenuItem value="Sweets & Chocolates">Sweets & Chocolates</MenuItem>
                  <MenuItem value="Tea, Coffee & Milk Drinks">Tea, Coffee & Milk Drinks</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Stock"
                type="number"
                fullWidth
                value={editItem?.stock || ''}
                onChange={(e) => setEditItem({ ...editItem, stock: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Image URL"
                fullWidth
                value={editItem?.imageUrl || ''}
                onChange={(e) => setEditItem({ ...editItem, imageUrl: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                value={editItem?.quantity || ''}
                onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <Select
                  value={editItem?.unit || ''}
                  onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select Unit
                  </MenuItem>
                  <MenuItem value="pack">Pack</MenuItem>
                  <MenuItem value="gm">Gram</MenuItem>
                  <MenuItem value="kg">Kg</MenuItem>
                  <MenuItem value="l">Liter</MenuItem>
                  <MenuItem value="ml">MilliLiter</MenuItem>
                  <MenuItem value="pieces">Pieces</MenuItem>
                </Select>
              </FormControl>
              <DialogActions>
                <Button onClick={handleClose} sx={{ color: '#E74C3C' }}>
                  Cancel
                </Button>
                <Button type="submit" sx={{ color: '#2ECC71' }}>
                  Save
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Container>
  );
};

export default ItemList;
