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
    model: 'voyage-3.5',
    inputType,
  });

  return result.data?.[0].embedding || [];
}

export async function generateEmbeddings(texts: string[], inputType: 'query' | 'document' = 'document'): Promise<number[][]> {
  const client = getVoyageClient();
  const result = await client.embed({
    input: texts,
    model: 'voyage-3.5',
    inputType,
  });

  return result.data?.filter(item => item.embedding).map(item => item.embedding || []) || [];
}

export async function rerank<T extends Record<string, any>>(results: T[], field: string, query: string) {
  const client = getVoyageClient();
  const rerankedResponse = await client.rerank({
    model: 'rerank-2.5',
    query: query,
    documents: results.map(doc => doc[field]),
    topK: 10,
  });

  // Map the reranked results back to the original documents
  return rerankedResponse.data?.map(rerankedDoc => {
    const index = rerankedDoc.index || 0;
    return {
      ...results[index],
      score: rerankedDoc.relevanceScore
    };
  }) || results;
}