// DashboardCard.js
import React from 'react';

const DashboardCard = ({ title, value, bgColor, onClick }) => (
  <div
    style={{
      backgroundColor: bgColor,
      padding: '20px',
      borderRadius: '10px',
      cursor: 'pointer',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    }}
    onClick={onClick}
  >
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

export default DashboardCard;  // Default export
