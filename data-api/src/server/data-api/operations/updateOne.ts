import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { processFilter, processUpdate, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface UpdateOneRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
  update: Record<string, any>;
  upsert?: boolean;
}

interface UpdateOneResponse {
  matchedCount: number;
  modifiedCount: number;
  upsertedId?: string;
}

export async function updateOne(params: RouteParams): Promise<RouteResponse<UpdateOneResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const {
      dataSource,
      database,
      collection,
      filter,
      update,
      upsert = false
    } = params.body as UpdateOneRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    if (!filter) {
      throw new ValidationError("filter is required");
    }

    if (!update) {
      throw new ValidationError("update is required");
    }

    // Validate update operators
    const hasValidOperator = Object.keys(update).some(key => key.startsWith('$'));
    if (!hasValidOperator) {
      throw new ValidationError("update must contain at least one update operator (e.g., $set, $inc, $push)");
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter and update to handle ObjectId conversion
    const processedFilter = processFilter(filter);
    const processedUpdate = processUpdate(update);

    // Update one document
    const result = await col.updateOne(processedFilter, processedUpdate, { upsert });

    return {
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        ...(result.upsertedId && { upsertedId: result.upsertedId.toString() })
      }
    };
  });
}