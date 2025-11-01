import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface DeleteOneRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
}

interface DeleteOneResponse {
  deletedCount: number;
}

export async function deleteOne(params: RouteParams): Promise<RouteResponse<DeleteOneResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection, filter } = params.body as DeleteOneRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    if (!filter) {
      throw new ValidationError("filter is required");
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Delete one document
    const result = await col.deleteOne(processedFilter);

    return {
      data: {
        deletedCount: result.deletedCount
      }
    };
  });
}