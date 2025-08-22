import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { ErrorResponse } from '../utils';

interface ListCollectionsRequest {
  dataSource: string;
  database: string;
}

interface CollectionInfo {
  name: string;
  type: string;
}

interface ListCollectionsResponse {
  collections: CollectionInfo[];
}

export async function listCollections(params: RouteParams): Promise<RouteResponse<ListCollectionsResponse | ErrorResponse>> {
  try {
    const { dataSource, database } = params.body as ListCollectionsRequest;

    // Validate required fields
    if (!dataSource || !database) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database",
          error_code: "InvalidParameter"
        }
      };
    }

    // Connect to MongoDB and get database
    const db = await getDatabase(database);

    // List all collections
    const collectionInfos = await db.listCollections().toArray();

    const collections = collectionInfos.map(info => ({
      name: info.name,
      type: info.type || 'collection'
    }));

    return {
      data: {
        collections
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