import { getConfig } from 'modelence/server';
import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;
let currentUri: string = '';

export async function getMongoClient(): Promise<MongoClient> {
  const uri = getConfig('_system.mongodbUri') as string;
  
  // Check if URI has changed or if client doesn't exist
  if (!client || currentUri !== uri) {
    // Close existing connection if it exists
    if (client) {
      try {
        await client.close();
        console.log('Closing existing MongoDB connection due to URI change or connection issue');
      } catch (error) {
        console.error('Error closing existing connection:', error);
      }
    }
    
    // Create new connection
    try {
      console.log('Connecting to MongoDB with URI:', uri);
      client = new MongoClient(uri);
      await client.connect();
      currentUri = uri;
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      client = null;
      currentUri = '';
      throw error;
    }
  }
  
  return client;
}

export async function getDatabase(databaseName: string) {
  const mongoClient = await getMongoClient();
  return mongoClient.db(databaseName);
}

export async function closeConnection(): Promise<void> {
  if (client) {
    try {
      await client.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    } finally {
      client = null;
      currentUri = '';
    }
  }
}

export async function refreshConnection(): Promise<void> {
  console.log('Manually refreshing MongoDB connection...');
  if (client) {
    try {
      await client.close();
      console.log('Existing connection closed');
    } catch (error) {
      console.error('Error closing existing connection:', error);
    }
  }
  client = null;
  currentUri = '';
  // Next call to getMongoClient will create a new connection
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});