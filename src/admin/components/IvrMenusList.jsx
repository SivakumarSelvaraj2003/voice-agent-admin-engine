import { useEffect, useState, useCallback } from 'react';
import '../styles/AdminPanel.css';

export default function IvrMenusList() {
  const [menus, setMenus] = useState([]);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ digit: '', label: '', message: '', action_type: '', is_active: true });
  const [editId, setEditId] = useState(null);

// 1. The perfectly compliant useCallback function
  const fetchMenus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/ivr');
      const data = await response.json();
      if (data.success) {
        setMenus(data.menus);
      }
    } catch (err) {
        console.log(err)
      setError('Server connection failed.');
    }
  }, [setMenus, setError]); // <-- We added the state setters here!

  // 2. The perfectly compliant useEffect
useEffect(() => {
  async function load() {
    await fetchMenus();
  }

  load();
}, [fetchMenus]); // <-- The linter now accepts this perfectly.

  const handleAddNew = () => {
    setFormData({ digit: '', label: '', message: '', action_type: '', is_active: true });
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (menu) => {
    setFormData({ digit: menu.digit, label: menu.label, message: menu.message, action_type: menu.action_type, is_active: menu.is_active });
    setEditId(menu.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId ? `http://localhost:3000/api/admin/ivr/${editId}` : 'http://localhost:3000/api/admin/ivr';
    const method = editId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        setIsModalOpen(false);
        fetchMenus();
      } else {
        alert(data.message);
      }
    } catch (err) {
        console.log(err)
      alert('Error saving menu.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu option?")) {
      try {
        await fetch(`http://localhost:3000/api/admin/ivr/${id}`, { method: 'DELETE' });
        fetchMenus();
      } catch (err) {
        console.log(err)
        alert('Error deleting menu.');
      }
    }
  };

  return (
    <div className="admin-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #eee' }}>
        <h2 style={{ margin: 0, color: '#334155' }}>Voice Routing (IVR)</h2>
        <button onClick={handleAddNew} style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          + Add Option
        </button>
      </div>

      {error && <p style={{ color: 'red', padding: '15px' }}>{error}</p>}
      
      <table className="admin-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>Label</th>
            <th>System Action</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menus.map((menu) => (
            <tr key={menu.id}>
              <td style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{menu.digit}</td>
              <td>{menu.label}</td>
              <td><span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>{menu.action_type}</span></td>
              <td>
                <span className={`badge ${menu.is_active ? 'delivered' : 'cancelled'}`}>
                  {menu.is_active ? 'Active' : 'Disabled'}
                </span>
              </td>
              <td style={{ display: 'flex', gap: '10px' }}>
                <button className="action-btn" onClick={() => handleEdit(menu)} style={{ color: '#0ea5e9' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button className="action-btn" onClick={() => handleDelete(menu.id)} style={{ color: '#ef4444' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>X</button>
            <div className="modal-header">{editId ? 'Edit Menu Option' : 'Add New Menu Option'}</div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Phone Key (Digit)</label>
                <input type="text" value={formData.digit} onChange={(e) => setFormData({...formData, digit: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Label (For Admin)</label>
                <input type="text" value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>System Action Tag</label>
                <input type="text" value={formData.action_type} onChange={(e) => setFormData({...formData, action_type: e.target.value})} required placeholder="e.g., check_order" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Voice Message (What the AI says)</label>
                <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required rows="3" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                <label style={{ fontWeight: 'bold' }}>Active (Enable this option)</label>
              </div>

              <button type="submit" style={{ background: '#16a34a', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                {editId ? 'Save Changes' : 'Create Option'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}