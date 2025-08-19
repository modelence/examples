import { RouteParams, RouteResponse } from 'modelence/server';

interface DeleteOneRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter: Record<string, any>;
}

interface DeleteOneResponse {
  deletedCount: number;
}

export async function deleteOne(params: RouteParams): Promise<RouteResponse<DeleteOneResponse | { error: string; error_code: string }>> {
  try {
    const { dataSource, database, collection, filter } = params.body as DeleteOneRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !filter) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, filter",
          error_code: "InvalidParameter"
        }
      };
    }

    // TODO: Connect to MongoDB using dataSource configuration
    // TODO: Get database and collection references
    // TODO: Delete one document with the given filter
    // TODO: Return delete result with deletedCount

    // Mock response for now
    return {
      data: {
        deletedCount: 1
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