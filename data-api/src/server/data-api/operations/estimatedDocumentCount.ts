import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { ErrorResponse } from '../utils';

interface EstimatedDocumentCountRequest {
  dataSource: string;
  database: string;
  collection: string;
}

interface EstimatedDocumentCountResponse {
  count: number;
}

export async function estimatedDocumentCount(params: RouteParams): Promise<RouteResponse<EstimatedDocumentCountResponse | ErrorResponse>> {
  try {
    const { dataSource, database, collection } = params.body as EstimatedDocumentCountRequest;

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

    // Get estimated document count (faster than countDocuments but less accurate)
    const count = await col.estimatedDocumentCount();

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