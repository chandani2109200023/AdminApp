import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Button, TextField, Box,
  FormControl, Select, MenuItem, FormHelperText, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

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

const UploadItem = () => {
  const [variantCountInput, setVariantCountInput] = useState('1');
  const variantCount = Math.max(1, parseInt(variantCountInput) || 1);
  const validationSchema = Yup.object({
    name: Yup.string().required('Item name is required'),
    brand: Yup.string().required('Brand is required'),
    description: Yup.string().required('Description is required'),
    shortDescription: Yup.string().required('Short description is required'),
    category: Yup.string().required('Category is required'),
    subcategory: Yup.string().required('Subcategory is required'),
    gst: Yup.number().required('GST is required').min(0, 'Cannot be negative'),
    variants: Yup.array().of(
      Yup.object().shape({
        price: Yup.number().required('Price is required').positive('Must be positive'),
        mrp: Yup.number().required('Mrp is required').positive('Must be positive'),
        discount: Yup.number().required('Discount is required').min(0, 'Cannot be negative'),
        quantity: Yup.number().required('Quantity is required').integer('Must be integer').positive('Must be positive'),
        unit: Yup.string().required('Unit is required'),
      })
    ).min(1, 'At least one variant is required'),
  });

  const initialValues = {
    name: '',
    brand: '',
    description: '',
    shortDescription: '',
    gst: '',
    category: '',
    subcategory: '',
    variants: Array.from({ length: variantCount }, () => ({
      price: '',
      discount: '',
      mrp: '',
      quantity: '',
      unit: '',
    })),
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return alert('Missing token');

      const response = await axios.post('https://apii.agrivemart.com/api/admin/products', values, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        alert('Product created successfully');
        resetForm();
      }
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error.message);
      alert('Upload failed');
    }
  };

  const inputStyle = { backgroundColor: '#fff', color: '#000' };
  const labelStyle = { color: '#000' };
  return (
    <Container sx={{ padding: 2, backgroundColor: '#2E3B4E', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>Upload New Product</Typography>

      <Box mb={2}>
        <TextField
          label="Number of Variants"
          type="number"
          value={variantCountInput}
          onChange={e => /^\d*$/.test(e.target.value) && setVariantCountInput(e.target.value)}
          onBlur={() => !variantCountInput && setVariantCountInput('1')}
          fullWidth
          helperText="Minimum 1 variant required"
          InputProps={{ style: inputStyle }}
          InputLabelProps={{ style: labelStyle }}
        />
      </Box>

      <Formik
        enableReinitialize
        initialValues={{
          ...initialValues,
          variants: Array.from({ length: variantCount }, (_, i) =>
            initialValues.variants[i] || { price: '', discount: '', stock: '', quantity: '', unit: '', warehouseId: '' }
          ),
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form>
            {['name', 'brand', 'description', 'shortDescription', 'gst'].map(field => (
              <Box key={field} mb={1}>
                <TextField
                  fullWidth
                  label={field[0].toUpperCase() + field.slice(1)}
                  value={values[field]}
                  onChange={e => setFieldValue(field, e.target.value)}
                  error={touched[field] && Boolean(errors[field])}
                  helperText={touched[field] && errors[field]}
                  InputProps={{ style: inputStyle }}
                  InputLabelProps={{ style: labelStyle }}
                />
              </Box>
            ))}

            <FormControl fullWidth sx={{ mb: 2 }} error={touched.category && Boolean(errors.category)}>
              <Select
                value={values.category}
                onChange={e => { setFieldValue('category', e.target.value); setFieldValue('subcategory', ''); }}
                displayEmpty
                sx={{ ...inputStyle }}
              >
                <MenuItem value="" disabled>Select Category</MenuItem>
                {categoryOptions.map(cat => <MenuItem key={cat.name} value={cat.name}>{cat.name}</MenuItem>)}
              </Select>
              {touched.category && errors.category && <FormHelperText>{errors.category}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }} error={touched.subcategory && Boolean(errors.subcategory)}>
              <Select
                value={values.subcategory}
                onChange={e => setFieldValue('subcategory', e.target.value)}
                displayEmpty
                sx={{ ...inputStyle }}
              >
                <MenuItem value="" disabled>Select Subcategory</MenuItem>
                {values.category && categoryOptions.find(c => c.name === values.category)?.subcategories.map(sub => (
                  <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                ))}
              </Select>
              {touched.subcategory && errors.subcategory && <FormHelperText>{errors.subcategory}</FormHelperText>}
            </FormControl>

            <FieldArray name="variants">
              {() => values.variants.map((variant, index) => (
                <Box key={index} mt={2} p={2} bgcolor="#37475A" borderRadius={1}>
                  <Typography variant="subtitle1" color="#FFD700">Variant {index + 1}</Typography>

                  {['mrp', 'discount', 'quantity'].map(field => (
                    <TextField
                      key={field}
                      label={field[0].toUpperCase() + field.slice(1)}
                      type="number"
                      fullWidth
                      margin="normal"
                      value={variant[field]}
                      onChange={e => {
                        setFieldValue(`variants[${index}].${field}`, e.target.value);

                        // Auto-calculate price
                        const mrpVal = field === 'mrp' ? parseFloat(e.target.value) || 0 : parseFloat(variant.mrp) || 0;
                        const discountVal = field === 'discount' ? parseFloat(e.target.value) || 0 : parseFloat(variant.discount) || 0;
                        const calculatedPrice = mrpVal - (mrpVal * discountVal / 100);
                        setFieldValue(`variants[${index}].price`, calculatedPrice.toFixed(2));
                      }}
                      error={touched.variants?.[index]?.[field] && Boolean(errors.variants?.[index]?.[field])}
                      helperText={touched.variants?.[index]?.[field] && errors.variants?.[index]?.[field]}
                      InputProps={{ style: inputStyle }}
                      InputLabelProps={{ style: labelStyle }}
                    />
                  ))}

                  <TextField
                    label="Price"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={variant.price}
                    InputProps={{ readOnly: true, style: inputStyle }}
                    InputLabelProps={{ style: labelStyle }}
                  />

                  <FormControl fullWidth sx={{ mt: 1 }}>
                    <Select
                      value={variant.unit}
                      onChange={e => setFieldValue(`variants[${index}].unit`, e.target.value)}
                      displayEmpty
                      sx={{ ...inputStyle }}
                    >
                      <MenuItem value="" disabled>Select Unit</MenuItem>
                      <MenuItem value="kg">Kg</MenuItem>
                      <MenuItem value="gm">Gram</MenuItem>
                      <MenuItem value="ml">Milliliter</MenuItem>
                      <MenuItem value="l">Liter</MenuItem>
                      <MenuItem value="pieces">Pieces</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              ))}
            </FieldArray>

            <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#FFD700', mt: 2 }}>
              Submit Product
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default UploadItem;
