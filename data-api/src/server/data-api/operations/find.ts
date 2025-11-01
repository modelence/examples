import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface FindRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter?: Record<string, any>;
  projection?: Record<string, any>;
  sort?: Record<string, any>;
  limit?: number;
  skip?: number;
}

interface FindResponse {
  documents: Record<string, any>[];
}


export async function find(params: RouteParams): Promise<RouteResponse<FindResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const {
      dataSource,
      database,
      collection,
      filter = {},
      projection,
      sort,
      limit,
      skip
    } = params.body as FindRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    // Validate limit and skip if provided
    if (limit !== undefined && (limit < 0 || limit > 50000)) {
      throw new ValidationError("limit must be between 0 and 50000");
    }

    if (skip !== undefined && skip < 0) {
      throw new ValidationError("skip must be >= 0");
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Build find options
    const options: any = {};
    if (projection) options.projection = projection;
    if (sort) options.sort = sort;
    if (limit !== undefined) options.limit = limit;
    if (skip !== undefined) options.skip = skip;

    // Find documents
    const documents = await col.find(processedFilter, options).toArray();

    return {
      data: {
        documents
      }
    };
  });
}