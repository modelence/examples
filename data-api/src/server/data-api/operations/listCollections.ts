import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { ErrorResponse, withErrorHandling } from '../utils';

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
  return withErrorHandling(async () => {
    const { dataSource, database } = params.body as ListCollectionsRequest;

    // Validate required fields
    if (!dataSource) {
      throw new ValidationError("dataSource is required");
    }

    if (!database) {
      throw new ValidationError("database is required");
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
  });
}