import { RouteParams, RouteResponse } from 'modelence/server';

interface DropIndexRequest {
  dataSource: string;
  database: string;
  collection: string;
  index: string;
}

interface DropIndexResponse {
  nIndexesWas: number;
  ok: number;
}

export async function dropIndex(params: RouteParams): Promise<RouteResponse<DropIndexResponse | { error: string; error_code: string }>> {
  try {
    const { dataSource, database, collection, index } = params.body as DropIndexRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !index) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, index",
          error_code: "InvalidParameter"
        }
      };
    }

    // Validate index name
    if (index === '_id_') {
      return {
        status: 400,
        data: {
          error: "Cannot drop the _id_ index",
          error_code: "InvalidParameter"
        }
      };
    }

    // TODO: Connect to MongoDB using dataSource configuration
    // TODO: Get database and collection references
    // TODO: Drop the specified index
    // TODO: Handle index not found error gracefully

    // Mock response for now
    return {
      data: {
        nIndexesWas: 3,
        ok: 1
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