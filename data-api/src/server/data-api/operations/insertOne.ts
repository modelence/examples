import { RouteParams, RouteResponse } from 'modelence/server';

interface InsertOneRequest {
  dataSource: string;
  database: string;
  collection: string;
  document: Record<string, any>;
}

interface InsertOneResponse {
  insertedId: string;
}

export async function insertOne(params: RouteParams): Promise<RouteResponse<InsertOneResponse>> {
  try {
    const { dataSource, database, collection, document } = params.body as InsertOneRequest;

    console.log(params.body);

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

    // TODO: Connect to MongoDB using dataSource configuration
    // TODO: Get database and collection references
    // TODO: Insert the document
    // TODO: Return the inserted document ID

    // Mock response for now
    return {
      data: {
        insertedId: "507f1f77bcf86cd799439011"
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