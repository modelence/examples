import crypto from 'crypto';
import { RouteParams, RouteResponse } from 'modelence/server';
import { dataApiTokens } from '../db';
import { ErrorResponse } from '../utils';
import { time } from 'modelence';

interface SessionResponse {
  access_token: string;
}

export async function refreshSession(params: RouteParams): Promise<RouteResponse<SessionResponse | ErrorResponse>> {
  try {
    // Check for Authorization header with Bearer refresh token
    const authHeader = params.headers.authorization;
    
    if (!authHeader) {
      return {
        status: 401,
        data: {
          error: "Missing Authorization header",
          error_code: "MissingAuthInfo"
        }
      };
    }

    // Check if it starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return {
        status: 401,
        data: {
          error: "Authorization header must use Bearer scheme",
          error_code: "InvalidAuthInfo"
        }
      };
    }

    // Extract the refresh token
    const refreshToken = authHeader.substring(7); // Remove "Bearer " prefix
    
    if (!refreshToken) {
      return {
        status: 401,
        data: {
          error: "Missing refresh token",
          error_code: "MissingAuthInfo"
        }
      };
    }

    // Look up the refresh token in the database
    const refreshTokenDoc = await dataApiTokens.findOne({
      token: refreshToken,
      type: 'refresh'
    });

    if (!refreshTokenDoc) {
      return {
        status: 401,
        data: {
          error: "Invalid refresh token",
          error_code: "InvalidSession"
        }
      };
    }

    // Check if refresh token has expired
    if (refreshTokenDoc.expiresAt <= new Date()) {
      return {
        status: 401,
        data: {
          error: "Refresh token has expired",
          error_code: "InvalidSession"
        }
      };
    }

    // Generate a new access token
    const accessExpiresIn = time.minutes(30);
    const newAccessToken = crypto.randomBytes(32).toString('hex');
    const accessExpiresAt = new Date(Date.now() + accessExpiresIn * time.seconds(1));

    // Store the new access token in the database
    await dataApiTokens.insertOne({
      token: newAccessToken,
      type: 'access',
      expiresAt: accessExpiresAt,
    });

    // Return the new access token (matching MongoDB Atlas format)
    return {
      data: {
        access_token: newAccessToken,
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