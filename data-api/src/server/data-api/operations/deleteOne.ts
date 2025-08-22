import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse } from '../utils';

interface DeleteOneRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
}

interface DeleteOneResponse {
  deletedCount: number;
}

export async function deleteOne(params: RouteParams): Promise<RouteResponse<DeleteOneResponse | ErrorResponse>> {
  try {
    const { dataSource, database, collection, filter } = params.body as DeleteOneRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !filter) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, filter",
          error_code: "InvalidParameter"
        }
      };
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Delete one document
    const result = await col.deleteOne(processedFilter);

    return {
      data: {
        deletedCount: result.deletedCount
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