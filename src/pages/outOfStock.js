import React, { useState, useEffect } from 'react';
import { Tooltip } from '@mui/material';
import {
  Container,
  Typography,
  Box,
  CardContent,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarehouseIcon from '@mui/icons-material/Warehouse';

const categoryOptions = [
  { name: "Atta, Rice & Dal", subcategories: ["Atta", "Rice", "Dal"] },
  { name: "Bakery & Biscuits", subcategories: ["Cakes", "Biscuits"] },
  { name: "Chicken, Meat & Fish", subcategories: ["Chicken", "Mutton", "Fish"] },
  { name: "Dairy, Bread & Eggs", subcategories: ["Milk", "Cheese", "Eggs"] },
  { name: "Dry Fruits", subcategories: ["Almonds", "Cashews"] },
  { name: "Oil, Ghee & Masala", subcategories: ["Oil", "Ghee", "Masala"] },
  { name: "Vegetables & Fruits", subcategories: ["Vegetables", "Fruits"] },
  { name: "Personal Care", subcategories: ["Skin Care", "Hair Care"] },
  { name: "Snacks & Beverages", subcategories: ["Snacks", "Juice"] },
];

const units = ["kg", "g", "ltr", "ml", "pcs", "dozen"];

const OutOfStockProducts = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [newStock, setNewStock] = useState(0);

  const fetchItems = async () => {
    try {
      const res = await fetch(`https://apii.agrivemart.com/api/user/products?page=1&limit=10000`);
      const data = await res.json();
      const products = data.products || [];

      const flattened = products
        .map(product => {
          if (!Array.isArray(product.variants)) return [];
          return product.variants.map((variant, index) => {
            const totalStock = (variant.warehouseStock || []).reduce((sum, w) => sum + (w.stock || 0), 0);
            return {
              ...variant,
              _id: `${product._id}_${index}`,
              productId: product._id,
              variantId: variant._id,
              name: product.name || '',
              description: product.description || '',
              shortDescription: product.shortDescription || product.details?.shortDescription || '',
              category: product.category || '',
              subcategory: product.subcategory || product.details?.subcategory || '',
              brand: product.brand || '',
              gst: product.gst ?? product.details?.gst ?? 0,
              price: variant.price ?? 0,
              discount: variant.discount ?? 0,
              quantity: variant.quantity ?? 0,
              unit: variant.unit || '',
              warehouseStock: Array.isArray(variant.warehouseStock) ? variant.warehouseStock : [],
              createdAt: product.createdAt?.$date || product.createdAt || null,
              totalStock
            };
          });
        })
        .flat();

      setItems(flattened);
      setFilteredItems(flattened.filter(item => item.totalStock === 0));
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };
  const fetchWarehouses = async () => {
      try {
        const res = await fetch(`https://apii.agrivemart.com/api/wareHouse/`);
        const data = await res.json();
        setWarehouses(data);
      } catch (error) {
        console.error("Error fetching warehouses:", error);
      }
    };

  useEffect(() => {
    fetchWarehouses();
    fetchItems();
  }, []);

  useEffect(() => {
    let filtered = items.filter(item => item.totalStock === 0);

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(lowerSearch) ||
          item.brand?.toLowerCase().includes(lowerSearch) ||
          item.shortDescription?.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, items]);

  const handleOpenStockDialog = (item) => {
    setSelectedItem(item);
    if (item.warehouseStock && item.warehouseStock.length > 0) {
      const firstStock = item.warehouseStock[0];
      setSelectedWarehouse(firstStock._id || firstStock.warehouseId);
      setNewStock(firstStock.stock || 0);
    } else {
      setSelectedWarehouse('');
      setNewStock(0);
    }
    setOpenStockDialog(true);
  };

  const handleWarehouseChange = (warehouseId) => {
    setSelectedWarehouse(warehouseId);
    if (selectedItem && selectedItem.warehouseStock) {
      const ws = selectedItem.warehouseStock.find(
        (w) => (w._id || w.warehouseId) === warehouseId
      );
      setNewStock(ws ? ws.stock : 0);
    } else {
      setNewStock(0);
    }
  };

  const handleCloseStockDialog = () => {
    setSelectedItem(null);
    setSelectedWarehouse('');
    setNewStock(0);
    setOpenStockDialog(false);
  };

  const handleUpdateStock = async () => {
    if (!selectedItem || !selectedWarehouse) return;

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(
        `https://apii.agrivemart.com/api/admin/${selectedItem.productId}/variant/${selectedItem.variantId}/warehouse/${selectedWarehouse}/stock`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ stock: Number(newStock) }),
        }
      );

      if (response.ok) {
        alert("Stock updated successfully");
        setItems((prev) =>
          prev.map((item) =>
            item._id === selectedItem._id ? { ...item, stock: newStock } : item
          )
        );
        handleCloseStockDialog();
      } else {
        const errText = await response.text();
        console.error("Failed:", errText);
        alert("Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Error updating stock");
    }
  };
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
    if (!editItem) return;

    const token = localStorage.getItem('authToken');

    try {
      let body;
      let headers = { Authorization: `Bearer ${token}` };

      // If uploadType is 'file', use FormData
      if (editItem.uploadType === 'file') {
        body = new FormData();
        body.append('name', editItem.name?.trim() || '');
        body.append('shortDescription', editItem.shortDescription?.trim() || '');
        body.append('description', editItem.description?.trim() || '');
        body.append('brand', editItem.brand?.trim() || '');
        body.append('category', editItem.category || '');
        body.append('subcategory', editItem.subcategory || '');
        body.append('gst', editItem.gst || 0);
        body.append('variants', JSON.stringify([{
          price: Number(editItem.price),
          discount: Number(editItem.discount),
          quantity: Number(editItem.quantity),
          unit: editItem.unit,
          warehouseStock: editItem.warehouseStock || [],
        }]));
      } else {
        // JSON payload
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          name: editItem.name?.trim() || '',
          shortDescription: editItem.shortDescription?.trim() || '',
          description: editItem.description?.trim() || '',
          brand: editItem.brand?.trim() || '',
          category: editItem.category || '',
          subcategory: editItem.subcategory || '',
          gst: editItem.gst || 0,
          variants: [{
            price: Number(editItem.price),
            discount: Number(editItem.discount),
            quantity: Number(editItem.quantity),
            unit: editItem.unit,
            warehouseStock: editItem.warehouseStock || [],
          }],
        });
      }

      const response = await fetch(`https://apii.agrivemart.com/api/admin/products/${editItem.productId}`, {
        method: 'PUT',
        headers,
        body,
      });

      if (response.ok) {
        const updatedData = await response.json();

        // Update local state
        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === editItem._id ? { ...item, ...editItem } : item
          )
        );

        handleClose();
        alert('Item updated successfully');
      } else {
        const errorText = await response.text();
        console.error('Update failed:', errorText);
        alert('Update failed');
      }
    } catch (err) {
      console.error('Network error:', err);
      alert('Error updating item');
    }
  };
  const columns = [
    { field: '_id', headerName: 'ID', width: 220 },
    { field: 'name', headerName: 'Name', width: 160 },
    { field: 'brand', headerName: 'Brand', width: 120 },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'shortDescription', headerName: 'Short Desc', width: 150 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'subcategory', headerName: 'Subcategory', width: 150 },
    { field: 'gst', headerName: 'GST %', width: 90 },
    { field: 'price', headerName: 'Price (₹)', width: 100 },
    { field: 'discount', headerName: 'Discount %', width: 100 },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 120,
      renderCell: params => `${params.row.quantity} ${params.row.unit || ''}`,
    },
    {
      field: 'warehouseStock',
      headerName: 'Warehouse Stock',
      width: 200,
      renderCell: params => {
        if (!params.row.warehouseStock || params.row.warehouseStock.length === 0) {
          return 'No Stock';
        }
        const tooltipText = params.row.warehouseStock
          .map(s => `${s.location} (${s.pincode}): ${s.stock}`)
          .join('\n');
        return (
          <Tooltip title={tooltipText} arrow placement="top">
            <Box>
              {params.row.warehouseStock.map((ws, i) => (
                <Typography key={i} variant="body2">
                  {ws.location} ({ws.pincode}): {ws.stock}
                </Typography>
              ))}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: 'updateStock',
      headerName: 'Add Stock',
      width: 120,
      renderCell: (params) => (
        <IconButton onClick={() => handleOpenStockDialog(params.row)} color="primary">
          <WarehouseIcon />
        </IconButton>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
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
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      renderCell: params => {
        const date = new Date(params.row.createdAt);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
      },
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
        minHeight: '100vh',
        flexDirection: 'column',
      }}
    >
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ color: '#F1C40F', textAlign: 'center' }}>
          Out Of Stock Products
        </Typography>

        {/* Search & Filter */}
        <Box sx={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <TextField
            label="Search Products"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            sx={{ backgroundColor: '#f5f5f5' }}
          />

          <FormControl fullWidth sx={{ backgroundColor: '#f5f5f5' }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categoryOptions.map((cat) => (
                <MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Products Table */}
        {filteredItems.length > 0 ? (
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={filteredItems}
              columns={columns}
              pageSize={5}
              getRowId={row => row._id}
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
      </CardContent>

      {/* Stock Dialog */}
      <Dialog open={openStockDialog} onClose={handleCloseStockDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Warehouse</InputLabel>
            <Select
              value={selectedWarehouse}
              onChange={(e) => handleWarehouseChange(e.target.value)}
            >
              {warehouses.map((wh) => (
                <MenuItem key={wh._id} value={wh._id}>
                  {wh.name} - {wh.location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="New Stock"
            type="number"
            fullWidth
            margin="normal"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStockDialog} color="error">Cancel</Button>
          <Button onClick={handleUpdateStock} color="success">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} id="edit-form">
            {editItem?.warehouseStock && editItem.warehouseStock.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Warehouse Stock</Typography>
                {editItem.warehouseStock.map((ws, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <TextField
                      label="Location"
                      value={ws.location}
                      onChange={(e) => {
                        const newWS = [...editItem.warehouseStock];
                        newWS[idx].location = e.target.value;
                        setEditItem({ ...editItem, warehouseStock: newWS });
                      }}
                    />
                    <TextField
                      label="Pincode"
                      value={ws.pincode}
                      onChange={(e) => {
                        const newWS = [...editItem.warehouseStock];
                        newWS[idx].pincode = e.target.value;
                        setEditItem({ ...editItem, warehouseStock: newWS });
                      }}
                    />
                    <TextField
                      label="Stock"
                      type="number"
                      value={ws.stock}
                      onChange={(e) => {
                        const newWS = [...editItem.warehouseStock];
                        newWS[idx].stock = Number(e.target.value);
                        setEditItem({ ...editItem, warehouseStock: newWS });
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            <DialogActions>
              <Button onClick={handleClose} sx={{ color: '#E74C3C' }}>Cancel</Button>
              <Button type="submit" form="edit-form" sx={{ color: '#2ECC71' }}>Save</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default OutOfStockProducts;
