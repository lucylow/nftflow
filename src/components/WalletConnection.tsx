import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi';
import { MetaMaskConnector, WalletConnectConnector } from 'wagmi/connectors';

export const WalletConnection: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const [showModal, setShowModal] = useState(false);
  const [networkError, setNetworkError] = useState('');
  const [balance, setBalance] = useState('0.00');

  // Check if connected to the right network (Somnia)
  useEffect(() => {
    if (chain && chain.id !== 50312) { // Somnia Testnet chain ID
      setNetworkError('Please switch to Somnia Network');
    } else {
      setNetworkError('');
    }
  }, [chain]);

  // Mock balance fetching - in real app, this would fetch actual balance
  useEffect(() => {
    if (isConnected && address) {
      // Simulate balance fetching
      setBalance('1.25');
    }
  }, [isConnected, address]);

  const handleConnect = (connector: any) => {
    connect({ connector });
    setShowModal(false);
  };

  const handleSwitchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xc4a8' }], // 50312 in hex
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xc4a8',
                chainName: 'Somnia Testnet',
                rpcUrls: ['https://dream-rpc.somnia.network/'],
                nativeCurrency: {
                  name: 'Somnia Token',
                  symbol: 'STT',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add Somnia network:', addError);
        }
      }
    }
  };

  if (isConnected && address) {
    return (
      <div className="connected-wallet">
        <div className="wallet-info">
          <span className="balance">{balance} STT</span>
          <span className="address">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        {networkError && (
          <button onClick={handleSwitchNetwork} className="switch-network-btn">
            Switch Network
          </button>
        )}
        <button onClick={() => disconnect()} className="disconnect-btn">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="connect-btn">
        Connect Wallet
      </button>
      
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect Wallet</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="close-btn"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            {networkError && (
              <div className="error-banner">
                <span>⚠️ {networkError}</span>
                <button onClick={handleSwitchNetwork} className="switch-btn">
                  Switch to Somnia
                </button>
              </div>
            )}
            
            <div className="wallet-options">
              <h3>Choose your wallet</h3>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  className="wallet-option"
                  disabled={!connector.ready}
                >
                  <div className="wallet-icon">
                    {connector.name === 'MetaMask' && '🦊'}
                    {connector.name === 'WalletConnect' && '🔗'}
                    {connector.name === 'Coinbase Wallet' && '🔵'}
                  </div>
                  <div className="wallet-details">
                    <span className="wallet-name">{connector.name}</span>
                    <span className="wallet-status">
                      {connector.ready ? 'Ready' : 'Not Available'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            
            {error && (
              <div className="error-message">
                <span>❌ {error.message}</span>
              </div>
            )}
            
            <div className="modal-footer">
              <p className="help-text">
                New to Web3? <a href="#" target="_blank" rel="noopener noreferrer">Learn more about wallets</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
