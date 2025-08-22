import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse } from '../utils';

interface ReplaceOneRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
  replacement: Record<string, any>;
  upsert?: boolean;
}

interface ReplaceOneResponse {
  matchedCount: number;
  modifiedCount: number;
  upsertedId?: string;
}

export async function replaceOne(params: RouteParams): Promise<RouteResponse<ReplaceOneResponse | ErrorResponse>> {
  try {
    const { 
      dataSource, 
      database, 
      collection, 
      filter, 
      replacement, 
      upsert = false 
    } = params.body as ReplaceOneRequest;

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

    // Validate replacement document doesn't contain update operators
    const hasUpdateOperator = Object.keys(replacement).some(key => key.startsWith('$'));
    if (hasUpdateOperator) {
      return {
        status: 400,
        data: {
          error: "replacement document cannot contain update operators (keys starting with $)",
          error_code: "InvalidParameter"
        }
      };
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Replace one document
    const result = await col.replaceOne(processedFilter, replacement, { upsert });

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