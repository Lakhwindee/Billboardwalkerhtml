import React from 'react';

export default function Dashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Login successful! Welcome to IamBillboard dashboard.</p>
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={() => {
            fetch('/api/logout', { method: 'POST', credentials: 'include' })
              .then(() => window.location.href = '/');
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}