import React from 'react';
import {
  Container, Typography, Button, TextField, Box, CardContent,
  FormControl, Select, MenuItem, FormHelperText
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const UploadItem = () => {
  const validationSchema = Yup.object({
    name: Yup.string().required('Item name is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.number().required('Price is required').positive('Price must be positive'),
    category: Yup.string().required('Category is required'),
    stock: Yup.number().required('Stock is required').integer('Stock must be a whole number'),
    imageUrl: Yup.string().required('Image URL is required').url('Invalid URL format'),
    quantity: Yup.number().required('Quantity is required').integer('Quantity must be a whole number').positive('Quantity must be positive'),
  });

  const handleSubmit = async (values, { resetForm }) => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      alert('Authentication token is missing. Please log in again.');
      return;
    }

    try {
      const payload = {
        ...values,
        imageUrl: values.imageUrl.trim(),
      };

      console.log('Payload being sent:', payload);

      const response = await axios.post(
        'https://sastabazar.onrender.com/api/admin/products',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        resetForm();
        window.location.reload();
      } else {
        alert('Failed to upload item. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading item:', error.response?.data || error.message || error);
      alert(
        `An error occurred: ${error.response?.data?.message || error.message || 'Unknown error'}`
      );
    }
  };

  return (
    <Container sx={{ marginTop: -1.5, padding: 2, backgroundColor: '#2E3B4E', boxShadow: 2, borderRadius: 2, marginLeft: '5px' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#FFD700' }}>
        Upload New Item
      </Typography>
      <CardContent>
        <Formik
          initialValues={{ name: '', description: '', price: '', category: '', stock: '', imageUrl: '', quantity: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form>
              <Box marginBottom={1} bgcolor="#435D74" padding={1} borderRadius="8px">
                <TextField
                  label="Name"
                  name="name"
                  fullWidth
                  onChange={(e) => setFieldValue('name', e.target.value)}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  InputProps={{
                    style: { backgroundColor: '#F0F0F0', color: '#333' },
                  }}
                />
              </Box>
              <Box marginBottom={1} bgcolor="#435D74" padding={1} borderRadius="8px">
                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  onChange={(e) => setFieldValue('description', e.target.value)}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  variant="outlined"
                  InputProps={{
                    style: { backgroundColor: '#F0F0F0', color: '#333' },
                  }}
                />
              </Box>
              <Box marginBottom={1} bgcolor="#435D74" padding={1} borderRadius="8px">
                <TextField
                  label="Price (₹)"
                  name="price"
                  type="number"
                  fullWidth
                  onChange={(e) => setFieldValue('price', e.target.value)}
                  error={touched.price && Boolean(errors.price)}
                  helperText={touched.price && errors.price}
                  variant="outlined"
                  InputProps={{
                    style: { backgroundColor: '#F0F0F0', color: '#333' },
                  }}
                />
              </Box>
              <Box marginBottom={1} bgcolor="#435D74" padding={1} borderRadius="8px">
                <FormControl fullWidth error={touched.category && Boolean(errors.category)}>
                  <Select
                    name="category"
                    value={values.category || ''}
                    onChange={(e) => setFieldValue('category', e.target.value)}
                    displayEmpty
                    variant="outlined"
                    inputProps={{
                      style: { backgroundColor: '#F0F0F0', color: '#333' },
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: { backgroundColor: '#F0F0F0' },
                      },
                    }}
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
                    <MenuItem value="Drinks & Juices">Drink & Juices</MenuItem>
                    <MenuItem value="Ice Creams & More">Ice Creams & More</MenuItem>
                    <MenuItem value="Instant Food">Instant Food</MenuItem>
                    <MenuItem value="Sauces & Spreads">Sauces & Spreads</MenuItem>
                    <MenuItem value="Sweets & Chocolates">Sweets & Chocolates</MenuItem>
                    <MenuItem value="Tea, Coffee & Milk Drinks">Tea, Coffee & Milk Drinks</MenuItem>
                  </Select>
                  {touched.category && errors.category && (
                    <FormHelperText sx={{ color: '#FFD700' }}>{errors.category}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Box marginBottom={1} bgcolor="#435D74" padding={1} borderRadius="8px">
                <TextField
                  label="Stock"
                  name="stock"
                  type="number"
                  fullWidth
                  onChange={(e) => setFieldValue('stock', e.target.value)}
                  error={touched.stock && Boolean(errors.stock)}
                  helperText={touched.stock && errors.stock}
                  variant="outlined"
                  InputProps={{
                    style: { backgroundColor: '#F0F0F0', color: '#333' },
                  }}
                />
              </Box>
              <Box marginBottom={1} bgcolor="#435D74" padding={1} borderRadius="8px">
                <TextField
                  label="Image URL"
                  name="imageUrl"
                  type="string"
                  fullWidth
                  onChange={(e) => setFieldValue('imageUrl', e.target.value)}
                  error={touched.imageUrl && Boolean(errors.imageUrl)}
                  helperText={touched.imageUrl && errors.imageUrl}
                  variant="outlined"
                  InputProps={{
                    style: { backgroundColor: '#F0F0F0', color: '#333' },
                  }}
                />
              </Box>
              <Box marginBottom={1} bgcolor="#435D74" padding={1} borderRadius="8px" display="flex" alignItems="center" gap={1}>
                <TextField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  onChange={(e) => setFieldValue('quantity', e.target.value)}
                  error={touched.quantity && Boolean(errors.quantity)}
                  helperText={touched.quantity && errors.quantity}
                  variant="outlined"
                  InputProps={{
                    style: { backgroundColor: '#F0F0F0', color: '#333' },
                  }}
                  sx={{ flex: 1 }}
                />
                <FormControl
                  error={touched.unit && Boolean(errors.unit)}
                  sx={{ minWidth: 120 }}
                >
                  <Select
                    name="unit"
                    value={values.unit || ''}
                    onChange={(e) => setFieldValue('unit', e.target.value)}
                    displayEmpty
                    variant="outlined"
                    inputProps={{
                      style: { backgroundColor: '#F0F0F0', color: '#333' },
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: { backgroundColor: '#F0F0F0' },
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      Unit
                    </MenuItem>
                    <MenuItem value="gm">Gram</MenuItem>
                    <MenuItem value="kg">Kg</MenuItem>
                    <MenuItem value="l">Liter</MenuItem>
                    <MenuItem value="ml">MilliLiter</MenuItem>
                    <MenuItem value="pieces">Pieces</MenuItem>
                    <MenuItem value="pack">Pack</MenuItem>

                  </Select>
                  {touched.unit && errors.unit && (
                    <FormHelperText sx={{ color: '#FFD700' }}>{errors.unit}</FormHelperText>
                  )}
                </FormControl>
              </Box>

              <Button type="submit" variant="contained" sx={{ backgroundColor: '#FFD700', marginTop: 1 }}>
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Container>
  );
};

export default UploadItem;
