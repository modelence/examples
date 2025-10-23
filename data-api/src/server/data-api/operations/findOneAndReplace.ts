import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse } from '../utils';

interface FindOneAndReplaceRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
  replacement: Record<string, any>;
  projection?: Record<string, any>;
  sort?: Record<string, any>;
  upsert?: boolean;
  returnNewDocument?: boolean;
}

interface FindOneAndReplaceResponse {
  document: Record<string, any> | null;
}

export async function findOneAndReplace(params: RouteParams): Promise<RouteResponse<FindOneAndReplaceResponse | ErrorResponse>> {
  try {
    const {
      dataSource,
      database,
      collection,
      filter,
      replacement,
      projection,
      sort,
      upsert = false,
      returnNewDocument = true
    } = params.body as FindOneAndReplaceRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !filter || !replacement) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, filter, replacement",
          error_code: "InvalidParameter"
        }
      };
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Build options object
    const options: any = {
      upsert,
      returnDocument: returnNewDocument ? 'after' : 'before'
    };
    if (projection) {
      options.projection = projection;
    }
    if (sort) {
      options.sort = sort;
    }

    // Find and replace one document
    const result = await col.findOneAndReplace(processedFilter, replacement, options);

    return {
      data: {
        document: result || null
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
