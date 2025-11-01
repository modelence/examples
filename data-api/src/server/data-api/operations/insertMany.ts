import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface InsertManyRequest {
  dataSource: string;
  database: string;
  collection: string;
  documents: Record<string, any>[];
}

interface InsertManyResponse {
  insertedIds: string[];
}

export async function insertMany(params: RouteParams): Promise<RouteResponse<InsertManyResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection, documents } = params.body as InsertManyRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    if (!documents || !Array.isArray(documents)) {
      throw new ValidationError("documents must be an array");
    }

    if (documents.length === 0) {
      throw new ValidationError("documents array cannot be empty");
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
  });
}