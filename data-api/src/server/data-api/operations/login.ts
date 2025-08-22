import crypto from 'crypto';
import { getConfig, RouteParams, RouteResponse } from 'modelence/server';
import { ErrorResponse } from '../utils';

interface LoginRequest {
  key: string;
}

interface LoginResponse {
  access_token: string;
}

export async function login(params: RouteParams): Promise<RouteResponse<LoginResponse | ErrorResponse>> {
  try {
    const { key } = params.body as LoginRequest;
    
    // Validate required fields
    if (!key) {
      return {
        status: 400,
        data: {
          error: "Missing required field: key",
          error_code: "InvalidParameter"
        }
      };
    }

    // Get the configured API key from module config
    const configuredApiKey = getConfig('dataApi.apiKey') as string;
    
    if (!configuredApiKey) {
      return {
        status: 500,
        data: {
          error: "API key authentication not configured",
          error_code: "InternalServerError"
        }
      };
    }

    // Validate the provided key
    if (!crypto.timingSafeEqual(Buffer.from(key), Buffer.from(configuredApiKey))) {
      return {
        status: 401,
        data: {
          error: "Invalid API key",
          error_code: "InvalidCredentials"
        }
      };
    }

    // Return the access token (in this case, the API key itself)
    return {
      data: {
        access_token: key,
      },
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