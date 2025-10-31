import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { processFilter, processUpdate, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface FindOneAndUpdateRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
  update: Record<string, any>;
  projection?: Record<string, any>;
  sort?: Record<string, any>;
  upsert?: boolean;
  returnNewDocument?: boolean;
}

interface FindOneAndUpdateResponse {
  document: Record<string, any> | null;
}

export async function findOneAndUpdate(params: RouteParams): Promise<RouteResponse<FindOneAndUpdateResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const {
      dataSource,
      database,
      collection,
      filter,
      update,
      projection,
      sort,
      upsert = false,
      returnNewDocument = true
    } = params.body as FindOneAndUpdateRequest;

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

    // Find and update one document
    const result = await col.findOneAndUpdate(processedFilter, processedUpdate, options);

    return {
      data: {
        document: result || null
      }
    };
  });
}
