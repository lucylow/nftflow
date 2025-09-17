import React from 'react';

export default function Dashboard() {
  console.log('Dashboard component is rendering');

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1e293b', 
      color: 'white', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Dashboard - Working!</h1>
      <p>This is the Dashboard page. Navigation is working correctly!</p>
      <div style={{ 
        backgroundColor: '#334155', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Success!</h2>
        <ul>
          <li>✅ Dashboard component rendered</li>
          <li>✅ Navigation working</li>
          <li>✅ Route matching working</li>
          <li>✅ No syntax errors</li>
        </ul>
      </div>
    </div>
  );
}
