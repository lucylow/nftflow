import axios from "axios";

const SUBGRAPH_URL = process.env.SUBGRAPH_URL || "";

export interface Rental {
  id: string;
  renter: string;
  lender: string;
  tokenId: string;
  collection: string;
  duration: number;
  pricePerSecond: string;
  timestamp: number;
}

export const queryRecentRentals = async (limit = 50): Promise<Rental[]> => {
  if (!SUBGRAPH_URL) {
    console.warn("⚠️ SUBGRAPH_URL not set - returning empty rentals");
    return [];
  }

  try {
    const q = `
      query($limit: Int) {
        rentals(first: $limit, orderBy: timestamp, orderDirection: desc) {
          id 
          renter 
          lender 
          tokenId 
          collection 
          duration 
          pricePerSecond 
          timestamp
        }
      }
    `;
    
    const res = await axios.post(SUBGRAPH_URL, { 
      query: q, 
      variables: { limit } 
    });
    
    return res.data.data?.rentals || [];
  } catch (err) {
    console.error("Subgraph query error:", err);
    return [];
  }
};

export const queryUserRentals = async (userAddress: string): Promise<Rental[]> => {
  if (!SUBGRAPH_URL) {
    return [];
  }

  try {
    const q = `
      query($user: String!) {
        rentals(where: { renter: $user }, orderBy: timestamp, orderDirection: desc) {
          id renter lender tokenId collection duration pricePerSecond timestamp
        }
      }
    `;
    
    const res = await axios.post(SUBGRAPH_URL, { 
      query: q, 
      variables: { user: userAddress.toLowerCase() } 
    });
    
    return res.data.data?.rentals || [];
  } catch (err) {
    console.error("Subgraph query error:", err);
    return [];
  }
};

