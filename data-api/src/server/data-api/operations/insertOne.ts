import { RouteParams, RouteResponse } from 'modelence/server';
import { ValidationError } from 'modelence';
import { getDatabase } from '../mongoClient';
import { ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface InsertOneRequest {
  dataSource: string;
  database: string;
  collection: string;
  document: Record<string, any>;
}

interface InsertOneResponse {
  insertedId: string;
}

export async function insertOne(params: RouteParams): Promise<RouteResponse<InsertOneResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection, document } = params.body as InsertOneRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    if (!document) {
      throw new ValidationError("document is required");
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Insert the document
    const result = await col.insertOne(document);

    return {
      data: {
        insertedId: result.insertedId.toString()
      }
    };
  });
}