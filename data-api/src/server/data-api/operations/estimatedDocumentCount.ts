import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface EstimatedDocumentCountRequest {
  dataSource: string;
  database: string;
  collection: string;
}

interface EstimatedDocumentCountResponse {
  count: number;
}

export async function estimatedDocumentCount(params: RouteParams): Promise<RouteResponse<EstimatedDocumentCountResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection } = params.body as EstimatedDocumentCountRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

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
  });
}