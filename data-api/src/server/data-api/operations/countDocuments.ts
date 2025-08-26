import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse } from '../utils';

interface CountDocumentsRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter?: Record<string, any>;
}

interface CountDocumentsResponse {
  count: number;
}

export async function countDocuments(params: RouteParams): Promise<RouteResponse<CountDocumentsResponse | ErrorResponse>> {
  try {
    const { dataSource, database, collection, filter = {} } = params.body as CountDocumentsRequest;

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

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Count documents matching the filter
    const count = await col.countDocuments(processedFilter);

    return {
      data: {
        count
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