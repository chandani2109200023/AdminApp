import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UploadItem from './components/UploadItem';
import Sidebar from './components/Sidebar';
import ItemList from './components/ItemList';
import Dashboard from './components/Dashboard';  // Import your Dashboard component
import TodayOrdersPage from './pages/todarOrder';
import ImageUploadPage from './pages/imageManagement';
import TotalOrderDeliverPage from './pages/totaldeliver';
import WarehouseManagement from './pages/wareHouseManagement';
import BulkUploadProducts from './pages/bulkUpload';
import './App.css';
import Login from './components/Login';
import { ItemProvider } from './ItemContext';
import AllProductsPage from './pages/AllProducts';
import PendingOrdersPage from './pages/PendingOrdersPage';
import TodayOrderDeliverPage from './pages/TodayOrderDeliver';
import AppUsersPage from './pages/appUsers';
import DeliveryPersons from './pages/deliverPersons';
import TotalOrderPage from './pages/totalOrder';
import OutOfStockProducts from './pages/outOfStock';
import CouponManagementPage from './pages/couponManagement';

const App = () => (
  <ItemProvider> {/* Wrap everything with the provider */}
    <Router>
      <div className="container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bulk" element={<BulkUploadProducts />} />
            <Route path="/upload" element={<UploadItem />} />
            <Route path="/items" element={<ItemList />} />
            <Route path="/deliveryPersons" element={<DeliveryPersons />} />
            <Route path="/today-orders" element={<TodayOrdersPage />} />
            <Route path="/all-products" element={<AllProductsPage />} />
            <Route path="/total-order" element={<TotalOrderPage />} />
            <Route path="/today-order-deliver" element={<TodayOrderDeliverPage />} />
            <Route path="/app-users" element={<AppUsersPage />} />
            <Route path="/total-order-deliver" element={<TotalOrderDeliverPage />} />
            <Route path="/pending-orders" element={<PendingOrdersPage />} />
            <Route path="/outOfStock" element={<OutOfStockProducts />} />
            <Route path="/coupons" element={<CouponManagementPage />} />
            <Route path="/product/:variantId/images" element={<ImageUploadPage />} />
            <Route path="/warehouses" element={<WarehouseManagement />} />
          </Routes>
        </div>
      </div>
    </Router>
  </ItemProvider>
);

export default App;
