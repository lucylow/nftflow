#!/usr/bin/env ts-node

import { eventIngestService } from '../services/event-ingest';
import { workerService } from '../services/worker';

async function startServices() {
  console.log('Starting NFTFlow services...');

  try {
    // Start event ingestion service
    console.log('Starting event ingestion service...');
    await eventIngestService.start();

    // Start worker service
    console.log('Starting worker service...');
    await workerService.start();

    console.log('All services started successfully');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Received SIGINT, shutting down gracefully...');
      await eventIngestService.stop();
      await workerService.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      await eventIngestService.stop();
      await workerService.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start services:', error);
    process.exit(1);
  }
}

// Start services if this file is run directly
if (require.main === module) {
  startServices();
}

export { startServices };
