#!/usr/bin/env ts-node

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const db = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await db.connect();
    console.log('Connected to database');

    // Create migrations table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../database/migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found, creating schema...');
      await runSchema(db);
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Get already executed migrations
    const executedMigrations = await db.query('SELECT filename FROM migrations');
    const executedFilenames = executedMigrations.rows.map(row => row.filename);

    // Run pending migrations
    for (const filename of migrationFiles) {
      if (executedFilenames.includes(filename)) {
        console.log(`Skipping already executed migration: ${filename}`);
        continue;
      }

      console.log(`Running migration: ${filename}`);
      
      const migrationPath = path.join(migrationsDir, filename);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      try {
        await db.query('BEGIN');
        await db.query(migrationSQL);
        await db.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
        await db.query('COMMIT');
        
        console.log(`Successfully executed migration: ${filename}`);
      } catch (error) {
        await db.query('ROLLBACK');
        console.error(`Failed to execute migration ${filename}:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await db.end();
  }
}

async function runSchema(db: Client) {
  console.log('Running initial schema...');
  
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error('Schema file not found');
  }

  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  
  try {
    await db.query('BEGIN');
    await db.query(schemaSQL);
    await db.query('COMMIT');
    
    console.log('Schema created successfully');
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Failed to create schema:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

export { runMigrations };
