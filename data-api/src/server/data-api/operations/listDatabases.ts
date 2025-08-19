import { RouteParams, RouteResponse } from 'modelence/server';

interface ListDatabasesRequest {
  dataSource: string;
}

interface DatabaseInfo {
  name: string;
  sizeOnDisk?: number;
  empty?: boolean;
}

interface ListDatabasesResponse {
  databases: DatabaseInfo[];
  totalSize?: number;
}

export async function listDatabases(params: RouteParams): Promise<RouteResponse<ListDatabasesResponse | { error: string; error_code: string }>> {
  try {
    const { dataSource } = params.body as ListDatabasesRequest;

    // Validate required fields
    if (!dataSource) {
      return {
        status: 400,
        data: {
          error: "Missing required field: dataSource",
          error_code: "InvalidParameter"
        }
      };
    }

    // TODO: Connect to MongoDB using dataSource configuration
    // TODO: List all databases in the cluster
    // TODO: Return database information including size metrics

    // Mock response for now
    return {
      data: {
        databases: [
          { name: "myapp", sizeOnDisk: 1048576, empty: false },
          { name: "analytics", sizeOnDisk: 2097152, empty: false },
          { name: "logs", sizeOnDisk: 524288, empty: false }
        ],
        totalSize: 3670016
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