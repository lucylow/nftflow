export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  description?: string;
  category?: 'main' | 'features' | 'user' | 'tools' | 'additional';
}

export const navigationConfig: NavItem[] = [
  // Main Navigation
  { 
    label: 'Home', 
    href: '/', 
    icon: '🏠', 
    description: 'Welcome to NFTFlow',
    category: 'main'
  },
  { 
    label: 'Marketplace', 
    href: '/marketplace', 
    icon: '🏪', 
    description: 'Browse and trade NFTs',
    category: 'main'
  },
  { 
    label: 'Create', 
    href: '/create', 
    icon: '✨', 
    badge: 'New',
    description: 'Create new NFTs',
    category: 'main'
  },
  { 
    label: 'Upload', 
    href: '/upload', 
    icon: '📤', 
    description: 'Upload NFT assets',
    category: 'main'
  },
  { 
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: '📊', 
    description: 'Your portfolio overview',
    category: 'main'
  },
  { 
    label: 'Analytics', 
    href: '/analytics', 
    icon: '📈', 
    description: 'Market analytics and insights',
    category: 'main'
  },

  // Feature Navigation
  { 
    label: 'DAO', 
    href: '/dao', 
    icon: '🏛️', 
    description: 'Decentralized governance',
    category: 'features'
  },
  { 
    label: 'Governance', 
    href: '/governance', 
    icon: '👑', 
    description: 'Community governance tools',
    category: 'features'
  },
  { 
    label: 'Creativity', 
    href: '/creativity', 
    icon: '🎨', 
    badge: 'Hot',
    description: 'Creative tools and showcase',
    category: 'features'
  },
  { 
    label: 'Subgraph', 
    href: '/subgraph', 
    icon: '🗄️', 
    description: 'Blockchain data indexing',
    category: 'features'
  },
  { 
    label: 'Social', 
    href: '/social', 
    icon: '👥', 
    description: 'Social features and community',
    category: 'features'
  },

  // User Navigation
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
  { 
    label: 'Somnia', 
    href: '/somnia', 
    icon: '⚡', 
    badge: 'New',
    description: 'Somnia network integration',
    category: 'user'
  },

  // Tool Navigation
  { 
    label: 'Wallet Test', 
    href: '/wallet-test', 
    icon: '🧪', 
    badge: 'Test',
    description: 'Wallet testing tools',
    category: 'tools'
  },
  { 
    label: 'Rental Flow', 
    href: '/rental', 
    icon: '🔄', 
    description: 'NFT rental marketplace',
    category: 'tools'
  },
  { 
    label: 'Mobile', 
    href: '/mobile', 
    icon: '📱', 
    description: 'Mobile-optimized interface',
    category: 'tools'
  },

  // Additional Navigation
  { 
    label: 'Discover', 
    href: '/discover', 
    icon: '🔍', 
    description: 'Discover new NFTs and creators',
    category: 'additional'
  },
  { 
    label: 'Community', 
    href: '/community', 
    icon: '🌟', 
    description: 'Community features and forums',
    category: 'additional'
  },
  { 
    label: 'Enhanced Marketplace', 
    href: '/enhanced-marketplace', 
    icon: '🛒', 
    description: 'Advanced marketplace features',
    category: 'additional'
  },
  { 
    label: 'Creativity Showcase', 
    href: '/creativity-showcase', 
    icon: '🎭', 
    description: 'Showcase creative works',
    category: 'additional'
  },
  { 
    label: 'Subgraph Dashboard', 
    href: '/subgraph-dashboard', 
    icon: '📊', 
    description: 'Subgraph analytics dashboard',
    category: 'additional'
  },
  { 
    label: 'Subgraph Showcase', 
    href: '/subgraph-showcase', 
    icon: '🎯', 
    description: 'Subgraph data showcase',
    category: 'additional'
  },
  { 
    label: 'Create & Upload', 
    href: '/create-and-upload', 
    icon: '🚀', 
    description: 'Combined create and upload flow',
    category: 'additional'
  },
  { 
    label: 'Wallet & Tools', 
    href: '/wallet-and-tools', 
    icon: '🔧', 
    description: 'Advanced wallet tools',
    category: 'additional'
  }
];

export const getNavItemsByCategory = (category: NavItem['category']) => {
  return navigationConfig.filter(item => item.category === category);
};

export const getMainNavItems = () => getNavItemsByCategory('main');
export const getFeatureNavItems = () => getNavItemsByCategory('features');
export const getUserNavItems = () => getNavItemsByCategory('user');
export const getToolNavItems = () => getNavItemsByCategory('tools');
export const getAdditionalNavItems = () => getNavItemsByCategory('additional');
