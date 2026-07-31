import { useEffect, useState } from 'react';

export default function Settings() {
  const [users, setUsers] = useState([]);
  const [activePhone, setActivePhone] = useState('');
  const [message, setMessage] = useState('');

  // Fetch users when the page loads
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/admin/settings/users');
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
          setActivePhone(data.currentActive);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, []);

  // Save the selected phone number
  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/settings/set-test-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: activePhone })
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`Successfully set test phone to: ${data.activePhone}`);
        setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
      }
    } catch (err) {
      console.error('Update failed', err);
      setMessage('Failed to update phone number.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Testing Configuration</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Select a user below to simulate their phone number during IVR calls.
      </p>

      {/* Nav Pills Container */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
        {users.map((user) => (
          <div 
            key={user.id}
            onClick={() => setActivePhone(user.phone_number)}
            style={{
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              border: '2px solid #007bff',
              backgroundColor: activePhone === user.phone_number ? '#007bff' : '#fff',
              color: activePhone === user.phone_number ? '#fff' : '#007bff',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {user.name} <br/>
            <small style={{ fontWeight: 'normal' }}>{user.phone_number}</small>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSave}
        style={{
          padding: '10px 25px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Save Configuration
      </button>

      {message && <p style={{ marginTop: '15px', color: '#28a745', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}