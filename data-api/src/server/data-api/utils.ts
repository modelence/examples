import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { ValidationError, AuthError } from 'modelence';
import { getConfig } from 'modelence/server';

export interface ErrorResponse {
  error: string;
  error_code: string;
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