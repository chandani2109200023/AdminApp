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
    totalCoupons: 0,
    totalWarehouses: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTotalCoupons = async () => {
      try {
        const response = await fetch('https://apii.agrivemart.com/api/coupons/');
        const data = await response.json();
        setData((prev) => ({ ...prev, totalCoupons: data.length }));
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };
    const fetchWarehouses = async () => {
      try {
        const response = await fetch('https://apii.agrivemart.com/api/wareHouse/');
        const warehouses = await response.json();
        setData((prev) => ({ ...prev, totalWarehouses: warehouses.length }));
      } catch (error) {
        console.error('Error fetching warehouses:', error);
      };
    };
    const fetchTotalProducts = async () => {
      let page = 1;
      let allProducts = [];

      try {
        while (true) {
          const response = await fetch(`https://apii.agrivemart.com/api/user/products?page=${page}&limit=10000`);
          const { products, totalPages } = await response.json();
          allProducts = [...allProducts, ...products];

          if (page >= totalPages) break;
          page++;
        }

        const variantCount = allProducts.reduce((acc, p) => acc + p.variants.length, 0);
        const outOfStockCount = allProducts.filter(p =>
          p.variants.every(v => v.stock === 0)
        ).length;

        setData((prevData) => ({
          ...prevData,
          totalProducts: variantCount,
          outOfStock: outOfStockCount,
        }));
      } catch (error) {
        console.error('Error fetching all paginated products:', error);
      }
    };

    const fetchDeliveryPersons = async () => {
      try {
        const response = await fetch('https://apii.agrivemart.com/api/delivery/delivery-persons');
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
        const response = await fetch('https://apii.agrivemart.com/api/admin/users', {
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
        const response = await fetch('https://apii.agrivemart.com/api/delivery/orders');
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
    fetchTotalCoupons();
    fetchWarehouses();
  }, []);

  const handleCardClick = async(card) => {
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
      case 'totalCoupons':
        navigate('/coupons', { state: { data: data.totalCoupons } });
        break;
      case 'warehouses':
        navigate('/warehouses'); // 👈 route to warehouse management
        break;
      case 'bulk': // 👈 add this case
        navigate('/bulk');
        break;
       case 'addWarehouse':
      {
        const pincode = prompt("Enter warehouse pincode:");
        const location = prompt("Enter warehouse location:");
        const defaultStock = prompt("Enter default stock for all products (number):", "0");

        if (!pincode || !location) {
          alert("Pincode and location are required");
          return;
        }

        const token = localStorage.getItem('authToken');
        try {
          const response = await fetch('https://apii.agrivemart.com/api/admin/warehouses/add-and-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ pincode, location, defaultStock: Number(defaultStock) })
          });

          const result = await response.json();
          if (response.ok) {
            alert(`Warehouse added and products updated successfully!`);
            setData(prev => ({ ...prev, totalWarehouses: prev.totalWarehouses + 1 }));
          } else {
            alert(`Error: ${result.message}`);
          }
        } catch (err) {
          console.error("Error adding warehouse:", err);
          alert("Failed to add warehouse");
        }
      }
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
        <DashboardCard title="Coupons Management" value={data.totalCoupons} bgColor="#3F51B5" onClick={() => handleCardClick('totalCoupons')} />
        <DashboardCard
          title="Warehouses"
          value={data.totalWarehouses}
          bgColor="#795548"
          onClick={() => handleCardClick('warehouses')}
        />
        <DashboardCard
          title="Bulk Upload"
          value=""
          bgColor="#009688"
          onClick={() => handleCardClick('bulk')}
        />
        <DashboardCard
          title="Add New Warehouse & Update Stock of all Products"
          value=""
          bgColor="#FF9800"
          onClick={() => handleCardClick('addWarehouse')}
        />
      </div>
    </div>
  );
}

export default Dashboard;
