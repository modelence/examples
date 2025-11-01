import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface ReplaceOneRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
  replacement: Record<string, any>;
  upsert?: boolean;
}

interface ReplaceOneResponse {
  matchedCount: number;
  modifiedCount: number;
  upsertedId?: string;
}

export async function replaceOne(params: RouteParams): Promise<RouteResponse<ReplaceOneResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const {
      dataSource,
      database,
      collection,
      filter,
      replacement,
      upsert = false
    } = params.body as ReplaceOneRequest;

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

    // Replace one document
    const result = await col.replaceOne(processedFilter, replacement, { upsert });

    return {
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        ...(result.upsertedId && { upsertedId: result.upsertedId.toString() })
      }
    };
  });
}