import crypto from 'crypto';
import { getConfig, RouteParams, RouteResponse } from 'modelence/server';
import { ErrorResponse } from '../../utils';
import { dataApiTokens } from '../../db';

interface LoginRequest {
  key: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
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

    // Generate secure access and refresh tokens
    const accessExpiresIn = 1800; // 30 minutes (MongoDB Atlas Data API standard)
    const refreshExpiresIn = 60 * 24 * 60 * 60; // 60 days in seconds
    
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    const accessExpiresAt = new Date(Date.now() + accessExpiresIn * 1000);
    const refreshExpiresAt = new Date(Date.now() + refreshExpiresIn * 1000);

    // Store both tokens in the database
    await dataApiTokens.insertMany([
      {
        token: accessToken,
        type: 'access',
        expiresAt: accessExpiresAt,
      },
      {
        token: refreshToken,
        type: 'refresh',
        expiresAt: refreshExpiresAt,
      }
    ]);

    return {
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: accessExpiresIn,
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
