import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { mockNFTs, mockUserData } from '../data/mockData';

export const useDataAdapter = (moduleName: string) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMock, setIsUsingMock] = useState(true);
  const { account, isConnected, nftFlowContract } = useWeb3();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Try to fetch real data first
        if (isConnected && !isUsingMock && nftFlowContract) {
          // Real implementation would vary by module
          switch (moduleName) {
            case 'marketplace':
              try {
                // This would be a real contract call
                // const nftData = await nftFlowContract.getAllListedNFTs(0, 50);
                // setData(nftData || []);
                
                // For now, fallback to mock data
                setData(mockNFTs);
                setIsUsingMock(true);
              } catch (error) {
                console.error('Error fetching marketplace data:', error);
                setData(mockNFTs);
                setIsUsingMock(true);
              }
              break;
            case 'userProfile':
              if (account) {
                try {
                  // This would be a real contract call
                  // const userData = await nftFlowContract.getUserRentalHistory(account, 0, 20);
                  // setData(userData || []);
                  
                  // For now, fallback to mock data
                  setData([mockUserData]);
                  setIsUsingMock(true);
                } catch (error) {
                  console.error('Error fetching user data:', error);
                  setData([mockUserData]);
                  setIsUsingMock(true);
                }
              } else {
                setData([]);
              }
              break;
            default:
              setData(mockNFTs);
              setIsUsingMock(true);
          }
        } else {
          // Fallback to mock data
          switch (moduleName) {
            case 'marketplace':
              setData(mockNFTs);
              break;
            case 'userProfile':
              setData([mockUserData]);
              break;
            default:
              setData(mockNFTs);
          }
          setIsUsingMock(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data on error
        switch (moduleName) {
          case 'marketplace':
            setData(mockNFTs);
            break;
          case 'userProfile':
            setData([mockUserData]);
            break;
          default:
            setData(mockNFTs);
        }
        setIsUsingMock(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [moduleName, isConnected, account, isUsingMock, nftFlowContract]);

  return { data, isLoading, isUsingMock, setIsUsingMock };
};
