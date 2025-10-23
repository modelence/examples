import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { ErrorResponse } from '../utils';

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
  try {
    const { dataSource, database, collection, keys, options = {} } = params.body as CreateIndexRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !keys) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, keys",
          error_code: "InvalidParameter"
        }
      };
    }

    // Validate keys is an object
    if (typeof keys !== 'object' || Array.isArray(keys)) {
      return {
        status: 400,
        data: {
          error: "keys must be an object specifying field names and index directions",
          error_code: "InvalidParameter"
        }
      };
    }

    // Validate index key values
    for (const [field, direction] of Object.entries(keys)) {
      if (direction !== 1 && direction !== -1 && direction !== '2d' && direction !== '2dsphere' && direction !== 'text' && direction !== 'hashed') {
        return {
          status: 400,
          data: {
            error: `Invalid index direction for field '${field}': must be 1, -1, '2d', '2dsphere', 'text', or 'hashed'`,
            error_code: "InvalidParameter"
          }
        };
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
  } catch (error) {
    return {
      status: 500,
      data: {
        error: error instanceof Error ? error.message : "Internal server error",
        error_code: "InternalServerError"
      }
    };
  }
}