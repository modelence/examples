import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../db';
import { processFilter, ErrorResponse } from '../utils';

interface FindOneRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter?: Record<string, any>;
  projection?: Record<string, any>;
}

interface FindOneResponse {
  document: Record<string, any> | null;
}


export async function findOne(params: RouteParams): Promise<RouteResponse<FindOneResponse | ErrorResponse>> {
  try {
    const { dataSource, database, collection, filter = {}, projection } = params.body as FindOneRequest;

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

    // Find the document
    const options = projection ? { projection } : {};
    const document = await col.findOne(processedFilter, options);

    return {
      data: {
        document
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