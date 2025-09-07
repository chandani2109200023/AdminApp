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
  Select,
  Pagination,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const AllProductsPage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = async () => {
    try {
      const response = await fetch(`https://apii.agrivemart.com/api/user/products?page=1&limit=10000`);
      const data = await response.json();
      const products = data.products || [];

      const flattened = products
        .map((product) => {
          if (!Array.isArray(product.variants)) return [];

          return product.variants.map((variant) => ({
            ...variant,
            variantId: variant._id?.$oid || variant._id,
            productId: product._id?.$oid || product._id,
            name: product.name || '',
            description: product.description || '',
            shortDescription: product.shortDescription || product.details?.shortDescription || '',
            category: product.category || '',
            subcategory: product.subcategory || product.details?.subcategory || '',
            brand: product.brand || '',
            gst: product.gst ?? product.details?.gst ?? 0,
            price: variant.price ?? 0,
            mrp: variant.mrp ?? 0,
            discount: variant.discount ?? 0,
            quantity: variant.quantity ?? 0,
            unit: variant.unit || '',
            warehouseStock: Array.isArray(variant.warehouseStock) ? variant.warehouseStock : [],
            createdAt: product.createdAt?.$date || product.createdAt || null,
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
  useEffect(() => {
    fetchItems();
  }, [page]);
  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          item.brand?.toLowerCase().includes(lowerSearch) ||
          item.shortDescription?.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (stockFilter === 'outOfStock') {
      // Check if total warehouse stock is 0
      filtered = filtered.filter((item) => {
        if (!item.warehouseStock || item.warehouseStock.length === 0) return true;
        const totalStock = item.warehouseStock.reduce((sum, w) => sum + (w.stock || 0), 0);
        return totalStock === 0;
      });
    }

    setFilteredItems(filtered);
  };
  useEffect(() => {
    filterItems();
  }, [searchTerm, selectedCategory, stockFilter, items]);

  const columns = [
    { field: '_id', headerName: 'ID', width: 220 },
    { field: 'name', headerName: 'Name', width: 160 },
    { field: 'brand', headerName: 'Brand', width: 120 },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'shortDescription', headerName: 'Short Desc', width: 150 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'subcategory', headerName: 'Subcategory', width: 150 },
    { field: 'gst', headerName: 'GST %', width: 90 },
    { field: 'mrp', headerName: 'MRP (₹)', width: 100 },
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
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      renderCell: (params) => {
        const date = new Date(params.row.createdAt);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
      },
    }
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
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: '#F1C40F',
            textAlign: 'center',
          }}
        >
          Grocery Items
        </Typography>

        {/* Search and Filter Section */}
        <Box sx={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <TextField
            label="Search Products"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ backgroundColor: '#f5f5f5' }}
          />

          <FormControl fullWidth sx={{ backgroundColor: '#f5f5f5' }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {/* Add your static categories here */}
              <MenuItem value="Atta, Rice & Dal">Atta, Rice & Dal</MenuItem>
              <MenuItem value="Bakery & Biscuits">Bakery & Biscuits</MenuItem>
              <MenuItem value="Chicken, Meat & Fish">Chicken, Meat & Fish</MenuItem>
              <MenuItem value="Dairy, Bread & Eggs">Dairy, Bread & Eggs</MenuItem>
              <MenuItem value="Dry Fruits">Dry Fruits</MenuItem>
              <MenuItem value="Oil, Ghee & Masala">Oil, Ghee & Masala</MenuItem>
              <MenuItem value="Vegetables & Fruits">Vegetables & Fruits</MenuItem>
              <MenuItem value="Personal Care">Personal Care</MenuItem>
              <MenuItem value="Snacks & Beverages">Snacks & Beverages</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ backgroundColor: '#f5f5f5' }}>
            <InputLabel>Stock</InputLabel>
            <Select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              label="Stock"
            >
              <MenuItem value="all">All Products</MenuItem>
              <MenuItem value="outOfStock">Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Products Table */}
        {filteredItems.length > 0 ? (
          <>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </>
        ) : (
          <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
            No products available
          </Typography>
        )}
      </CardContent>
    </Container>
  );
};

export default AllProductsPage;
