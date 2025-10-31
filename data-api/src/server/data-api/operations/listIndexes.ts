import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface ListIndexesRequest {
  dataSource: string;
  database: string;
  collection: string;
}

interface IndexInfo {
  v: number;
  key: Record<string, any>;
  name: string;
  unique?: boolean;
  sparse?: boolean;
  expireAfterSeconds?: number;
}

interface ListIndexesResponse {
  indexes: IndexInfo[];
}

export async function listIndexes(params: RouteParams): Promise<RouteResponse<ListIndexesResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection } = params.body as ListIndexesRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // List all indexes
    const indexes = await col.indexes();

    return {
      data: {
        indexes
      }
    };
  });
}