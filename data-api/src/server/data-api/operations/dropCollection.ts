import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface DropCollectionRequest {
  dataSource: string;
  database: string;
  collection: string;
}

interface DropCollectionResponse {
  ok: number;
}

export async function dropCollection(params: RouteParams): Promise<RouteResponse<DropCollectionResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection } = params.body as DropCollectionRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    // Connect to MongoDB and get database
    const db = await getDatabase(database);

    // Drop the collection
    const result = await db.dropCollection(collection);

    return {
      data: {
        ok: result ? 1 : 0
      }
    };
  });
}