import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface CreateIndexRequest {
  dataSource: string;
  database: string;
  collection: string;
  keys: Record<string, any>;
  options?: {
    name?: string;
    unique?: boolean;
    sparse?: boolean;
    expireAfterSeconds?: number;
    background?: boolean;
  };
}

interface CreateIndexResponse {
  createdCollectionAutomatically: boolean;
  numIndexesBefore: number;
  numIndexesAfter: number;
  ok: number;
}

export async function createIndex(params: RouteParams): Promise<RouteResponse<CreateIndexResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection, keys, options = {} } = params.body as CreateIndexRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    if (!keys) {
      throw new ValidationError("keys is required");
    }

    // Validate keys is an object
    if (typeof keys !== 'object' || Array.isArray(keys)) {
      throw new ValidationError("keys must be an object specifying field names and index directions");
    }

    // Validate index key values
    for (const [field, direction] of Object.entries(keys)) {
      if (direction !== 1 && direction !== -1 && direction !== '2d' && direction !== '2dsphere' && direction !== 'text' && direction !== 'hashed') {
        throw new ValidationError(`Invalid index direction for field '${field}': must be 1, -1, '2d', '2dsphere', 'text', or 'hashed'`);
      }
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Count indexes before creation
    const indexesBefore = await col.indexes();
    const numIndexesBefore = indexesBefore.length;

    // Create the index with options (including name if provided)
    await col.createIndex(keys, options);

    // Count indexes after creation
    const indexesAfter = await col.indexes();
    const numIndexesAfter = indexesAfter.length;

    return {
      data: {
        createdCollectionAutomatically: false,
        numIndexesBefore,
        numIndexesAfter,
        ok: 1
      }
    };
  });
}