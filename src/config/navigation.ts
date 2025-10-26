export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  description?: string;
  category?: 'primary' | 'features' | 'user' | 'advanced';
}

export const navigationConfig: NavItem[] = [
  // PRIMARY NAVIGATION - Core features
  { 
    label: 'Home', 
    href: '/', 
    icon: '🏠', 
    description: 'Welcome to NFTFlow',
    category: 'primary'
  },
  { 
    label: 'Marketplace', 
    href: '/marketplace', 
    icon: '🏪', 
    description: 'Browse and trade NFTs',
    category: 'primary'
  },
  { 
    label: 'Create NFT', 
    href: '/creativity', 
    icon: '🎨', 
    badge: 'New',
    description: 'Create and mint your NFTs',
    category: 'primary'
  },
  { 
    label: 'Upload', 
    href: '/upload', 
    icon: '📤', 
    description: 'Upload NFT assets',
    category: 'primary'
  },
  { 
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: '📊', 
    description: 'Your portfolio overview',
    category: 'primary'
  },

  // FEATURES - Advanced functionality
  { 
    label: 'AI Agents', 
    href: '/ai-agents', 
    icon: '🤖', 
    badge: 'AI',
    description: 'Autonomous AI agents for NFT rentals',
    category: 'features'
  },
  { 
    label: 'NFT Rental', 
    href: '/rental', 
    icon: '🔄', 
    description: 'Rent NFTs and earn passive income',
    category: 'features'
  },
  { 
    label: 'Analytics', 
    href: '/analytics', 
    icon: '📈', 
    description: 'Market analytics and insights',
    category: 'features'
  },
  { 
    label: 'Community', 
    href: '/community', 
    icon: '👥', 
    description: 'Connect with creators and collectors',
    category: 'features'
  },

  // USER - Account management
  { 
    label: 'Profile', 
    href: '/profile', 
    icon: '👤', 
    description: 'User profile management',
    category: 'user'
  },
  { 
    label: 'Wallet', 
    href: '/wallet', 
    icon: '💳', 
    description: 'Wallet management',
    category: 'user'
  },

  // ADVANCED - Developer and admin tools
  { 
    label: 'DAO Governance', 
    href: '/dao', 
    icon: '🏛️', 
    description: 'Decentralized governance',
    category: 'advanced'
  },
  { 
    label: 'Governance', 
    href: '/governance', 
    icon: '👑', 
    description: 'Community governance tools',
    category: 'advanced'
  },
  { 
    label: 'Somnia Integration', 
    href: '/somnia', 
    icon: '⚡', 
    description: 'Somnia network integration',
    category: 'advanced'
  },
  { 
    label: 'Subgraph', 
    href: '/subgraph', 
    icon: '🗄️', 
    description: 'Blockchain data indexing',
    category: 'advanced'
  },
  { 
    label: 'Social', 
    href: '/social', 
    icon: '🌟', 
    description: 'Social features and community',
    category: 'advanced'
  },
  { 
    label: 'Discover', 
    href: '/discover', 
    icon: '🔍', 
    description: 'Discover new NFTs and creators',
    category: 'advanced'
  }
];

export const getNavItemsByCategory = (category: NavItem['category']) => {
  return navigationConfig.filter(item => item.category === category);
};

export const getPrimaryNavItems = () => getNavItemsByCategory('primary');
export const getFeatureNavItems = () => getNavItemsByCategory('features');
export const getUserNavItems = () => getNavItemsByCategory('user');
export const getAdvancedNavItems = () => getNavItemsByCategory('advanced');

// Legacy helpers for compatibility
export const getMainNavItems = () => getPrimaryNavItems();
export const getToolNavItems = () => getAdvancedNavItems();
export const getAdditionalNavItems = () => getAdvancedNavItems();
