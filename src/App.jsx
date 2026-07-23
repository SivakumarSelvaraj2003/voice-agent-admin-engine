import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Home from './components/Home';
import Help from './components/Help';
import Login from './admin/components/Login';

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
      </Routes>
    </Router>
  );
}