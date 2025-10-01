import { getConfig } from 'modelence/server';
import { VoyageAIClient } from 'voyageai';

let voyageClient: VoyageAIClient | null = null;

export function getVoyageClient() {
  if (!voyageClient) {
    const apiKey = getConfig('voyage.apiKey') as string || process.env.VOYAGE_API_KEY;
    if (!apiKey) {
      throw new Error('VOYAGE_API_KEY environment variable is not set');
    }
    voyageClient = new VoyageAIClient({ apiKey });
  }
  return voyageClient;
}

export async function generateEmbedding(text: string, inputType: 'query' | 'document' = 'document'): Promise<number[]> {
  const client = getVoyageClient();
  const result = await client.embed({
    input: [text],
    model: 'voyage-3-large',
    inputType,
  });

  return result.data?.[0].embedding || [];
}

export async function generateEmbeddings(texts: string[], inputType: 'query' | 'document' = 'document'): Promise<number[][]> {
  const client = getVoyageClient();
  const result = await client.embed({
    input: texts,
    model: 'voyage-3-large',
    inputType,
  });

  return result.data?.filter(item => item.embedding).map(item => item.embedding || []) || [];
}