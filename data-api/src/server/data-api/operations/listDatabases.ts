import { RouteParams, RouteResponse } from 'modelence/server';
import { getMongoClient } from '../mongoClient';
import { ErrorResponse } from '../utils';

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

export async function listDatabases(params: RouteParams): Promise<RouteResponse<ListDatabasesResponse | ErrorResponse>> {
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

    // Connect to MongoDB client
    const client = await getMongoClient();

    // List all databases
    const adminDb = client.db().admin();
    const databasesResult = await adminDb.listDatabases();

    const databases = databasesResult.databases.map(db => ({
      name: db.name,
      sizeOnDisk: db.sizeOnDisk,
      empty: db.empty
    }));

    return {
      data: {
        databases,
        totalSize: databasesResult.totalSize
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