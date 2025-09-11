// src/pages/api/analytics/update.js
import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const eventData = req.body;
    
    // Validate event data
    if (!eventData.event || !eventData.contract) {
      return res.status(400).json({ error: 'Invalid event data' });
    }

    // Update analytics based on event type
    const analyticsUpdate = await updateAnalyticsFromEvent(eventData);
    
    res.status(200).json({ 
      success: true, 
      analytics: analyticsUpdate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateAnalyticsFromEvent(eventData) {
  const analyticsUpdate = {
    timestamp: new Date().toISOString(),
    eventType: eventData.event,
    contract: eventData.contract,
    blockNumber: eventData.blockNumber
  };

  // Update different analytics based on event type
  switch (eventData.event) {
    case 'NFTListedForRent':
      analyticsUpdate.listings = {
        total: 1,
        pricePerSecond: parseFloat(eventData.pricePerSecondSOMI),
        duration: {
          min: parseInt(eventData.minDuration),
          max: parseInt(eventData.maxDuration)
        }
      };
      break;

    case 'NFTRented':
      analyticsUpdate.rentals = {
        total: 1,
        duration: parseInt(eventData.duration),
        totalPrice: parseFloat(eventData.totalPriceSOMI),
        collateral: parseFloat(eventData.collateralAmountSOMI),
        gasUsed: parseInt(eventData.gasUsed)
      };
      break;

    case 'RentalCompleted':
      analyticsUpdate.completions = {
        total: 1,
        totalPaid: parseFloat(eventData.totalPaidSOMI),
        successful: eventData.successful,
        gasUsed: parseInt(eventData.gasUsed)
      };
      break;

    case 'SOMIPaymentReceived':
      analyticsUpdate.payments = {
        total: 1,
        amount: parseFloat(eventData.amountSOMI),
        purpose: eventData.purpose,
        from: eventData.from,
        to: eventData.to
      };
      break;

    case 'StreamCreated':
      analyticsUpdate.streams = {
        total: 1,
        deposit: parseFloat(eventData.depositSOMI),
        ratePerSecond: parseFloat(eventData.ratePerSecondSOMI),
        duration: parseInt(eventData.stopTime) - parseInt(eventData.startTime),
        milestones: eventData.milestones?.length || 0
      };
      break;

    case 'StreamWithdrawn':
      analyticsUpdate.withdrawals = {
        total: 1,
        amount: parseFloat(eventData.amountSOMI),
        totalWithdrawn: parseFloat(eventData.totalWithdrawnSOMI),
        gasUsed: parseInt(eventData.gasUsed)
      };
      break;

    case 'MilestoneReached':
      analyticsUpdate.milestones = {
        total: 1,
        streamId: eventData.streamId,
        milestoneIndex: parseInt(eventData.milestoneIndex),
        amount: parseFloat(eventData.amountSOMI)
      };
      break;

    case 'ReputationUpdated':
      analyticsUpdate.reputation = {
        total: 1,
        user: eventData.user,
        score: parseInt(eventData.score),
        success: eventData.success,
        reason: eventData.reason
      };
      break;

    case 'UserVerified':
      analyticsUpdate.verifications = {
        total: 1,
        user: eventData.user
      };
      break;

    case 'NewBlock':
      analyticsUpdate.blocks = {
        total: 1,
        blockNumber: parseInt(eventData.blockNumber)
      };
      break;

    default:
      analyticsUpdate.unknown = {
        total: 1,
        event: eventData.event
      };
  }

  // Store analytics update (replace with your database implementation)
  await storeAnalyticsUpdate(analyticsUpdate);

  return analyticsUpdate;
}

async function storeAnalyticsUpdate(analyticsUpdate) {
  // This is a placeholder implementation
  // Replace with your actual database storage logic
  
  console.log('Analytics update:', analyticsUpdate);
  
  // Example: Store in time-series database, Redis, or other analytics storage
  // await analyticsDb.insertOne(analyticsUpdate);
  
  return analyticsUpdate;
}
