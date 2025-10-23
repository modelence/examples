import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { processFilter, processUpdate, ErrorResponse } from '../utils';

interface FindOneAndUpdateRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
  update: Record<string, any>;
  projection?: Record<string, any>;
  sort?: Record<string, any>;
  upsert?: boolean;
  returnNewDocument?: boolean;
}

interface FindOneAndUpdateResponse {
  document: Record<string, any> | null;
}

export async function findOneAndUpdate(params: RouteParams): Promise<RouteResponse<FindOneAndUpdateResponse | ErrorResponse>> {
  try {
    const {
      dataSource,
      database,
      collection,
      filter,
      update,
      projection,
      sort,
      upsert = false,
      returnNewDocument = true
    } = params.body as FindOneAndUpdateRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !filter || !update) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, filter, update",
          error_code: "InvalidParameter"
        }
      };
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter and update to handle ObjectId conversion
    const processedFilter = processFilter(filter);
    const processedUpdate = processUpdate(update);

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

    // Find and update one document
    const result = await col.findOneAndUpdate(processedFilter, processedUpdate, options);

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
