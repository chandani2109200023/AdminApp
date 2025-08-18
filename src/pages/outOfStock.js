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
  InputLabel,
  CardContent,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const OutOfStockProducts = () => {
  const [filteredItems, setFilteredItems] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('https://apii.agrivemart.com/api/user/products');
        const data = await response.json();
        const flattened = data.flatMap((product) =>
          product.variants.map((variant, index) => ({
            ...variant,
            _id: `${product._id}_${index}`,
            productId: product._id,
            name: product.name,
            description: product.description,
            category: product.category,
            brand: product.brand,
            localImageUrl: variant.localImageUrl || '',
            imageUrl: variant.imageUrl || '',
          }))
        );
        const outOfStockItems = flattened.filter((item) => item.stock === 0);
        setItems(flattened);
        setFilteredItems(outOfStockItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };
    fetchItems();
  }, []);

  const filterItems = () => {
    let filtered = items.filter((item) => item.stock === 0);
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(lowerSearch) ||
        item.brand?.toLowerCase().includes(lowerSearch)
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    setFilteredItems(filtered);
  };

  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, items]);

  const handleDelete = async (productId) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://apii.agrivemart.com/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
      } else {
        const error = await response.text();
        console.error('Delete failed:', response.status, error);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = (id) => {
    const itemToEdit = items.find((item) => item._id === id);
    setEditItem({ ...itemToEdit });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditItem(null);
  };

const handleSubmit = async (event) => {
  event.preventDefault();
  const token = localStorage.getItem('authToken');

  let formData;
  let variant;

  if (editItem.uploadType === 'file') {
    // Preserve existing localImageUrl if no new file selected
    const existingItem = items.find(item => item._id === editItem._id);

    variant = {
      price: Number(existingItem.price),                // Keep original values
      discount: Number(existingItem.discount),
      stock: Number(editItem.stock),                    // Only stock is updated
      quantity: Number(existingItem.quantity),
      unit: existingItem.unit,
      uploadType: 'file',
      localImageUrl: existingItem.localImageUrl || '',   // Always preserve this
    };

    formData = new FormData();
    formData.append('name', existingItem.name?.trim() || '');
    formData.append('description', existingItem.description?.trim() || '');
    formData.append('category', existingItem.category || '');
    formData.append('brand', existingItem.brand?.trim() || '');
    formData.append('variants', JSON.stringify([variant]));

    if (editItem.imageFile) {
      formData.append('image_0', editItem.imageFile);
    }

  } else {
    const existingItem = items.find(item => item._id === editItem._id);
    const urlToSend = existingItem.imageUrl?.trim() || existingItem.localImageUrl || '';

    const urlBasedVariant = {
      price: Number(existingItem.price),
      discount: Number(existingItem.discount),
      stock: Number(editItem.stock),
      quantity: Number(existingItem.quantity),
      unit: existingItem.unit,
      uploadType: 'url',
      ...(urlToSend ? { imageUrl: urlToSend } : {}),
    };

    formData = JSON.stringify({
      name: existingItem.name?.trim() || '',
      description: existingItem.description?.trim() || '',
      category: existingItem.category || '',
      brand: existingItem.brand?.trim() || '',
      variants: [urlBasedVariant],
    });
  }

  try {
    const response = await fetch(`https://apii.agrivemart.com/api/admin/products/${editItem.productId}`, {
      method: 'PUT',
      headers: editItem.uploadType === 'file'
        ? { Authorization: `Bearer ${token}` }
        : { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: formData,
    });

    if (response.ok) {
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item._id === editItem._id) {
            return { ...item, stock: editItem.stock };
          }
          return item;
        })
      );
      handleClose();
    } else {
      const error = await response.text();
      console.error('Update failed:', error);
      alert('Update failed');
    }
  } catch (err) {
    console.error('Network error:', err);
    alert('Error updating item');
  }
};


  const columns = [
    { field: '_id', headerName: 'ID', width: 250 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'brand', headerName: 'Brand', width: 150 },
    { field: 'description', headerName: 'Description', width: 250 },
    { field: 'price', headerName: 'Price (₹)', width: 80 },
    { field: 'discount', headerName: 'Discount', width: 80 },
    { field: 'category', headerName: 'Category', width: 200 },
    { field: 'stock', headerName: 'Stock', width: 70 },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 100,
      renderCell: (params) => `${params.row.quantity || 0} ${params.row.unit || ''}`,
    },
    {
      field: 'localImageUrl',
      headerName: 'Image',
      width: 100,
      renderCell: (params) =>
        params.row.localImageUrl ? (
          <img
            src={`https://apii.agrivemart.com${params.row.localImageUrl}`}
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
          <IconButton onClick={() => handleDelete(params.row.productId)} color="error">
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
          sx={{ color: '#F1C40F', textAlign: 'center' }}
        >
          Out Of Stock Products
        </Typography>

        <Box sx={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <TextField
            label="Search Products"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ backgroundColor: '#f5f5f5' }}
          />
        </Box>

        {filteredItems && filteredItems.length > 0 ? (
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={filteredItems}
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
        ) : (
          <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
            No out-of-stock products available
          </Typography>
        )}

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Stock"
                type="number"
                fullWidth
                value={editItem?.stock || ''}
                onChange={(e) => setEditItem({ ...editItem, stock: e.target.value })}
                margin="normal"
              />
              <DialogActions>
                <Button onClick={handleClose} sx={{ color: '#E74C3C' }}>Cancel</Button>
                <Button type="submit" sx={{ color: '#2ECC71' }}>Save</Button>
              </DialogActions>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Container>
  );
};

export default OutOfStockProducts;
