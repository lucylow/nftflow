import React from 'react';

const AppTestSimple = () => {
  console.log('🧪 AppTestSimple: Starting simple test...');
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉 NFTFlow Test</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Simple test is working!</p>
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <p>✅ React is rendering</p>
          <p>✅ Components are working</p>
          <p>✅ Styling is applied</p>
        </div>
        <button 
          onClick={() => {
            console.log('🎯 Button clicked!');
            alert('Button works!');
          }}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default AppTestSimple;
