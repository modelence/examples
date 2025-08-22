import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { ErrorResponse } from '../utils';

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
  try {
    const { dataSource, database, collection } = params.body as ListIndexesRequest;

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