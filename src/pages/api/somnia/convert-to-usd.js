// src/pages/api/somnia/convert-to-usd.js
import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    // Convert wei to SOMI
    const somiAmount = parseFloat(ethers.formatEther(amount));
    
    // Get SOMI to USD price from oracle
    const somiToUSD = await getSOMIUSDPrice();
    const usdAmount = somiAmount * somiToUSD;
    
    res.status(200).json({ 
      usdAmount: usdAmount.toFixed(2),
      somiAmount: somiAmount.toFixed(6),
      rate: somiToUSD,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error converting SOMI to USD:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSOMIUSDPrice() {
  try {
    // In production, use DIA oracle or other price feed
    // For now, we'll use a mock price that could come from an API
    
    // Option 1: Use DIA Oracle (if available)
    // const diaOracle = new ethers.Contract(DIA_ORACLE_ADDRESS, DIA_ABI, provider);
    // const price = await diaOracle.getValue("SOMI/USD");
    // return parseFloat(ethers.formatEther(price));
    
    // Option 2: Use external API
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=somnia&vs_currencies=usd', {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.somnia?.usd || 0.25; // Fallback to $0.25
    }
    
    // Option 3: Use cached price from database
    // const cachedPrice = await getCachedSOMIPrice();
    // if (cachedPrice && Date.now() - cachedPrice.timestamp < 60000) { // 1 minute cache
    //   return cachedPrice.price;
    // }
    
    // Fallback to fixed price
    return 0.25; // $0.25 per SOMI
  } catch (error) {
    console.error('Error fetching SOMI price:', error);
    return 0.25; // Fallback price
  }
}
