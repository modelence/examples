import { RouteParams, RouteResponse } from 'modelence/server';
import { authenticateToken } from './auth';
import { ErrorResponse } from '../utils';

type AuthenticatedHandler<T> = (params: RouteParams) => Promise<RouteResponse<T | ErrorResponse>>;

export function withAuth<T>(handler: AuthenticatedHandler<T>): AuthenticatedHandler<T> {
  return async (params: RouteParams): Promise<RouteResponse<T | ErrorResponse>> => {
    // Authenticate the request first
    const authError = await authenticateToken(params);
    if (authError) {
      return authError;
    }

    // If authentication succeeds, call the original handler
    return handler(params);
  };
}