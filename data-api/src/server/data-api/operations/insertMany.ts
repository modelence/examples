import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';

interface InsertManyRequest {
  dataSource: string;
  database: string;
  collection: string;
  documents: Record<string, any>[];
}

interface InsertManyResponse {
  insertedIds: string[];
}

interface ErrorResponse {
  error: string;
  error_code: string;
}

export async function insertMany(params: RouteParams): Promise<RouteResponse<InsertManyResponse | ErrorResponse>> {
  try {
    const { dataSource, database, collection, documents } = params.body as InsertManyRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !documents || !Array.isArray(documents)) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, documents (array)",
          error_code: "InvalidParameter"
        }
      };
    }

    if (documents.length === 0) {
      return {
        status: 400,
        data: {
          error: "documents array cannot be empty",
          error_code: "InvalidParameter"
        }
      };
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Insert the documents
    const result = await col.insertMany(documents);

    return {
      data: {
        insertedIds: Object.values(result.insertedIds).map(id => id.toString())
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