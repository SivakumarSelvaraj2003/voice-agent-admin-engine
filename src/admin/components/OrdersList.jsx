import { useEffect, useState } from 'react';
import '../styles/AdminPanel.css';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/orders');
        const data = await response.json();
        if (data.success) setOrders(data.orders);
        else setError('Failed to load orders.');
      } catch (err) {
        console.log('server connection failed',err)
        setError('Server connection failed.');
      }
    };
    fetchOrders();
  }, []);

  // Put this right above the 'return ('
  const handleStatusChange = async (orderId, newStatus) => {
    try {
     const response = await fetch('http://localhost:3000/api/admin/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const data = await response.json();
      
      if (data.success) {
        // Instantly update the React state so the UI changes without refreshing
        setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
        alert(`Order #${orderId} updated to ${newStatus}`);
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert('Server connection failed while updating.');
    }
  };

  return (
    <div className="admin-table-container">
      {error && <p style={{ color: 'red', padding: '15px' }}>{error}</p>}
      
      {/* Master Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.customer_name}</td>
              <td>{order.order_date.split(' ')[0]}</td>
              <td style={{ fontWeight: 'bold' }}>₹{order.total_amount}</td>
              <td>
                <select 
                  value={order.order_status} 
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={`badge ${order.order_status}`}
                  style={{ cursor: 'pointer', padding: '5px' }}
                >
                  <option value="placed">placed</option>
                  <option value="shipped">shipped</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
              <td>
                <button 
                  className="action-btn" 
                  title="View Details"
                  onClick={() => setSelectedOrder(order)}
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

      {/* Detail Modal Block */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          {/* Prevent clicks inside the modal from closing it */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedOrder(null)}>Close</button>
            <div className="modal-header">Order #{selectedOrder.id} Details</div>
            
            <div className="modal-section">
              <h4>Customer Info</h4>
              <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
              <p><strong>Phone:</strong> {selectedOrder.phone_number}</p>
              <p><strong>Address:</strong> {selectedOrder.address_text}</p>
            </div>

            <div className="modal-section">
              <h4>Timeline</h4>
              <p><strong>Placed:</strong> {selectedOrder.order_date}</p>
              {selectedOrder.shipped_date && <p><strong>Shipped:</strong> {selectedOrder.shipped_date}</p>}
              {selectedOrder.expected_delivery_date && <p><strong>Expected Delivery:</strong> {selectedOrder.expected_delivery_date}</p>}
              {selectedOrder.cancelled_date && <p style={{ color: 'red' }}><strong>Cancelled:</strong> {selectedOrder.cancelled_date}</p>}
            </div>

            <div className="modal-section">
              <h4>Order Items</h4>
              <table className="admin-table" style={{ fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Item Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.item_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 style={{ textAlign: 'right', marginTop: '15px' }}>Grand Total: ₹{selectedOrder.total_amount}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}