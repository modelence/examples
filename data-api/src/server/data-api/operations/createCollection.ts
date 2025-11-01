import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface CreateCollectionRequest {
  dataSource: string;
  database: string;
  collection: string;
}

interface CreateCollectionResponse {
  ok: number;
}

export async function createCollection(params: RouteParams): Promise<RouteResponse<CreateCollectionResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection } = params.body as CreateCollectionRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    // Validate collection name
    if (collection.includes('$') || collection.startsWith('system.')) {
      throw new ValidationError("Invalid collection name: cannot contain '$' or start with 'system.'");
    }

    // Connect to MongoDB and get database
    const db = await getDatabase(database);

    // Create the collection
    await db.createCollection(collection);

    return {
      data: {
        ok: 1
      }
    };
  });
}