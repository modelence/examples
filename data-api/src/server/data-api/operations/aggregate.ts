import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

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
  return withErrorHandling(async () => {
    const { dataSource, database, collection, pipeline } = params.body as AggregateRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    if (!pipeline) {
      throw new ValidationError("pipeline is required");
    }

    // Validate pipeline is an array
    if (!Array.isArray(pipeline)) {
      throw new ValidationError("pipeline must be an array of aggregation stages");
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
  });
}