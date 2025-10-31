import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface DistinctRequest {
  dataSource: string;
  database: string;
  collection: string;
  key: string;
  filter?: Record<string, any>;
}

interface DistinctResponse {
  values: any[];
}

export async function distinct(params: RouteParams): Promise<RouteResponse<DistinctResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const {
      dataSource,
      database,
      collection,
      key,
      filter = {}
    } = params.body as DistinctRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    if (!key) {
      throw new ValidationError("key is required");
    }

    // Validate key is a string
    if (typeof key !== 'string') {
      throw new ValidationError("key must be a string representing the field name");
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Get distinct values
    const values = await col.distinct(key, processedFilter);

    return {
      data: {
        values
      }
    };
  });
}
