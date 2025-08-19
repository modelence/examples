import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../db';
import { ErrorResponse } from '../utils';

interface AggregateRequest {
  dataSource: string;
  database: string;
  collection: string;
  pipeline: Record<string, any>[];
}

interface AggregateResponse {
  documents: Record<string, any>[];
}

export async function aggregate(params: RouteParams): Promise<RouteResponse<AggregateResponse | ErrorResponse>> {
  try {
    const { dataSource, database, collection, pipeline } = params.body as AggregateRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !pipeline) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, pipeline",
          error_code: "InvalidParameter"
        }
      };
    }

    // Validate pipeline is an array
    if (!Array.isArray(pipeline)) {
      return {
        status: 400,
        data: {
          error: "pipeline must be an array of aggregation stages",
          error_code: "InvalidParameter"
        }
      };
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Execute the aggregation pipeline
    const documents = await col.aggregate(pipeline).toArray();

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