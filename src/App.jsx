import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Home from './components/Home';
import Help from './components/Help';
import Login from './admin/components/Login';
import AdminLayout from './admin/components/AdminLayout';
import UsersList from './admin/components/UsersList';
import ProductsList from './admin/components/ProductsList';
import OrdersList from './admin/components/OrdersList';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC BLOCK: Everything inside here gets the Navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/help" element={<Help />} />
        </Route>

        {/* ADMIN BLOCK: Completely isolated, no Navbar will render here */}
        <Route path="/admin" element={<Login />} /> 
        {/* SECURE ADMIN DASHBOARD */}
        <Route path="/admin-panel" element={<AdminLayout />}>
          {/* This renders inside the Outlet of AdminLayout */}
          <Route path="users" element={<UsersList />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="orders" element={<OrdersList />} />
        </Route>
      </Routes>
    </Router>
  );
}