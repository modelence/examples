import crypto from 'crypto';
import { AuthError, time, ValidationError } from 'modelence';
import { RouteParams, RouteResponse } from 'modelence/server';
import { ErrorResponse, validateApiKey } from '../../utils';
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

    // Validate the API key
    try {
      validateApiKey(key);
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          status: error.status,
          data: {
            error: error.message,
            error_code: "InternalServerError"
          }
        };
      } else if (error instanceof AuthError) {
        return {
          status: error.status,
          data: {
            error: error.message,
            error_code: "InvalidCredentials"
          }
        };
      }
      throw error;
    }

    // Generate secure access and refresh tokens
    const accessExpiresIn = time.minutes(30);
    const refreshExpiresIn = time.days(60);
    
    const accessToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    
    const accessExpiresAt = new Date(Date.now() + accessExpiresIn * time.seconds(1));
    const refreshExpiresAt = new Date(Date.now() + refreshExpiresIn * time.seconds(1));

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
