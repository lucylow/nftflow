import { ethers } from 'ethers';

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  severity: 'info' | 'warning' | 'error';
}

export const mapContractError = (error: any): UserFriendlyError => {
  const errorMessage = error.message || error.toString();
  
  // Custom error patterns
  if (errorMessage.includes('InsufficientPayment')) {
    const matches = errorMessage.match(/InsufficientPayment\((\d+), (\d+)\)/);
    const required = matches ? ethers.utils.formatEther(matches[1]) : 'unknown';
    
    return {
      title: 'Insufficient Payment',
      message: `Please add more SOMI to your wallet. Required: ${required} SOMI`,
      action: 'Add Funds',
      actionUrl: '/wallet/fund',
      severity: 'error'
    };
  }
  
  if (errorMessage.includes('InvalidDuration')) {
    const matches = errorMessage.match(/InvalidDuration\((\d+), (\d+), (\d+)\)/);
    const min = matches ? formatDuration(parseInt(matches[1])) : 'unknown';
    const max = matches ? formatDuration(parseInt(matches[2])) : 'unknown';
    const provided = matches ? formatDuration(parseInt(matches[3])) : 'unknown';
    
    return {
      title: 'Invalid Rental Duration',
      message: `Duration must be between ${min} and ${max}. You entered: ${provided}`,
      action: 'Adjust Duration',
      severity: 'warning'
    };
  }
  
  if (errorMessage.includes('RentalNotFound')) {
    return {
      title: 'Rental Not Found',
      message: 'The rental you are trying to access does not exist or has been cancelled',
      severity: 'error'
    };
  }
  
  if (errorMessage.includes('UnauthorizedAccess')) {
    const matches = errorMessage.match(/UnauthorizedAccess\((.+?), (.+?)\)/);
    const caller = matches ? matches[1] : 'unknown';
    const required = matches ? matches[2] : 'unknown';
    
    return {
      title: 'Access Denied',
      message: `You don't have permission to perform this action. Required role: ${shortenAddress(required)}`,
      severity: 'error'
    };
  }
  
  if (errorMessage.includes('ProtocolPaused')) {
    return {
      title: 'Protocol Paused',
      message: 'The protocol is currently paused for maintenance. Please try again later',
      severity: 'info'
    };
  }
  
  // Default error
  return {
    title: 'Transaction Failed',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists',
    action: 'Retry',
    severity: 'error'
  };
};

// Helper functions
const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds} seconds`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
  return `${Math.floor(seconds / 86400)} days`;
};

const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
