import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getMongoClient } from '../mongoClient';
import { ErrorResponse, withErrorHandling } from '../utils';

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
  return withErrorHandling(async () => {
    const { dataSource } = params.body as ListDatabasesRequest;

    // Validate required fields
    if (!dataSource) {
      throw new ValidationError("dataSource is required");
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
  });
}