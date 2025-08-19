import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../db';
import { processFilter, ErrorResponse } from '../utils';

interface FindRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter?: Record<string, any>;
  projection?: Record<string, any>;
  sort?: Record<string, any>;
  limit?: number;
  skip?: number;
}

interface FindResponse {
  documents: Record<string, any>[];
}


export async function find(params: RouteParams): Promise<RouteResponse<FindResponse | ErrorResponse>> {
  try {
    const { 
      dataSource, 
      database, 
      collection, 
      filter = {}, 
      projection, 
      sort, 
      limit, 
      skip 
    } = params.body as FindRequest;

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

    // Validate limit and skip if provided
    if (limit !== undefined && (limit < 0 || limit > 50000)) {
      return {
        status: 400,
        data: {
          error: "limit must be between 0 and 50000",
          error_code: "InvalidParameter"
        }
      };
    }

    if (skip !== undefined && skip < 0) {
      return {
        status: 400,
        data: {
          error: "skip must be >= 0",
          error_code: "InvalidParameter"
        }
      };
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Build find options
    const options: any = {};
    if (projection) options.projection = projection;
    if (sort) options.sort = sort;
    if (limit !== undefined) options.limit = limit;
    if (skip !== undefined) options.skip = skip;

    // Find documents
    const documents = await col.find(processedFilter, options).toArray();

    return {
      data: {
        documents
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