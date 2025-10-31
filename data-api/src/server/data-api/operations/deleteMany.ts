import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface DeleteManyRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
}

interface DeleteManyResponse {
  deletedCount: number;
}

export async function deleteMany(params: RouteParams): Promise<RouteResponse<DeleteManyResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection, filter } = params.body as DeleteManyRequest;

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

    // Delete multiple documents
    const result = await col.deleteMany(processedFilter);

    return {
      data: {
        deletedCount: result.deletedCount
      }
    };
  });
}