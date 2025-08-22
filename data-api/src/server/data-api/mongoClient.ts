import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function getDatabase(databaseName: string): Promise<Db> {
  const mongoClient = await getMongoClient();
  return mongoClient.db(databaseName);
}

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
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