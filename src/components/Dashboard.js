import React, { useState, useEffect } from 'react';

function DashboardCard({ title, value, bgColor }) {
  return (
    <div
      style={{
        backgroundColor: bgColor,
        borderRadius: '10px',
        padding: '20px',
        color: '#fff',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Added shadow for modern look
        transition: 'transform 0.2s, box-shadow 0.2s', // Smooth hover effect
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
      }}
    >
      <h3
        style={{
          fontSize: '1.5rem',
          marginTop: '100px',
          textAlign: 'center',

        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '20px',
          textAlign: 'center',

        }}
      >
        {value}
      </p>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState({
    todaysOrders: 0,
    todayOrderDeliver: 0,
    appUsers: 0,  
    totalOrderDeliver: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    // Fetch the total number of products (no token here)
    const fetchTotalProducts = async () => {
      try {
        const response = await fetch('https://sastabazar.onrender.com/api/user/products');
        const products = await response.json();
        setData((prevData) => ({
          ...prevData,
          totalProducts: products.length,
        }));
      } catch (error) {
        console.error('Error fetching total products:', error);
      }
    };

    // Fetch the total number of app users (with token)
    const fetchAppUsers = async () => {
      const token = localStorage.getItem('authToken');  // Get token from localStorage

      try {
        const response = await fetch('https://sastabazar.onrender.com/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,  // Add token to Authorization header
          }
        });
        const users = await response.json();
        console.log('Fetched Users:', users); // Debug log for users

        setData((prevData) => ({
          ...prevData,
          appUsers: users.length,  // Update appUsers count
        }));
      } catch (error) {
        console.error('Error fetching app users:', error);
      }
    };

    fetchTotalProducts();
    fetchAppUsers();  // Call to fetch app users

  }, []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr', // Responsive grid for all screen sizes
        gap: '20px',
        padding: '20px',
        backgroundColor: '#f7f9fc', // Light background for contrast
        minHeight: '90vh',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
        }}
      >
        <DashboardCard title="Today's Orders" value={data.todaysOrders} bgColor="#4CAF50" />
        <DashboardCard title="All Products" value={data.totalProducts} bgColor="#2196F3" />
        <DashboardCard title="Today's Order Deliver" value={data.todayOrderDeliver} bgColor="#FFC107" />
        <DashboardCard title="All App Users" value={data.appUsers} bgColor="#607D8B" />
        <DashboardCard title="Total Order Deliver" value={data.totalOrderDeliver} bgColor="#f44336" />
        <DashboardCard title="Pending Orders" value={data.pendingOrders} bgColor="#9C27B0" />
      </div>
    </div>
  );
}

export default Dashboard;
