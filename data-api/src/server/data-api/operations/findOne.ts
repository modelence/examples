import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse, validateRequiredMongoFields, withErrorHandling } from '../utils';

interface FindOneRequest {
  dataSource: string;
  database: string;
  collection: string;
  filter?: Record<string, any>;
  projection?: Record<string, any>;
}

interface FindOneResponse {
  document: Record<string, any> | null;
}


export async function findOne(params: RouteParams): Promise<RouteResponse<FindOneResponse | ErrorResponse>> {
  return withErrorHandling(async () => {
    const { dataSource, database, collection, filter = {}, projection } = params.body as FindOneRequest;

    // Validate required fields
    validateRequiredMongoFields({ dataSource, database, collection });

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Find the document
    const options = projection ? { projection } : {};
    const document = await col.findOne(processedFilter, options);

    return {
      data: {
        document
      }
    };
  });
}