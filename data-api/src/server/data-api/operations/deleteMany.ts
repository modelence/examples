import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../db';
import { processFilter, ErrorResponse } from '../utils';

interface DeleteManyRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
}

interface DeleteManyResponse {
  deletedCount: number;
}

export async function deleteMany(params: RouteParams): Promise<RouteResponse<DeleteManyResponse | ErrorResponse>> {
  try {
    const { dataSource, database, collection, filter } = params.body as DeleteManyRequest;

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

    // Delete multiple documents
    const result = await col.deleteMany(processedFilter);

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