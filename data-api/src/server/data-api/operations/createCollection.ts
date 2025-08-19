import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../db';
import { ErrorResponse } from '../utils';

interface CreateCollectionRequest {
  dataSource: string;
  database: string;
  collection: string;
}

interface CreateCollectionResponse {
  ok: number;
}

export async function createCollection(params: RouteParams): Promise<RouteResponse<CreateCollectionResponse | ErrorResponse>> {
  try {
    const { dataSource, database, collection } = params.body as CreateCollectionRequest;

    // Validate required fields
    if (!dataSource || !database || !collection) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection",
          error_code: "InvalidParameter"
        }
      };
    }

    // Validate collection name
    if (collection.includes('$') || collection.startsWith('system.')) {
      return {
        status: 400,
        data: {
          error: "Invalid collection name: cannot contain '$' or start with 'system.'",
          error_code: "InvalidParameter"
        }
      };
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