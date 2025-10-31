import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { ValidationError, AuthError } from 'modelence';
import { getConfig, RouteResponse } from 'modelence/server';
import { z } from 'zod';

export interface ErrorResponse {
  error: string;
  error_code: string;
}

// Zod schema for validating required MongoDB operation fields
const requiredMongoFieldsSchema = z.object({
  database: z.string().min(1, { message: "database is required" }),
  collection: z.string().min(1, { message: "collection is required" })
});

export type RequiredMongoFields = z.infer<typeof requiredMongoFieldsSchema>;

/**
 * Validates required MongoDB fields (dataSource, database, collection)
 * @param fields - The fields to validate
 * @throws ValidationError with specific error message if validation fails
 */
export function validateRequiredMongoFields(fields: unknown): void {
  const result = requiredMongoFieldsSchema.safeParse(fields);

  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new ValidationError(firstError.message);
  }
}

export function processFilter(filter: Record<string, any>): Record<string, any> {
  const processedFilter: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(filter)) {
    if (key === '_id' && typeof value === 'string' && ObjectId.isValid(value)) {
      processedFilter[key] = new ObjectId(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      processedFilter[key] = processFilter(value);
    } else {
      processedFilter[key] = value;
    }
  }
  
  return processedFilter;
}

export function processUpdate(update: Record<string, any>): Record<string, any> {
  const processedUpdate: Record<string, any> = {};
  
  for (const [operator, fields] of Object.entries(update)) {
    if (typeof fields === 'object' && fields !== null && !Array.isArray(fields)) {
      processedUpdate[operator] = {};
      for (const [field, value] of Object.entries(fields)) {
        if (field === '_id' && typeof value === 'string' && ObjectId.isValid(value)) {
          processedUpdate[operator][field] = new ObjectId(value);
        } else {
          processedUpdate[operator][field] = value;
        }
      }
    } else {
      processedUpdate[operator] = fields;
    }
  }
  
  return processedUpdate;
}

export function validateApiKey(providedApiKey: string): void {
  const configuredApiKey = getConfig('dataApi.apiKey') as string || process.env.DATA_API_KEY;

  if (!configuredApiKey) {
    throw new ValidationError('API key authentication not configured');
  }

  // Use timing-safe comparison for API key validation
  const providedKeyBuffer = Buffer.from(providedApiKey, 'utf8');
  const configuredKeyBuffer = Buffer.from(configuredApiKey, 'utf8');

  if (providedKeyBuffer.length !== configuredKeyBuffer.length ||
      !crypto.timingSafeEqual(providedKeyBuffer, configuredKeyBuffer)) {
    throw new AuthError('Invalid API key');
  }
}

/**
 * Wrapper function that handles try/catch and returns a standardized error response
 * @param operation - The async operation to execute
 * @returns RouteResponse with either the operation result or an error response (400 for ValidationError, 500 for others)
 */
export async function withErrorHandling<T>(
  operation: () => Promise<RouteResponse<T | ErrorResponse>>
): Promise<RouteResponse<T | ErrorResponse>> {
  try {
    return await operation();
  } catch (error) {
    // Handle ValidationError with 400 status
    if (error instanceof ValidationError) {
      return {
        status: 400,
        data: {
          error: error.message,
          error_code: "InvalidParameter"
        }
      };
    }

    // Handle all other errors with 500 status
    return {
      status: 500,
      data: {
        error: error instanceof Error ? error.message : "Internal server error",
        error_code: "InternalServerError"
      }
    };
  }
}