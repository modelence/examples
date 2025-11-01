import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { processFilter, processUpdate, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';
import { AnyBulkWriteOperation, ObjectId } from 'mongodb';

interface BulkWriteOperation {
  insertOne?: {
    document: Record<string, any>;
  };
  updateOne?: {
    filter: Record<string, any>;
    update: Record<string, any>;
    upsert?: boolean;
  };
  updateMany?: {
    filter: Record<string, any>;
    update: Record<string, any>;
    upsert?: boolean;
  };
  replaceOne?: {
    filter: Record<string, any>;
    replacement: Record<string, any>;
    upsert?: boolean;
  };
  deleteOne?: {
    filter: Record<string, any>;
  };
  deleteMany?: {
    filter: Record<string, any>;
  };
}

interface BulkWriteRequest {
  dataSource: string;
  database: string;
  collection: string;
  operations: BulkWriteOperation[];
  ordered?: boolean;
}

interface BulkWriteResponse {
  insertedCount: number;
  matchedCount: number;
  modifiedCount: number;
  deletedCount: number;
  upsertedCount: number;
  upsertedIds: Record<string, string>;
}

export async function bulkWrite(params: RouteParams): Promise<RouteResponse<BulkWriteResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const {
      dataSource,
      database,
      collection,
      operations,
      ordered = true
    } = params.body as BulkWriteRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    if (!operations) {
      throw new ValidationError("operations is required");
    }

    // Validate operations is an array
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new ValidationError("operations must be a non-empty array");
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process each operation
    const processedOperations: AnyBulkWriteOperation<any>[] = operations.map((op) => {
      if (op.insertOne) {
        return {
          insertOne: {
            document: op.insertOne.document
          }
        };
      } else if (op.updateOne) {
        return {
          updateOne: {
            filter: processFilter(op.updateOne.filter),
            update: processUpdate(op.updateOne.update),
            upsert: op.updateOne.upsert
          }
        };
      } else if (op.updateMany) {
        return {
          updateMany: {
            filter: processFilter(op.updateMany.filter),
            update: processUpdate(op.updateMany.update),
            upsert: op.updateMany.upsert
          }
        };
      } else if (op.replaceOne) {
        return {
          replaceOne: {
            filter: processFilter(op.replaceOne.filter),
            replacement: op.replaceOne.replacement,
            upsert: op.replaceOne.upsert
          }
        };
      } else if (op.deleteOne) {
        return {
          deleteOne: {
            filter: processFilter(op.deleteOne.filter)
          }
        };
      } else if (op.deleteMany) {
        return {
          deleteMany: {
            filter: processFilter(op.deleteMany.filter)
          }
        };
      } else {
        throw new ValidationError('Invalid operation type');
      }
    });

    // Execute bulk write
    const result = await col.bulkWrite(processedOperations, { ordered });

    // Format upsertedIds
    const upsertedIds: Record<string, string> = {};
    if (result.upsertedIds) {
      for (const [index, id] of Object.entries(result.upsertedIds)) {
        upsertedIds[index] = (id as ObjectId).toString();
      }
    }

    return {
      data: {
        insertedCount: result.insertedCount,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        deletedCount: result.deletedCount,
        upsertedCount: result.upsertedCount,
        upsertedIds
      }
    };
  });
}
