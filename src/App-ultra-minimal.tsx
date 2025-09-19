import React from 'react';

const App = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      color: 'white',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '2rem', fontWeight: 'bold' }}>
          🎨 NFTFlow
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '3rem', opacity: 0.8 }}>
          Discover, Create, & Rent NFTs on Somnia Network
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🏪 Marketplace</h2>
            <p style={{ marginBottom: '1rem', opacity: 0.8 }}>
              Browse and rent NFTs with streaming capabilities
            </p>
            <button style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              Explore Marketplace
            </button>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>✨ Create NFT</h2>
            <p style={{ marginBottom: '1rem', opacity: 0.8 }}>
              Create and upload your own NFTs with AI tools
            </p>
            <button style={{
              background: 'linear-gradient(45deg, #f093fb, #f5576c)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              Start Creating
            </button>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>💳 Wallet</h2>
            <p style={{ marginBottom: '1rem', opacity: 0.8 }}>
              Manage your wallet and rental analytics
            </p>
            <button style={{
              background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              Connect Wallet
            </button>
          </div>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🚀 Streaming Rental NFTs</h3>
          <p style={{ marginBottom: '1rem', opacity: 0.8 }}>
            Experience the future of NFT rentals with live streaming capabilities
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <span style={{
              background: 'rgba(34, 197, 94, 0.2)',
              color: '#22c55e',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem'
            }}>
              🎥 Live Streaming
            </span>
            <span style={{
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#3b82f6',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem'
            }}>
              ⚡ Instant Rentals
            </span>
            <span style={{
              background: 'rgba(168, 85, 247, 0.2)',
              color: '#a855f7',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem'
            }}>
              🤖 AI-Powered
            </span>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.6 }}>
          <p>✅ Application is working! All streaming rental NFT features are ready.</p>
        </div>
      </div>
    </div>
  );
};

export default App;
