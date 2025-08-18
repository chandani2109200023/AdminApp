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
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const categories = [
  "Atta, Rice & Dal",
  "Bakery & Biscuits",
  "Chicken, Meat & Fish",
  "Dairy, Bread & Eggs",
  "Dry Fruits",
  "Oil, Ghee & Masala",
  "Vegetables & Fruits",
  "Air Fresheners",
  "Cleaning Supplies",
  "Baby Care",
  "Pooja Essentials",
  "Personal Care",
  "Paper Products",
  "Toiletries",
  "Chips & Namkeen",
  "Drinks & Juices",
  "Ice Creams & More",
  "Instant Food",
  "Sauces & Spreads",
  "Sweets & Chocolates",
  "Tea, Coffee & Milk Drinks",
];

const units = [
  "pack",
  "gm",
  "kg",
  "l",
  "ml",
  "pieces",
];

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const page = 1; // set this if pagination is needed later
        const response = await fetch(`https://apii.agrivemart.com/api/user/products?page=${page}&limit=10000`);
        const data = await response.json();
        const products = data.products || [];

        const flattened = products
          .map((product) => {
            if (!Array.isArray(product.variants)) return []; // prevent crash
            return product.variants.map((variant, index) => ({
              ...variant,
              _id: `${product._id?.$oid || product._id}_${index}`,
              productId: product._id?.$oid || product._id,
              name: product.name,
              description: product.description,
              category: product.category,
              brand: product.brand,
              createdAt: product.createdAt?.$date || product.createdAt || null,
            }));
          })
          .flat(); // flatten the array of arrays

        setItems(flattened);
        setFilteredItems(flattened);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  const filterItems = () => {
    let filtered = items;
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
    if (stockFilter === 'outOfStock') {
      filtered = filtered.filter(item => Number(item.stock) === 0);
    }
    setFilteredItems(filtered);
  };

  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, stockFilter, items]);

  const handleDelete = async (productId) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`https://apii.agrivemart.com/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Remove all variants with this productId
        setItems(prevItems => prevItems.filter(item => item.productId !== productId));
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
    const token = localStorage.getItem('authToken');

    let formData;
    let variant;

    if (editItem.uploadType === 'file') {
      variant = {
        price: Number(editItem.price),
        discount: Number(editItem.discount),
        stock: Number(editItem.stock),
        quantity: Number(editItem.quantity),
        unit: editItem.unit,
        uploadType: 'file',
        ...(editItem.localImageUrl ? { localImageUrl: editItem.localImageUrl } : {}),
      };

      formData = new FormData();
      formData.append('name', editItem.name?.trim() || '');
      formData.append('description', editItem.description?.trim() || '');
      formData.append('category', editItem.category || '');
      formData.append('brand', editItem.brand?.trim() || '');
      formData.append('variants', JSON.stringify([variant]));

      // Only append new file if selected
      if (editItem.imageFile) {
        formData.append('image_0', editItem.imageFile);
      }
    }
    else {
      // Omit imageUrl if it's empty
      const urlToSend = editItem.imageUrl?.trim() || editItem.localImageUrl || '';

      const urlBasedVariant = {
        price: Number(editItem.price),
        discount: Number(editItem.discount),
        stock: Number(editItem.stock),
        quantity: Number(editItem.quantity),
        unit: editItem.unit,
        uploadType: 'url',
        ...(urlToSend ? { imageUrl: urlToSend } : {}),
      };


      formData = JSON.stringify({
        name: editItem.name?.trim() || '',
        description: editItem.description?.trim() || '',
        category: editItem.category || '',
        brand: editItem.brand?.trim() || '',
        variants: [urlBasedVariant],
      });
    }

    try {
      const response = await fetch(`https://apii.agrivemart.com/api/admin/products/${editItem.productId}`, {
        method: 'PUT',
        headers:
          editItem.uploadType === 'file'
            ? { Authorization: `Bearer ${token}` }
            : {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
        body: formData,
      });

      if (response.ok) {
        setItems((prevItems) =>
          prevItems.map((item) => {
            if (item._id === editItem._id) {
              return {
                ...item,
                ...editItem,
                localImageUrl: editItem.localImageUrl || item.localImageUrl,  // preserve existing localImageUrl if missing
                imageUrl: editItem.imageUrl || item.imageUrl,  // optional: preserve imageUrl too
              };
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
      renderCell: (params) => {
        const quantity = params.row.quantity || 0;
        const unit = params.row.unit || '';
        return `${quantity} ${unit}`;
      },
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
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      renderCell: (params) => {
        if (!params || !params.row) return 'N/A';
        const createdAt = params.row.createdAt;
        if (!createdAt) return 'N/A';
        const date = new Date(createdAt);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
      },
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
    <Container sx={{ display: 'flex', flexDirection: 'column', padding: 2, backgroundColor: '#2C3E50', borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ color: '#F1C40F', textAlign: 'center' }}>
          Grocery Items
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
          <TextField
            label="Search Products"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ backgroundColor: '#f5f5f5' }}
          />

          <FormControl fullWidth sx={{ backgroundColor: '#f5f5f5' }}>
            <InputLabel>Category</InputLabel>
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} label="Category">
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ backgroundColor: '#f5f5f5' }}>
            <InputLabel>Stock</InputLabel>
            <Select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              label="Stock"
              sx={{ backgroundColor: '#f5f5f5' }}
            >
              <MenuItem value="all">All Products</MenuItem>
              <MenuItem value="outOfStock">Out of Stock</MenuItem>
            </Select>
          </FormControl>
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
            No products available
          </Typography>
        )}

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit} id="edit-form">
              <TextField
                label="Name"
                fullWidth
                value={editItem?.name || ''}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                margin="normal"
                required
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
                onChange={(e) => setEditItem({ ...editItem, price: Number(e.target.value) })}
                margin="normal"
                required
              />
              <TextField
                label="Discount"
                type="number"
                fullWidth
                value={editItem?.discount || 0}
                onChange={(e) => setEditItem({ ...editItem, discount: Number(e.target.value) })}
                margin="normal"
              />
              <TextField
                label="Brand"
                fullWidth
                value={editItem?.brand || ''}
                onChange={(e) => setEditItem({ ...editItem, brand: e.target.value })}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={editItem?.category || ''}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  required
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Stock"
                type="number"
                fullWidth
                value={editItem?.stock || 0}
                onChange={(e) => setEditItem({ ...editItem, stock: Number(e.target.value) })}
                margin="normal"
                required
              />

              {/* Upload type radio */}
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Upload Type</Typography>
                <RadioGroup
                  row
                  value={editItem?.uploadType || ''}
                  onChange={(e) => {
                    const type = e.target.value;
                    setEditItem((prev) => ({
                      ...prev,
                      uploadType: type,
                      imageUrl: type === 'url' ? prev.imageUrl : '',
                      imageFile: type === 'file' ? null : prev.imageFile,
                    }));
                  }}
                >
                  <FormControlLabel value="url" control={<Radio />} label="Image URL" />
                  <FormControlLabel value="file" control={<Radio />} label="Upload File" />
                </RadioGroup>
              </FormControl>
              {/* If URL option selected */}
              {editItem?.uploadType === 'url' && (
                <TextField
                  label="Image URL"
                  fullWidth
                  value={editItem?.imageUrl || ''}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      imageUrl: e.target.value,
                      imageFile: null, // clear file if switching
                    })
                  }
                  margin="normal"
                  required
                />
              )}

              {/* If File option selected */}
              {editItem?.uploadType === 'file' && (
                <>
                  <Button variant="contained" component="label" sx={{ mt: 1 }}>
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setEditItem((prev) => ({
                            ...prev,
                            imageFile: file,
                            imageUrl: '', // clear url if switching
                          }));
                        }
                      }}
                    />
                  </Button>
                  {editItem?.imageFile && (
                    <Typography sx={{ mt: 1 }}>
                      Selected: <strong>{editItem.imageFile.name}</strong>
                    </Typography>
                  )}
                </>
              )}
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                value={editItem?.quantity || 0}
                onChange={(e) => setEditItem({ ...editItem, quantity: Number(e.target.value) })}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Unit</InputLabel>
                <Select
                  value={editItem?.unit || ''}
                  onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                  required
                >
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DialogActions>
                <Button onClick={handleClose} sx={{ color: '#E74C3C' }}>
                  Cancel
                </Button>
                <Button type="submit" form="edit-form" sx={{ color: '#2ECC71' }}>
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
