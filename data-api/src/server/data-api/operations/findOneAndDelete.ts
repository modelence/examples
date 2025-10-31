import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface FindOneAndDeleteRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
  projection?: Record<string, any>;
  sort?: Record<string, any>;
}

interface FindOneAndDeleteResponse {
  document: Record<string, any> | null;
}

export async function findOneAndDelete(params: RouteParams): Promise<RouteResponse<FindOneAndDeleteResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const {
      dataSource,
      database,
      collection,
      filter,
      projection,
      sort
    } = params.body as FindOneAndDeleteRequest;

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

    // Build options object
    const options: any = {};
    if (projection) {
      options.projection = projection;
    }
    if (sort) {
      options.sort = sort;
    }

    // Find and delete one document
    const result = await col.findOneAndDelete(processedFilter, options);

    return {
      data: {
        document: result || null
      }
    };
  });
}
