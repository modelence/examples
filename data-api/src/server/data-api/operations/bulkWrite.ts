import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { processFilter, processUpdate, ErrorResponse } from '../utils';
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
  try {
    const {
      dataSource,
      database,
      collection,
      operations,
      ordered = true
    } = params.body as BulkWriteRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !operations) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, operations",
          error_code: "InvalidParameter"
        }
      };
    }

    // Validate operations is an array
    if (!Array.isArray(operations) || operations.length === 0) {
      return {
        status: 400,
        data: {
          error: "operations must be a non-empty array",
          error_code: "InvalidParameter"
        }
      };
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
        throw new Error('Invalid operation type');
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
  } catch (error) {
    return {
      status: 500,
      data: {
        error: error instanceof Error ? error.message : "Internal server error",
        error_code: "InternalServerError"
      }
    };
  }
}
