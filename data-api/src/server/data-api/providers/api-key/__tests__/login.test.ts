import { login } from '../login';
import { validateApiKey } from '../../../utils';
import { dataApiTokens } from '../../../db';
import { mockRouteParams } from '../../../__tests__/testUtils';
import { ValidationError, AuthError } from 'modelence';

jest.mock('../../../utils');
jest.mock('../../../db');

describe('login', () => {
  const mockValidateApiKey = validateApiKey as jest.MockedFunction<typeof validateApiKey>;
  const mockInsertMany = dataApiTokens.insertMany as jest.MockedFunction<typeof dataApiTokens.insertMany>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateApiKey.mockImplementation(() => {});
    mockInsertMany.mockResolvedValue({
      insertedIds: { 0: 'token1', 1: 'token2' },
      insertedCount: 2,
      acknowledged: true,
    } as any);
  });

  it('should login successfully with valid API key', async () => {
    const params = mockRouteParams({
      key: 'valid-api-key',
    });

    const result = await login(params);

    expect(mockValidateApiKey).toHaveBeenCalledWith('valid-api-key');
    expect(mockInsertMany).toHaveBeenCalledWith([
      expect.objectContaining({
        type: 'access',
        expiresAt: expect.any(Date),
      }),
      expect.objectContaining({
        type: 'refresh',
        expiresAt: expect.any(Date),
      }),
    ]);
    expect(result.data).toHaveProperty('access_token');
    expect(result.data).toHaveProperty('refresh_token');
    expect((result.data as any).token_type).toBe('Bearer');
    expect((result.data as any).expires_in).toBeGreaterThan(0);
  });

  it('should return 400 if key is missing', async () => {
    const params = mockRouteParams({});

    const result = await login(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required field: key',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockValidateApiKey).not.toHaveBeenCalled();
  });

  it('should return error if ValidationError thrown', async () => {
    const validationError = new ValidationError('API key not configured');
    (validationError as any).status = 400;
    mockValidateApiKey.mockImplementation(() => {
      throw validationError;
    });

    const params = mockRouteParams({
      key: 'test-key',
    });

    const result = await login(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'API key not configured',
        error_code: 'InternalServerError',
      },
    });
    expect(mockInsertMany).not.toHaveBeenCalled();
  });

  it('should return error if AuthError thrown', async () => {
    const authError = new AuthError('Invalid API key');
    (authError as any).status = 401;
    mockValidateApiKey.mockImplementation(() => {
      throw authError;
    });

    const params = mockRouteParams({
      key: 'wrong-key',
    });

    const result = await login(params);

    expect(result).toEqual({
      status: 401,
      data: {
        error: 'Invalid API key',
        error_code: 'InvalidCredentials',
      },
    });
    expect(mockInsertMany).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockInsertMany.mockRejectedValue(new Error('Database error'));

    const params = mockRouteParams({
      key: 'valid-key',
    });

    const result = await login(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Database error',
        error_code: 'InternalServerError',
      },
    });
  });

  it('should generate different tokens each time', async () => {
    const params1 = mockRouteParams({ key: 'valid-key' });
    const params2 = mockRouteParams({ key: 'valid-key' });

    const result1 = await login(params1);
    const result2 = await login(params2);

    expect((result1.data as any).access_token).not.toBe((result2.data as any).access_token);
    expect((result1.data as any).refresh_token).not.toBe((result2.data as any).refresh_token);
  });

  it('should store tokens with correct expiration times', async () => {
    const params = mockRouteParams({ key: 'valid-key' });

    await login(params);

    expect(mockInsertMany).toHaveBeenCalled();
    const insertedTokens = mockInsertMany.mock.calls[0][0];

    const accessToken = insertedTokens.find((t: any) => t.type === 'access');
    const refreshToken = insertedTokens.find((t: any) => t.type === 'refresh');

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(accessToken.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(refreshToken.expiresAt.getTime()).toBeGreaterThan(accessToken.expiresAt.getTime());
  });
});
