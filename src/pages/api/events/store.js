// src/pages/api/events/store.js
import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const eventData = req.body;
    
    // Validate event data
    if (!eventData.event || !eventData.contract || !eventData.blockNumber) {
      return res.status(400).json({ error: 'Invalid event data' });
    }

    // Store event in database (replace with your database implementation)
    const storedEvent = await storeEventInDatabase(eventData);
    
    res.status(200).json({ 
      success: true, 
      eventId: storedEvent.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error storing event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function storeEventInDatabase(eventData) {
  // This is a placeholder implementation
  // Replace with your actual database storage logic
  
  const event = {
    id: generateEventId(),
    event: eventData.event,
    contract: eventData.contract,
    blockNumber: eventData.blockNumber,
    transactionHash: eventData.transactionHash,
    data: eventData,
    timestamp: new Date().toISOString(),
    createdAt: new Date()
  };

  // Example: Store in MongoDB, PostgreSQL, or other database
  // await db.events.insertOne(event);
  
  console.log('Stored event:', event.id, event.event);
  
  return event;
}

function generateEventId() {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
