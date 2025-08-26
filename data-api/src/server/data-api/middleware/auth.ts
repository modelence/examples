import { RouteParams, RouteResponse } from 'modelence/server';
import { dataApiTokens } from '../db';
import { ErrorResponse } from '../utils';

export async function authenticateToken(params: RouteParams): Promise<RouteResponse<ErrorResponse> | null> {
  try {
    // Check for Authorization header with Bearer token
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

    // Extract the token
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    if (!token) {
      return {
        status: 401,
        data: {
          error: "Missing access token",
          error_code: "MissingAuthInfo"
        }
      };
    }

    // Look up the token in the database
    const tokenDoc = await dataApiTokens.findOne({
      token: token,
      type: 'access'
    });

    if (!tokenDoc) {
      return {
        status: 401,
        data: {
          error: "Invalid access token",
          error_code: "InvalidSession"
        }
      };
    }

    // Check if token has expired
    if (tokenDoc.expiresAt <= new Date()) {
      return {
        status: 401,
        data: {
          error: "Access token has expired",
          error_code: "InvalidSession"
        }
      };
    }

    // Token is valid, allow request to proceed
    return null;
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