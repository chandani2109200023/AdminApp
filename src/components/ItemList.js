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
  InputLabel,
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
  const [filteredItems, setFilteredItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('https://api.agrivemart.com/api/user/products');
        const data = await response.json();

        // Flatten each variant into its own row with reference to the parent product
        const flattened = data.flatMap((product) => {
          return product.variants.map((variant, index) => ({
            ...variant,
            _id: `${product._id}_${index}`, // Unique ID for DataGrid
            productId: product._id, // Keep original product ID for edit/delete
            name: product.name,
            description: product.description,
            category: product.category,
            brand: product.brand,
          }));
        });

        setItems(flattened);
        setFilteredItems(flattened);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);
  // Function to filter items based on search, category, and stock
  const filterItems = () => {
    let filtered = items;
    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(lowerSearch) ||
        item.brand?.toLowerCase().includes(lowerSearch)
      );
    }
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    // Filter by stock (out of stock)
    if (stockFilter === 'outOfStock') {
      filtered = filtered.filter(item => item.stock === 0);
    }
    setFilteredItems(filtered);
  };
  useEffect(() => {
    filterItems(); // Re-run filter whenever any of the filter criteria change
  }, [searchTerm, selectedCategory, stockFilter, items]);

  const handleDelete = async (productId) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://api.agrivemart.com/api/admin/products/${productId}`, {
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

    const updatedProduct = {
      name: editItem.name,
      description: editItem.description,
      category: editItem.category,
      brand: editItem.brand,
      variants: [
        {
          price: editItem.price,
          discount: editItem.discount,
          stock: editItem.stock,
          quantity: editItem.quantity,
          unit: editItem.unit,
          imageUrl: editItem.imageUrl,
        },
      ],
    };

    try {
      const response = await fetch(`https://api.agrivemart.com/api/admin/products/${editItem.productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        const updatedItems = items.map((item) =>
          item._id === editItem._id ? { ...item, ...editItem } : item
        );
        setItems(updatedItems);
        handleClose();
      } else {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        alert('Error updating item, please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Error updating item, please try again.');
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
        height: '100vh', // Ensures full screen height
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
          Grocery Items
        </Typography>

        {/* Filter Section */}
        <Box sx={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <TextField
            label="Search Products"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              backgroundColor: '#f5f5f5', // Lighter background color
            }}
          />

          <FormControl fullWidth sx={{ backgroundColor: '#f5f5f5' }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
              sx={{
                backgroundColor: '#f5f5f5', // Lighter background color
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
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

          <FormControl fullWidth sx={{ backgroundColor: '#f5f5f5' }}>
            <InputLabel>Stock</InputLabel>
            <Select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              label="Stock"
              sx={{
                backgroundColor: '#f5f5f5', // Lighter background color
              }}
            >
              <MenuItem value="all">All Products</MenuItem>
              <MenuItem value="outOfStock">Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Display the filtered products */}
        {filteredItems && filteredItems.length > 0 ? (
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={filteredItems}
              columns={columns}
              pageSize={5}
              getRowId={(row) => row._id} // Ensure _id exists in the response
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
            No products available
          </Typography>
        )}

        {/* Edit Item Dialog */}
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
              <TextField
                label="Discount"
                type="number"
                fullWidth
                value={editItem?.discount || ''}
                onChange={(e) => setEditItem({ ...editItem, discount: e.target.value })}
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
                  {/* Add more categories as needed */}
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
