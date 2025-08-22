import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { ErrorResponse } from '../utils';

interface DropIndexRequest {
  dataSource: string;
  database: string;
  collection: string;
  index: string;
}

interface DropIndexResponse {
  nIndexesWas: number;
  ok: number;
}

export async function dropIndex(params: RouteParams): Promise<RouteResponse<DropIndexResponse | ErrorResponse>> {
  try {
    const { dataSource, database, collection, index } = params.body as DropIndexRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !index) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, index",
          error_code: "InvalidParameter"
        }
      };
    }

    // Validate index name
    if (index === '_id_') {
      return {
        status: 400,
        data: {
          error: "Cannot drop the _id_ index",
          error_code: "InvalidParameter"
        }
      };
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Count indexes before dropping
    const indexesBefore = await col.indexes();
    const nIndexesWas = indexesBefore.length;

    // Drop the specified index
    await col.dropIndex(index);

    return {
      data: {
        nIndexesWas,
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