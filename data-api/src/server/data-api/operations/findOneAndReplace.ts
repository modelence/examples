import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface FindOneAndReplaceRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
  replacement: Record<string, any>;
  projection?: Record<string, any>;
  sort?: Record<string, any>;
  upsert?: boolean;
  returnNewDocument?: boolean;
}

interface FindOneAndReplaceResponse {
  document: Record<string, any> | null;
}

export async function findOneAndReplace(params: RouteParams): Promise<RouteResponse<FindOneAndReplaceResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const {
      dataSource,
      database,
      collection,
      filter,
      replacement,
      projection,
      sort,
      upsert = false,
      returnNewDocument = true
    } = params.body as FindOneAndReplaceRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    if (!filter) {
      throw new ValidationError("filter is required");
    }

    if (!replacement) {
      throw new ValidationError("replacement is required");
    }

    // Validate replacement document doesn't contain update operators
    const hasUpdateOperator = Object.keys(replacement).some(key => key.startsWith('$'));
    if (hasUpdateOperator) {
      throw new ValidationError("replacement document cannot contain update operators (keys starting with $)");
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Build options object
    const options: any = {
      upsert,
      returnDocument: returnNewDocument ? 'after' : 'before'
    };
    if (projection) {
      options.projection = projection;
    }
    if (sort) {
      options.sort = sort;
    }

    // Find and replace one document
    const result = await col.findOneAndReplace(processedFilter, replacement, options);

    return {
      data: {
        document: result || null
      }
    };
  });
}
