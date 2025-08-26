import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';

interface InsertOneRequest {
  dataSource: string;
  database: string;
  collection: string;
  document: Record<string, any>;
}

interface InsertOneResponse {
  insertedId: string;
}

interface ErrorResponse {
  error: string;
  error_code: string;
}

export async function insertOne(params: RouteParams): Promise<RouteResponse<InsertOneResponse | ErrorResponse>> {
  try {
    const { dataSource, database, collection, document } = params.body as InsertOneRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !document) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, document",
          error_code: "InvalidParameter"
        }
      };
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Insert the document
    const result = await col.insertOne(document);

    return {
      data: {
        insertedId: result.insertedId.toString()
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