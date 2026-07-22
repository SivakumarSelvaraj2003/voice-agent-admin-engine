import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ padding: '1rem', background: '#333', color: 'white', display: 'flex', gap: '20px' }}>
      <h2>My Shop</h2>
      <div style={{ marginTop: '5px' }}>
        <Link to="/" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Home</Link>
        <Link to="/help" style={{ color: 'white', textDecoration: 'none' }}>Help</Link>
      </div>
    </nav>
  );
}   