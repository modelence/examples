import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface CountDocumentsRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter?: Record<string, any>;
}

interface CountDocumentsResponse {
  count: number;
}

export async function countDocuments(params: RouteParams): Promise<RouteResponse<CountDocumentsResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection, filter = {} } = params.body as CountDocumentsRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Count documents matching the filter
    const count = await col.countDocuments(processedFilter);

    return {
      data: {
        count
      }
    };
  });
}