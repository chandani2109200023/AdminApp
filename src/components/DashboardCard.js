import React from 'react';
import LockIcon from '@mui/icons-material/Lock';
import { Box, Typography } from '@mui/material';

const DashboardCard = ({ title, value, bgColor, onClick }) => {
  const isLoggedIn = !!localStorage.getItem('authToken');

  const handleClick = () => {
    if (isLoggedIn && onClick) {
      onClick();
    } else {
      alert('Please login first');
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        backgroundColor: bgColor,
        padding: 3,
        borderRadius: 2,
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        opacity: isLoggedIn ? 1 : 0.6,
        position: 'relative',
        transition: '0.3s ease',
        '&:hover': {
          transform: isLoggedIn ? 'scale(1.02)' : 'none',
        },
      }}
    >
      {!isLoggedIn && (
        <LockIcon
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: '#fff',
            backgroundColor: '#e74c3c',
            borderRadius: '50%',
            padding: '4px',
          }}
        />
      )}
      <Typography variant="h6" sx={{ color: '#fff' }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Box>
  );
};

export default DashboardCard;
