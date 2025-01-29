import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post('https://sastabazar.onrender.com/api/auth/loginAdmin', {
        email: values.email,
        password: values.password,
      });

      const token = response.data?.token;
      if (!token) {
        throw new Error('Token not found in response');
      }

      localStorage.setItem('authToken', token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        alert(error.response.data?.message || 'Login failed');
      } else if (error.request) {
        alert('No response from server. Please try again later.');
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F8F9FA',
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          backgroundColor: '#2C3E50',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ color: '#F0F0F0', fontWeight: 'bold' }}
          >
            Admin Login
          </Typography>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Box marginBottom={3}>
                  <Field
                    as={TextField}
                    name="email"
                    label="Email"
                    fullWidth
                    variant="outlined"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    InputProps={{
                      style: {
                        backgroundColor: '#F0F0F0',
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Box>
                <Box marginBottom={3}>
                  <Field
                    as={TextField}
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      style: {
                        backgroundColor: '#F0F0F0',
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    backgroundColor: '#FFC947',
                    color: '#000',
                    padding: '10px 0',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#FFD369' },
                  }}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;
