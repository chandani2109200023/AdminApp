import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { Switch } from "@mui/material";
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
import WarehouseIcon from '@mui/icons-material/Warehouse';
const categoryOptions = [
  {
    name: "Baby Care",
    subcategories: [
      "Baby Bath & Hygiene",
      "Baby Food",
      "Baby Gift Set",
      "Baby Skin Care",
      "Diapers & Wipes"
    ]
  },
  {
    name: "Bakery, Cakes & Dairy",
    subcategories: [
      "Breads & Cake",
      "Butter, Paneer, Cheese & Cream",
      "Milk, Milk Powder & Curd"
    ]
  },
  {
    name: "Beverages",
    subcategories: [
      "Coffee",
      "Fruit Juice & Squash",
      "Health & Energy Drinks",
      "Ice Creams & Desserts",
      "Lassi, Milkshake & Buttermilk",
      "Soft Drinks",
      "Tea",
      "Water"
    ]
  },
  {
    name: "Cleaning & Household",
    subcategories: [
      "All Purpose Cleaners",
      "Appliances & Electricals",
      "Car & Shoe Care",
      "Detergent & Dishwash",
      "Disposable & Garbage Bag",
      "Home & Bathroom Cleaning",
      "Kitchen Utilities",
      "Party & Festive Needs",
      "Puja Needs",
      "Repellents & Fresheners"
    ]
  },
  {
    name: "Combo",
    subcategories: [
      "Festive Combo",
      "Super Saving Combo"
    ]
  },
  {
    name: "Fish, Meat & Egg",
    subcategories: [
      "Eggs",
      "Fresh Chicken",
      "Fresh Fish",
      "Fresh Mutton",
      "Frozen Fish"
    ]
  },
  {
    name: "Foodgrain",
    subcategories: [
      "Atta, Flours, Sooji, Besan",
      "Dal & Pulses",
      "Rice & Rice Products"
    ]
  },
  {
    name: "Frozen Foods",
    subcategories: [
      "Non-Vegetarian",
      "Vegetarian"
    ]
  },
  {
    name: "Fruits & Vegetables",
    subcategories: [
      "Fruit & Vegetable Cleaner",
      "Fruits",
      "Vegetables"
    ]
  },
  {
    name: "Gift Packs",
    subcategories: [
      "For Couple",
      "For Her",
      "For Him",
      "For Kids",
      "Body Care"
    ]
  },
  {
    name: "Herbal",
    subcategories: [
      "Food & Drinks",
      "For Home",
      "Kitchen Accessories"
    ]
  },
  {
    name: "Kitchen & Dining Needs",
    subcategories: [
      "Steel Utensils",
      "Storage & Accessories"
    ]
  },
  {
    name: "Mask & Sanitisers",
    subcategories: [
      "Mask",
      "Sanitizers"
    ]
  },
  {
    name: "Membership Plan",
    subcategories: []
  },
  {
    name: "Oil & Spices",
    subcategories: [
      "Cooking Paste",
      "Herbs & Whole Spices",
      "Oil, Dalda & Ghee",
      "Powder Spices",
      "Salt & Sugar"
    ]
  },
  {
    name: "Personal Care",
    subcategories: [
      "Adult Diaper",
      "Bath & Handwash",
      "Cosmetics",
      "Face Care",
      "Feminine Hygiene",
      "Hair Care",
      "Medicare",
      "Men's Grooming",
      "Oral Care",
      "Perfumes & Deos",
      "Skin Care",
      "Wellness Product",
      "Winter Care",
      "Wipes & Tissues"
    ]
  },
  {
    name: "Snacks & Branded Foods",
    subcategories: [
      "Baking",
      "Biscuits & Cookies",
      "Breakfast Cereals & Oats",
      "Canned Food",
      "Chocolates & Candies",
      "Indian Mithai",
      "Jam & Honey",
      "Noodles, Pasta & Vermicelli",
      "Pickles & Chutney",
      "Ready to Cook",
      "Snacks & Namkeen",
      "Spread, Sauce & Ketchup"
    ]
  },
  {
    name: "Stationery & Office Supplies",
    subcategories: [
      "Folder & Desk Supplies",
      "Notebook & Pens"
    ]
  }
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
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [newStock, setNewStock] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const page = 1;
        const response = await fetch(`https://apii.agrivemart.com/api/user/products?page=${page}&limit=10000`);
        const data = await response.json();
        const products = data.products || [];

        const flattened = products
          .map((product) => {
            if (!Array.isArray(product.variants)) return [];
            return product.variants.map((variant) => ({
              ...variant,
              variantId: variant._id?.$oid || variant._id,
              productId: product._id?.$oid || product._id,
              name: product.name,
              description: product.description,
              shortDescription: product.shortDescription,
              category: product.category,
              subcategory: product.subcategory,
              brand: product.brand,
              gst: product.gst,
              isLive: product.isLive || false,
              createdAt: product.createdAt?.$date || product.createdAt || null,
              warehouseStock: variant.warehouseStock || [],
            }));
          })
          .flat();

        setItems(flattened);
        setFilteredItems(flattened);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching items:', error);
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

    fetchItems();
    fetchWarehouses();
  }, []);
  const handleToggleLive = async (item) => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(
        `https://apii.agrivemart.com/api/admin/products/${item.productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isLive: !item.isLive, // toggle
          }),
        }
      );

      if (response.ok) {
        setItems((prev) =>
          prev.map((i) =>
            i.productId === item.productId ? { ...i, isLive: !i.isLive } : i
          )
        );
      } else {
        const errText = await response.text();
        console.error("Failed to toggle isLive:", errText);
        alert("Failed to update live status");
      }
    } catch (error) {
      console.error("Error toggling isLive:", error);
      alert("Error updating live status");
    }
  };

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
      filtered = filtered.filter(item => {
        if (!item.warehouseStock || item.warehouseStock.length === 0) return true;
        return item.warehouseStock.some(ws => Number(ws.stock) === 0);
      });
    }
    setFilteredItems(filtered);
  };


  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, stockFilter, items]);
  const handleOpenStockDialog = (item) => {
    setSelectedItem(item);

    // If warehouseStock exists, pre-fill newStock for first warehouse by default
    if (item.warehouseStock && item.warehouseStock.length > 0) {
      const firstStock = item.warehouseStock[0];
      setSelectedWarehouse(firstStock._id || firstStock.warehouseId); // use your warehouse ID
      setNewStock(firstStock.stock || 0);
    } else {
      setSelectedWarehouse('');
      setNewStock(0);
    }

    setOpenStockDialog(true);
  };
  // When warehouse dropdown changes, auto-fill stock
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

  // ✅ Call backend API to update stock
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

        // update UI instantly
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

      if (editItem.uploadType === 'file') {
        // ✅ FormData for file upload
        body = new FormData();
        body.append('name', editItem.name?.trim() || '');
        body.append('shortDescription', editItem.shortDescription?.trim() || '');
        body.append('description', editItem.description?.trim() || '');
        body.append('brand', editItem.brand?.trim() || '');
        body.append('category', editItem.category || '');
        body.append('subcategory', editItem.subcategory || '');
        body.append('gst', editItem.gst || 0);

        // Variant data
        const variantData = {
          price: Number(editItem.price),
          mrp: Number(editItem.mrp),
          discount: Number(editItem.discount),
          quantity: Number(editItem.quantity),
          unit: editItem.unit,
          uploadType: 'file',
          warehouseStock: editItem.warehouseStock || [],
        };

        // Only append new file if selected, otherwise preserve old image
        if (editItem.imageFile) {
          body.append('image_0', editItem.imageFile);
        } else if (editItem.localImageUrl) {
          variantData.localImageUrl = editItem.localImageUrl;
        }

        body.append('variants', JSON.stringify([variantData]));

      } else {
        // ✅ JSON payload for URL-based variant
        headers['Content-Type'] = 'application/json';

        const variantData = {
          price: Number(editItem.price),
          mrp: Number(editItem.mrp),
          discount: Number(editItem.discount),
          quantity: Number(editItem.quantity),
          unit: editItem.unit,
          warehouseStock: editItem.warehouseStock || [],
          uploadType: 'url',
        };

        // Only include imageUrl if provided
        if (editItem.imageUrl) variantData.imageUrl = editItem.imageUrl;
        // Preserve localImageUrl if it exists
        if (editItem.localImageUrl) variantData.localImageUrl = editItem.localImageUrl;

        body = JSON.stringify({
          name: editItem.name?.trim() || '',
          shortDescription: editItem.shortDescription?.trim() || '',
          description: editItem.description?.trim() || '',
          brand: editItem.brand?.trim() || '',
          category: editItem.category || '',
          subcategory: editItem.subcategory || '',
          gst: editItem.gst || 0,
          variants: [variantData],
        });
      }

      // Call API
      const response = await fetch(`https://apii.agrivemart.com/api/admin/products/${editItem.productId}`, {
        method: 'PUT',
        headers,
        body,
      });

      if (response.ok) {
        const updatedData = await response.json();

        // Update local state including image preservation
        setItems((prevItems) =>
          prevItems.map((item) =>
            item._id === editItem._id
              ? {
                ...item,
                ...editItem,
                localImageUrl: editItem.localImageUrl || item.localImageUrl,
                imageUrl: editItem.imageUrl || item.imageUrl,
              }
              : item
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
    { field: 'mrp', headerName: 'MRp (₹)', width: 100 },
    { field: 'price', headerName: 'Price (₹)', width: 100 },
    { field: 'discount', headerName: 'Discount %', width: 100 },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 120,
      renderCell: (params) => `${params.row.quantity} ${params.row.unit || ''}`,
    },
    {
      field: 'warehouseStock',
      headerName: 'Warehouse Stock',
      width: 200,
      renderCell: (params) => {
        if (!params.row.warehouseStock || params.row.warehouseStock.length === 0) {
          return 'No Stock';
        }
        const tooltipText = params.row.warehouseStock.map(s => `${s.location} (${s.pincode}): ${s.stock}`).join('\n');
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
      headerName: 'Image',
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate(`/product/${params.row.variantId}/images`)}
        >
          Manage Images
        </Button>
      ),
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
      field: "isLive",
      headerName: "Live",
      width: 120,
      renderCell: (params) => (
        <Switch
          checked={params.row.isLive}
          onChange={() => handleToggleLive(params.row)}
          color="success"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      renderCell: (params) => {
        const date = new Date(params.row.createdAt);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
      },
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
              {categoryOptions.map(cat => (
                <MenuItem key={cat.name} value={cat.name}>
                  {cat.name}
                </MenuItem>
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
        {/* ✅ Stock Update Dialog */}
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
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit} id="edit-form">
              {/* Product ID (readonly) */}
              <TextField
                label="Product ID"
                fullWidth
                value={editItem?.productId || ''}
                margin="normal"
                InputProps={{ readOnly: true }}
              />

              {/* Variant ID (readonly) */}
              <TextField
                label="Variant ID"
                fullWidth
                value={editItem?.variantId || ''}
                margin="normal"
                InputProps={{ readOnly: true }}
              />

              {/* Name */}
              <TextField
                label="Name"
                fullWidth
                value={editItem?.name || ''}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                margin="normal"
                required
              />

              {/* Short Description */}
              <TextField
                label="Short Description"
                fullWidth
                value={editItem?.shortDescription || ''}
                onChange={(e) => setEditItem({ ...editItem, shortDescription: e.target.value })}
                margin="normal"
              />

              {/* Description */}
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={editItem?.description || ''}
                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                margin="normal"
              />

              {/* Brand */}
              <TextField
                label="Brand"
                fullWidth
                value={editItem?.brand || ''}
                onChange={(e) => setEditItem({ ...editItem, brand: e.target.value })}
                margin="normal"
                required
              />
              {/* Category */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={editItem?.category || ''}
                  onChange={(e) => {
                    const selectedCat = e.target.value;
                    setEditItem({
                      ...editItem,
                      category: selectedCat,
                      // Only reset subcategory if category is different from previous
                      subcategory: selectedCat !== editItem.category ? '' : editItem.subcategory,
                    });
                  }}
                  required
                >
                  {categoryOptions.map((cat) => (
                    <MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Subcategory */}
              <FormControl fullWidth margin="normal" disabled={!editItem?.category}>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={editItem?.subcategory || ''}
                  onChange={(e) => setEditItem({ ...editItem, subcategory: e.target.value })}
                  required
                >
                  {editItem?.category &&
                    categoryOptions
                      .find((cat) => cat.name === editItem.category)
                      ?.subcategories.map((sub) => (
                        <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                      ))
                  }
                </Select>
              </FormControl>
              {/* GST */}
              <TextField
                label="GST (%)"
                type="number"
                fullWidth
                value={editItem?.gst || 0}
                onChange={(e) => setEditItem({ ...editItem, gst: Number(e.target.value) })}
                margin="normal"
              />

              {/* Price */}
              {/* MRP */}
              <TextField
                label="MRP (₹)"
                type="number"
                fullWidth
                value={editItem?.mrp || 0}
                onChange={(e) => {
                  const newMrp = Number(e.target.value) || 0;
                  const discountVal = editItem?.discount || 0;
                  const calculatedPrice = newMrp - (newMrp * discountVal / 100);

                  setEditItem({
                    ...editItem,
                    mrp: newMrp,
                    price: Number(calculatedPrice.toFixed(2)), // auto update price
                  });
                }}
                margin="normal"
                required
              />

              {/* Discount */}
              <TextField
                label="Discount (%)"
                type="number"
                fullWidth
                value={editItem?.discount || 0}
                onChange={(e) => {
                  const newDiscount = Number(e.target.value) || 0;
                  const mrpVal = editItem?.mrp || 0;
                  const calculatedPrice = mrpVal - (mrpVal * newDiscount / 100);

                  setEditItem({
                    ...editItem,
                    discount: newDiscount,
                    price: Number(calculatedPrice.toFixed(2)), // auto update price
                  });
                }}
                margin="normal"
              />

              {/* Price (read-only) */}
              <TextField
                label="Price (₹)"
                type="number"
                fullWidth
                value={editItem?.price || 0}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              {/* Quantity + Unit */}
              <Box sx={{ display: "flex", gap: 2 }}>
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
                      <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {/* Created At (readonly) */}
              <TextField
                label="Created At"
                fullWidth
                value={editItem?.createdAt ? new Date(editItem.createdAt).toLocaleString() : "N/A"}
                margin="normal"
                InputProps={{ readOnly: true }}
              />

              {/* Warehouse Stock (optional: editable) */}
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
      </CardContent>
    </Container>
  );
};

export default ItemList;
