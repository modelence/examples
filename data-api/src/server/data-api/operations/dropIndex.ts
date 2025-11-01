import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

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

export async function dropIndex(params: RouteParams): Promise<RouteResponse<DropIndexResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection, index } = params.body as DropIndexRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    if (!index) {
      throw new ValidationError("index is required");
    }

    // Validate index name
    if (index === '_id_') {
      throw new ValidationError("Cannot drop the _id_ index");
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Count indexes before dropping
    const indexesBefore = await col.indexes();
    const nIndexesWas = indexesBefore.length;

    // Drop the specified index
    await col.dropIndex(index);

    return {
      data: {
        nIndexesWas,
        ok: 1
      }
    };
  });
}