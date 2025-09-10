import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseTabPersistenceOptions {
  defaultTab: string;
  paramName?: string;
  onTabChange?: (tab: string) => void;
}

export function useTabPersistence({ 
  defaultTab, 
  paramName = 'tab',
  onTabChange 
}: UseTabPersistenceOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get(paramName);
    return tabFromUrl || defaultTab;
  });

  useEffect(() => {
    const tabFromUrl = searchParams.get(paramName);
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, paramName, activeTab]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set(paramName, newTab);
      return newParams;
    });
    onTabChange?.(newTab);
  };

  return {
    activeTab,
    setActiveTab: handleTabChange,
  };
}
