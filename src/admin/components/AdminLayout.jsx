// src/admin/components/AdminLayout.jsx
import { Outlet, Link } from 'react-router-dom';
import '../styles/AdminPanel.css';

export default function AdminLayout() {
  return (
    <div className="admin-dashboard">
      {/* Left Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Shop Admin</div>
        <nav className="admin-nav">
          <Link to="/admin-panel/users" className="admin-nav-link">Users</Link>
          <Link to="/admin-panel/products" className="admin-nav-link">Products</Link>
          <Link to="/admin-panel/orders" className="admin-nav-link">Orders</Link>
          <Link to="/admin-panel/ivr-menus" className="admin-nav-link">IVR Menus</Link>
          {/* You can add /orders or /settings here later! */}
        </nav>
      </aside>

      {/* Right Content Area */}
      <main className="admin-main-content">
        {/* Header */}
        <header className="admin-header">
          Admin Dashboard
        </header>
        
        {/* Dynamic Page Content goes here */}
        <div className="admin-content-area">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}