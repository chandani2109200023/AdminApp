import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UploadItem from './components/UploadItem';
import Sidebar from './components/Sidebar';
import ItemList from './components/ItemList';
import Dashboard from './components/Dashboard';  // Import your Dashboard component
import './App.css';
import Login from './components/Login';
import { ItemProvider } from './ItemContext';

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
            <Route path="/upload" element={<UploadItem />} />
            <Route path="/items" element={<ItemList />} />
          </Routes>
        </div>
      </div>
    </Router>
  </ItemProvider>
);

export default App;
