import { useEffect, useState } from 'react';
import '../styles/AdminPanel.css';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Tracks clicked user
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/users');
        const data = await response.json();
        
        if (data.success) {
          setUsers(data.users);
        } else {
          setError('Failed to load users.');
        }
      } catch (err) {
        console.log('Server connection failed.',err)
        setError('Server connection failed.');
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="admin-table-container">
      {error && <p style={{ color: 'red', padding: '15px' }}>{error}</p>}
      
      {/* Master User Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Joined</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.phone_number}</td>
              <td>{user.join_date}</td>
              <td>
                <button 
                  className="action-btn" 
                  title="View User"
                  onClick={() => setSelectedUser(user)} // Opens the modal
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

      {/* User Details Modal Block */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedUser(null)}>Close</button>
            <div className="modal-header">User Profile: {selectedUser.name}</div>
            
            <div className="modal-section">
              <h4>Account Details</h4>
              <p><strong>User ID:</strong> #{selectedUser.id}</p>
              <p><strong>Phone Number:</strong> {selectedUser.phone_number}</p>
              <p><strong>Member Since:</strong> {selectedUser.join_date}</p>
            </div>

            <div className="modal-section">
              <h4>Saved Addresses</h4>
              {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#334155' }}>
                  {selectedUser.addresses.map(addr => (
                    <li key={addr.id}>
                      {addr.address_text} 
                      {addr.is_default ? <span className="badge placed" style={{ marginLeft: '10px' }}>Default</span> : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#94a3b8' }}>No addresses saved yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}