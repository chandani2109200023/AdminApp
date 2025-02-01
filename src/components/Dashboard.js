import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from './DashboardCard.js';

function Dashboard() {
  const [data, setData] = useState({
    totalOrders: 0,
    todayOrder: [],
    todayOrderDeliver: 0,
    appUsers: 0,
    totalOrderDeliver: 0,
    totalProducts: 0,
    pendingOrders: 0,
    deliveryPersons: 0,
    outOfStock: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the total number of products
    const fetchTotalProducts = async () => {
      try {
        const response = await fetch('https://sastabazar.onrender.com/api/user/products');
        const products = await response.json();

        const outOfStockCount = products.filter(product => product.stock === 0).length;

        setData((prevData) => ({
          ...prevData,
          totalProducts: products.length,
          outOfStock: outOfStockCount,  // ✅ Fix: Correctly updating `outOfStock`
        }));
      } catch (error) {
        console.error('Error fetching total products:', error);
      }
    };

    const fetchDeliveryPersons = async () => {
      try {
        const response = await fetch('https://sastabazar.onrender.com/api/delivery/delivery-persons');
        const data = await response.json();

        if (Array.isArray(data.data)) {
          setData((prevData) => ({
            ...prevData,
            deliveryPersons: data.data.length,
          }));
        } else {
          console.error('Invalid data format for delivery persons:', data);
        }
      } catch (error) {
        console.error('Error fetching delivery persons:', error);
      }
    };

    // Fetch the total number of app users
    const fetchAppUsers = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch('https://sastabazar.onrender.com/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();

        setData((prevData) => ({
          ...prevData,
          appUsers: users.length,
        }));
      } catch (error) {
        console.error('Error fetching app users:', error);
      }
    };

    // Fetch the total number of orders and their statuses
    const fetchTotalOrders = async () => {
      try {
        const response = await fetch('https://sastabazar.onrender.com/api/delivery/orders');
        const result = await response.json();
        const orders = result.data;

        const totalOrders = orders.length;
        const today = new Date().toISOString().split('T')[0];

        const todayOrder = orders.filter(order => {
          const deliveryDate = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : null;
          return deliveryDate === today;
        });

        const todayOrderDeliver = todayOrder.filter(order => order.status === 'delivered').length;

        setData((prevData) => ({
          ...prevData,
          todayOrder,
          totalOrders,
          todayOrderDeliver,
          pendingOrders: orders.filter(order => order.status === 'pending').length,
          totalOrderDeliver: orders.filter(order => order.status === 'delivered').length,
        }));
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchTotalProducts();
    fetchAppUsers();
    fetchTotalOrders();
    fetchDeliveryPersons();
  }, []);

  const handleCardClick = (card) => {
    switch (card) {
      case 'todayOrder':
        navigate('/today-orders', { state: { data: data.todayOrder } });
        break;
      case 'totalProducts':
        navigate('/all-products', { state: { data: data.totalProducts } });
        break;
      case 'todayOrderDeliver':
        navigate('/today-order-deliver', { state: { data: data.todayOrderDeliver } });
        break;
      case 'appUsers':
        navigate('/app-users', { state: { data: data.appUsers } });
        break;
      case 'totalOrderDeliver':
        navigate('/total-order-deliver', { state: { data: data.totalOrderDeliver } });
        break;
      case 'pendingOrders':
        navigate('/pending-orders', { state: { data: data.pendingOrders } });
        break;
      case 'deliveryPersons':
        navigate('/deliveryPersons', { state: { data: data.deliveryPersons } });
        break;
      case 'totalOrders':
        navigate('/total-order', { state: { data: data.totalOrders } });
        break;
      case 'outOfStockProducts':
        navigate('/outOfStock', { state: { data: data.outOfStock } });
        break;
      default:
        break;
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px',
        padding: '20px',
        backgroundColor: '#f7f9fc',
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
        <DashboardCard title="Total Orders" value={data.totalOrders} bgColor="#4CAF50" onClick={() => handleCardClick('totalOrders')} />
        <DashboardCard title="Today's Orders" value={data.todayOrder.length} bgColor="#4CAF50" onClick={() => handleCardClick('todayOrder')} />
        <DashboardCard title="Today's Order Deliver" value={data.todayOrderDeliver} bgColor="#FFC107" onClick={() => handleCardClick('todayOrderDeliver')} />
        <DashboardCard title="Total Order Deliver" value={data.totalOrderDeliver} bgColor="#f44336" onClick={() => handleCardClick('totalOrderDeliver')} />
        <DashboardCard title="Pending Orders" value={data.pendingOrders} bgColor="#9C27B0" onClick={() => handleCardClick('pendingOrders')} />
        <DashboardCard title="All App Users" value={data.appUsers} bgColor="#607D8B" onClick={() => handleCardClick('appUsers')} />
        <DashboardCard title="All Products" value={data.totalProducts} bgColor="#2196F3" onClick={() => handleCardClick('totalProducts')} />
        <DashboardCard title="Out Of Stock Products" value={data.outOfStock} bgColor="#FF5722" onClick={() => handleCardClick('outOfStockProducts')} />
        <DashboardCard title="Total Delivery Persons" value={data.deliveryPersons} bgColor="#9C27B0" onClick={() => handleCardClick('deliveryPersons')} />
      </div>
    </div>
  );
}

export default Dashboard;
