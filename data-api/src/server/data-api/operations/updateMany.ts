import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { processFilter, processUpdate, ErrorResponse } from '../utils';

interface UpdateManyRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
  update: Record<string, any>;
  upsert?: boolean;
}

interface UpdateManyResponse {
  matchedCount: number;
  modifiedCount: number;
  upsertedId?: string;
}

export async function updateMany(params: RouteParams): Promise<RouteResponse<UpdateManyResponse | ErrorResponse>> {
  try {
    const { 
      dataSource, 
      database, 
      collection, 
      filter, 
      update, 
      upsert = false 
    } = params.body as UpdateManyRequest;

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

    // Validate update operators
    const hasValidOperator = Object.keys(update).some(key => key.startsWith('$'));
    if (!hasValidOperator) {
      return {
        status: 400,
        data: {
          error: "update must contain at least one update operator (e.g., $set, $inc, $push)",
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

    // Update multiple documents
    const result = await col.updateMany(processedFilter, processedUpdate, { upsert });

    return {
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        ...(result.upsertedId && { upsertedId: result.upsertedId.toString() })
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