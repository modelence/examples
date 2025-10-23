import { authenticateToken } from '../auth';
import { validateApiKey } from '../../utils';
import { dataApiTokens } from '../../db';
import { mockRouteParams } from '../../__tests__/testUtils';
import { ValidationError, AuthError } from 'modelence';

jest.mock('../../utils');
jest.mock('../../db');

describe('authenticateToken', () => {
  const mockValidateApiKey = validateApiKey as jest.MockedFunction<typeof validateApiKey>;
  const mockFindOne = dataApiTokens.findOne as jest.MockedFunction<typeof dataApiTokens.findOne>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateApiKey.mockImplementation(() => {});
  });

  describe('API Key authentication', () => {
    it('should authenticate successfully with valid API key', async () => {
      const params = mockRouteParams({});
      params.headers = { apikey: 'valid-api-key' };

      const result = await authenticateToken(params);

      expect(mockValidateApiKey).toHaveBeenCalledWith('valid-api-key');
      expect(result).toBeNull();
    });

    it('should return error for ValidationError', async () => {
      const validationError = new ValidationError('API key not configured');
      (validationError as any).status = 400;
      mockValidateApiKey.mockImplementation(() => {
        throw validationError;
      });

      const params = mockRouteParams({});
      params.headers = { apikey: 'test-key' };

      const result = await authenticateToken(params);

      expect(result).toEqual({
        status: 400,
        data: {
          error: 'API key not configured',
          error_code: 'InternalServerError',
        },
      });
    });

    it('should return error for AuthError', async () => {
      const authError = new AuthError('Invalid API key');
      (authError as any).status = 401;
      mockValidateApiKey.mockImplementation(() => {
        throw authError;
      });

      const params = mockRouteParams({});
      params.headers = { apikey: 'wrong-key' };

      const result = await authenticateToken(params);

      expect(result).toEqual({
        status: 401,
        data: {
          error: 'Invalid API key',
          error_code: 'InvalidCredentials',
        },
      });
    });
  });

  describe('Bearer token authentication', () => {
    it('should authenticate successfully with valid bearer token', async () => {
      mockFindOne.mockResolvedValue({
        token: 'valid-token',
        type: 'access',
        expiresAt: new Date(Date.now() + 100000),
      } as any);

      const params = mockRouteParams({});
      params.headers = { authorization: 'Bearer valid-token' };

      const result = await authenticateToken(params);

      expect(mockFindOne).toHaveBeenCalledWith({
        token: 'valid-token',
        type: 'access',
      });
      expect(result).toBeNull();
    });

    it('should return 401 if no authorization header', async () => {
      const params = mockRouteParams({});
      params.headers = {};

      const result = await authenticateToken(params);

      expect(result).toEqual({
        status: 401,
        data: {
          error: 'Missing Authorization header or apiKey header',
          error_code: 'MissingAuthInfo',
        },
      });
    });

    it('should return 401 if authorization header does not start with Bearer', async () => {
      const params = mockRouteParams({});
      params.headers = { authorization: 'Basic token123' };

      const result = await authenticateToken(params);

      expect(result).toEqual({
        status: 401,
        data: {
          error: 'Authorization header must use Bearer scheme',
          error_code: 'InvalidAuthInfo',
        },
      });
    });

    it('should return 401 if token is empty', async () => {
      const params = mockRouteParams({});
      params.headers = { authorization: 'Bearer ' };

      const result = await authenticateToken(params);

      expect(result).toEqual({
        status: 401,
        data: {
          error: 'Missing access token',
          error_code: 'MissingAuthInfo',
        },
      });
    });

    it('should return 401 if token not found in database', async () => {
      mockFindOne.mockResolvedValue(null);

      const params = mockRouteParams({});
      params.headers = { authorization: 'Bearer invalid-token' };

      const result = await authenticateToken(params);

      expect(result).toEqual({
        status: 401,
        data: {
          error: 'Invalid access token',
          error_code: 'InvalidSession',
        },
      });
    });

    it('should return 401 if token has expired', async () => {
      mockFindOne.mockResolvedValue({
        token: 'expired-token',
        type: 'access',
        expiresAt: new Date(Date.now() - 10000), // Expired
      } as any);

      const params = mockRouteParams({});
      params.headers = { authorization: 'Bearer expired-token' };

      const result = await authenticateToken(params);

      expect(result).toEqual({
        status: 401,
        data: {
          error: 'Access token has expired',
          error_code: 'InvalidSession',
        },
      });
    });

    it('should return 500 on database error', async () => {
      mockFindOne.mockRejectedValue(new Error('Database error'));

      const params = mockRouteParams({});
      params.headers = { authorization: 'Bearer token123' };

      const result = await authenticateToken(params);

      expect(result).toEqual({
        status: 500,
        data: {
          error: 'Database error',
          error_code: 'InternalServerError',
        },
      });
    });
  });

  describe('Priority', () => {
    it('should prefer apiKey over bearer token', async () => {
      const params = mockRouteParams({});
      params.headers = {
        apikey: 'valid-api-key',
        authorization: 'Bearer token123',
      };

      const result = await authenticateToken(params);

      expect(mockValidateApiKey).toHaveBeenCalledWith('valid-api-key');
      expect(mockFindOne).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
