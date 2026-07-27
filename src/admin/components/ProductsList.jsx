import { useEffect, useState } from 'react';
import '../styles/AdminPanel.css';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // Tracks clicked product
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/products');
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
        } else {
          setError('Failed to load products.');
        }
      } catch (err) {
        console.log("Server connection failed.",err)
        setError('Server connection failed.');
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="admin-table-container">
      {error && <p style={{ color: 'red', padding: '15px' }}>{error}</p>}
      
      {/* Master Products Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Original Price</th>
            <th>Offer Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                ₹{product.original_price}
              </td>
              <td style={{ fontWeight: 'bold', color: '#16a34a' }}>
                ₹{product.offer_price}
              </td>
              <td>
                <button 
                  className="action-btn" 
                  title="View Product"
                  onClick={() => setSelectedProduct(product)} // Opens the modal
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Product Details Modal Block */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>Close</button>
            <div className="modal-header">Product Details</div>
            
            <div className="modal-section">
              <h4>{selectedProduct.name}</h4>
              <p><strong>Product ID:</strong> #{selectedProduct.id}</p>
              <p><strong>Category:</strong> {selectedProduct.category}</p>
            </div>

            <div className="modal-section">
              <h4>Pricing Info</h4>
              <p style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
                <strong>Original Price:</strong> ₹{selectedProduct.original_price}
              </p>
              <p style={{ fontWeight: 'bold', color: '#16a34a', fontSize: '1.2rem', marginTop: '5px' }}>
                <strong>Offer Price:</strong> ₹{selectedProduct.offer_price}
              </p>
              <p style={{ marginTop: '10px', color: '#475569', fontSize: '0.9rem' }}>
                <strong>Discount:</strong> ₹{(selectedProduct.original_price - selectedProduct.offer_price).toFixed(2)} saved!
              </p>
            </div>

            <div className="modal-section">
              <h4>System Data</h4>
              <p><strong>Added to catalog:</strong> {new Date(selectedProduct.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}