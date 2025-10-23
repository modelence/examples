import { RouteParams, RouteResponse } from 'modelence/server';
import { getDatabase } from '../mongoClient';
import { processFilter, ErrorResponse } from '../utils';

interface DistinctRequest {
  dataSource: string;
  database: string;
  collection: string;
  key: string;
  filter?: Record<string, any>;
}

interface DistinctResponse {
  values: any[];
}

export async function distinct(params: RouteParams): Promise<RouteResponse<DistinctResponse | ErrorResponse>> {
  try {
    const {
      dataSource,
      database,
      collection,
      key,
      filter = {}
    } = params.body as DistinctRequest;

    // Validate required fields
    if (!dataSource || !database || !collection || !key) {
      return {
        status: 400,
        data: {
          error: "Missing required fields: dataSource, database, collection, key",
          error_code: "InvalidParameter"
        }
      };
    }

    // Validate key is a string
    if (typeof key !== 'string') {
      return {
        status: 400,
        data: {
          error: "key must be a string representing the field name",
          error_code: "InvalidParameter"
        }
      };
    }

    // Connect to MongoDB and get collection
    const db = await getDatabase(database);
    const col = db.collection(collection);

    // Process filter to handle ObjectId conversion
    const processedFilter = processFilter(filter);

    // Get distinct values
    const values = await col.distinct(key, processedFilter);

    return {
      data: {
        values
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
