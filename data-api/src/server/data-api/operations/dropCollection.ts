import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../db';
import { ErrorResponse } from '../utils';

interface DropCollectionRequest {
  dataSource: string;
  database: string;
  collection: string;
}

interface DropCollectionResponse {
  ok: number;
}

export async function dropCollection(params: RouteParams): Promise<RouteResponse<DropCollectionResponse | ErrorResponse>> {
  try {
    const { dataSource, database, collection } = params.body as DropCollectionRequest;

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

    // Connect to MongoDB and get database
    const db = await getDatabase(database);

    // Drop the collection
    const result = await db.dropCollection(collection);

    return {
      data: {
        ok: result ? 1 : 0
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