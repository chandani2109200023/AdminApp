import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, TextField, Box,
  FormControl, Select, MenuItem, FormHelperText, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const UploadItem = () => {
  const [variantCountInput, setVariantCountInput] = useState('1');
  const [fileInputs, setFileInputs] = useState({}); // { index: File }
  const [filePreviews, setFilePreviews] = useState({}); // { index: URL }

  const variantCount = Math.max(1, parseInt(variantCountInput) || 1);

  const validationSchema = Yup.object({
    name: Yup.string().required('Item name is required'),
    brand: Yup.string().required('Brand is required'),
    description: Yup.string().required('Description is required'),
    category: Yup.string().required('Category is required'),
    variants: Yup.array()
      .of(
        Yup.object().shape({
          price: Yup.number().required('Price is required').positive('Must be positive'),
          discount: Yup.number().required('Discount is required').min(0, 'Cannot be negative'),
          stock: Yup.number().required('Stock is required').integer('Must be integer'),
          quantity: Yup.number().required('Quantity is required').integer('Must be integer').positive('Must be positive'),
          unit: Yup.string().required('Unit is required'),
          uploadType: Yup.string().oneOf(['url', 'file']).required('Select image upload type'),
          imageUrl: Yup.string().when('uploadType', {
            is: 'url',
            then: (schema) => schema.required('Image URL is required').url('Enter a valid URL'),
            otherwise: (schema) => schema.notRequired(),
          }),
        })
      )
      .min(1, 'At least one variant is required'),
  });

  const initialValues = {
    name: '',
    brand: '',
    description: '',
    category: '',
    variants: Array.from({ length: variantCount }, () => ({
      price: '',
      discount: '',
      stock: '',
      quantity: '',
      unit: '',
      imageUrl: '',
      uploadType: 'url',
    })),
  };

  // Effect to update variant count dynamically inside Formik
  // We will trigger Formik reset when variantCount changes (via enableReinitialize)

  const handleSubmit = async (values, { resetForm }) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Missing token');
      return;
    }

    const formData = new FormData();

    formData.append('name', values.name);
    formData.append('brand', values.brand);
    formData.append('description', values.description);
    formData.append('category', values.category);

    const variants = values.variants.map((variant, i) => {
      const v = { ...variant };
      if (variant.uploadType === 'file' && fileInputs[i]) {
        formData.append(`image_${i}`, fileInputs[i]); // Send file separately
        delete v.imageUrl; // imageUrl not needed
      }
      return v;
    });

    formData.append('variants', JSON.stringify(variants));

    try {
      const response = await axios.post('https://apii.agrivemart.com/api/admin/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        alert('Uploaded successfully');
        resetForm();
        setFileInputs({});
        setFilePreviews({});
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    }
  };

  return (
    <Container sx={{ padding: 2, backgroundColor: '#2E3B4E', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ color: '#FFD700' }}>Upload New Product</Typography>

      <Box marginBottom={2}>
        <TextField
          label="Number of Variants"
          type="number"
          value={variantCountInput}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*$/.test(val)) {
              setVariantCountInput(val);
            }
          }}
          onBlur={() => {
            if (!variantCountInput || parseInt(variantCountInput) < 1) {
              setVariantCountInput('1');
            }
          }}
          fullWidth
          InputProps={{ style: { backgroundColor: '#F0F0F0', color: '#333' } }}
          helperText="Minimum 1 variant required"
        />
      </Box>

      <Formik
        enableReinitialize
        initialValues={{
          ...initialValues,
          variants: Array.from({ length: variantCount }, (_, i) =>
            initialValues.variants[i] || {
              price: '',
              discount: '',
              stock: '',
              quantity: '',
              unit: '',
              imageUrl: '',
              uploadType: 'url',
            }
          ),
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            {["name", "brand", "description"].map((field) => (
              <Box key={field} marginBottom={1}>
                <TextField
                  fullWidth
                  label={field[0].toUpperCase() + field.slice(1)}
                  name={field}
                  value={values[field]}
                  onChange={(e) => setFieldValue(field, e.target.value)}
                  error={touched[field] && Boolean(errors[field])}
                  helperText={touched[field] && errors[field]}
                  InputProps={{ style: { backgroundColor: '#F0F0F0', color: '#333' } }}
                />
              </Box>
            ))}

            <FormControl fullWidth error={touched.category && Boolean(errors.category)} sx={{ mb: 2 }}>
              <Select
                name="category"
                value={values.category}
                onChange={(e) => setFieldValue('category', e.target.value)}
                displayEmpty
                inputProps={{ style: { backgroundColor: '#F0F0F0', color: '#333' } }}
              >
                <MenuItem value="" disabled>Select Category</MenuItem>
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
                <MenuItem value="Paper Products">Paper Products</MenuItem>
                <MenuItem value="Toiletries">Toiletries</MenuItem>
                <MenuItem value="Chips & Namkeen">Chips & Namkeen</MenuItem>
                <MenuItem value="Drinks & Juices">Drinks & Juices</MenuItem>
                <MenuItem value="Ice Creams & More">Ice Creams & More</MenuItem>
                <MenuItem value="Instant Food">Instant Food</MenuItem>
                <MenuItem value="Sauces & Spreads">Sauces & Spreads</MenuItem>
                <MenuItem value="Sweets & Chocolates">Sweets & Chocolates</MenuItem>
                <MenuItem value="Tea, Coffee & Milk Drinks">Tea, Coffee & Milk Drinks</MenuItem>
              </Select>
              {touched.category && errors.category && (
                <FormHelperText>{errors.category}</FormHelperText>
              )}
            </FormControl>

            <FieldArray name="variants">
              {() => (
                <>
                  {values.variants.map((variant, index) => (
                    <Box key={index} mt={2} p={2} bgcolor="#37475A" borderRadius={1}>
                      <Typography variant="subtitle1" color="#FFD700">
                        Variant {index + 1}
                      </Typography>

                      {["price", "discount", "stock", "quantity"].map((field) => (
                        <TextField
                          key={field}
                          label={field[0].toUpperCase() + field.slice(1)}
                          name={`variants[${index}].${field}`}
                          type="number"
                          fullWidth
                          margin="normal"
                          value={variant[field]}
                          onChange={(e) => setFieldValue(`variants[${index}].${field}`, e.target.value)}
                          error={touched.variants?.[index]?.[field] && Boolean(errors.variants?.[index]?.[field])}
                          helperText={touched.variants?.[index]?.[field] && errors.variants?.[index]?.[field]}
                          InputProps={{ style: { backgroundColor: '#F0F0F0', color: '#333' } }}
                        />
                      ))}

                      <FormControl component="fieldset" sx={{ mt: 1 }}>
                        <RadioGroup
                          row
                          value={variant.uploadType || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Reset file input and URL on change
                            setFieldValue(`variants[${index}].uploadType`, value);
                            if (value === 'url') {
                              setFileInputs(prev => {
                                const copy = { ...prev };
                                delete copy[index];
                                return copy;
                              });
                              setFilePreviews(prev => {
                                const copy = { ...prev };
                                if (copy[index]) {
                                  URL.revokeObjectURL(copy[index]);
                                  delete copy[index];
                                }
                                return copy;
                              });
                              setFieldValue(`variants[${index}].imageUrl`, '');
                            }
                            if (value === 'file') {
                              setFieldValue(`variants[${index}].imageUrl`, '');
                            }
                          }}
                        >
                          <FormControlLabel value="url" control={<Radio />} label="Image URL" />
                          <FormControlLabel value="file" control={<Radio />} label="Upload Image" />
                        </RadioGroup>
                      </FormControl>

                      {variant.uploadType === 'url' && (
                        <TextField
                          label="Image URL"
                          name={`variants[${index}].imageUrl`}
                          fullWidth
                          margin="normal"
                          value={variant.imageUrl}
                          onChange={(e) => setFieldValue(`variants[${index}].imageUrl`, e.target.value)}
                          error={touched.variants?.[index]?.imageUrl && Boolean(errors.variants?.[index]?.imageUrl)}
                          helperText={touched.variants?.[index]?.imageUrl && errors.variants?.[index]?.imageUrl}
                          InputProps={{ style: { backgroundColor: '#F0F0F0', color: '#333' } }}
                        />
                      )}

                      {variant.uploadType === 'file' && (
                        <>
                          <Button
                            variant="contained"
                            component="label"
                            sx={{ mt: 1, mb: 2, backgroundColor: '#888' }}
                          >
                            Upload Image File
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const file = e.currentTarget.files[0];
                                if (file) {
                                  const img = new Image();
                                  img.onload = () => {
                                    // Clean up old preview URL
                                    if (filePreviews[index]) {
                                      URL.revokeObjectURL(filePreviews[index]);
                                    }
                                    setFileInputs(prev => ({ ...prev, [index]: file }));
                                    setFilePreviews(prev => ({
                                      ...prev,
                                      [index]: URL.createObjectURL(file),
                                    }));

                                  };
                                  img.src = URL.createObjectURL(file);
                                }
                              }}
                            />
                          </Button>

                          {filePreviews[index] && (
                            <img
                              src={filePreviews[index]}
                              alt="Preview"
                              style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                            />
                          )}
                        </>
                      )}

                      <FormControl fullWidth error={touched.variants?.[index]?.unit && Boolean(errors.variants?.[index]?.unit)}>
                        <Select
                          name={`variants[${index}].unit`}
                          value={variant.unit}
                          onChange={(e) => setFieldValue(`variants[${index}].unit`, e.target.value)}
                          displayEmpty
                          inputProps={{ style: { backgroundColor: '#F0F0F0', color: '#333' } }}
                        >
                          <MenuItem value="" disabled>Select Unit</MenuItem>
                          <MenuItem value="kg">Kg</MenuItem>
                          <MenuItem value="gm">Gram</MenuItem>
                          <MenuItem value="ml">Milliliter</MenuItem>
                          <MenuItem value="l">Liter</MenuItem>
                          <MenuItem value="pieces">Pieces</MenuItem>
                        </Select>
                        {touched.variants?.[index]?.unit && (
                          <FormHelperText>{errors.variants?.[index]?.unit}</FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                  ))}
                </>
              )}
            </FieldArray>

            <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#FFD700', marginTop: 2 }}>
              Submit Product
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default UploadItem;
