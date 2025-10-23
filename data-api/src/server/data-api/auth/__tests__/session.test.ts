import { refreshSession } from '../session';
import { dataApiTokens } from '../../db';
import { mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../db');

describe('refreshSession', () => {
  const mockFindOne = dataApiTokens.findOne as jest.MockedFunction<typeof dataApiTokens.findOne>;
  const mockInsertOne = dataApiTokens.insertOne as jest.MockedFunction<typeof dataApiTokens.insertOne>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInsertOne.mockResolvedValue({
      insertedId: 'new-token-id',
      acknowledged: true,
    } as any);
  });

  it('should refresh session successfully with valid refresh token', async () => {
    mockFindOne.mockResolvedValue({
      token: 'valid-refresh-token',
      type: 'refresh',
      expiresAt: new Date(Date.now() + 1000000),
    } as any);

    const params = mockRouteParams({});
    params.headers = { authorization: 'Bearer valid-refresh-token' };

    const result = await refreshSession(params);

    expect(mockFindOne).toHaveBeenCalledWith({
      token: 'valid-refresh-token',
      type: 'refresh',
    });
    expect(mockInsertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'access',
        expiresAt: expect.any(Date),
      })
    );
    expect(result.data).toHaveProperty('access_token');
    expect(typeof (result.data as any).access_token).toBe('string');
  });

  it('should return 401 if authorization header is missing', async () => {
    const params = mockRouteParams({});
    params.headers = {};

    const result = await refreshSession(params);

    expect(result).toEqual({
      status: 401,
      data: {
        error: 'Missing Authorization header',
        error_code: 'MissingAuthInfo',
      },
    });
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with Bearer', async () => {
    const params = mockRouteParams({});
    params.headers = { authorization: 'Basic token123' };

    const result = await refreshSession(params);

    expect(result).toEqual({
      status: 401,
      data: {
        error: 'Authorization header must use Bearer scheme',
        error_code: 'InvalidAuthInfo',
      },
    });
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it('should return 401 if refresh token is empty', async () => {
    const params = mockRouteParams({});
    params.headers = { authorization: 'Bearer ' };

    const result = await refreshSession(params);

    expect(result).toEqual({
      status: 401,
      data: {
        error: 'Missing refresh token',
        error_code: 'MissingAuthInfo',
      },
    });
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it('should return 401 if refresh token not found in database', async () => {
    mockFindOne.mockResolvedValue(null);

    const params = mockRouteParams({});
    params.headers = { authorization: 'Bearer invalid-refresh-token' };

    const result = await refreshSession(params);

    expect(mockFindOne).toHaveBeenCalledWith({
      token: 'invalid-refresh-token',
      type: 'refresh',
    });
    expect(result).toEqual({
      status: 401,
      data: {
        error: 'Invalid refresh token',
        error_code: 'InvalidSession',
      },
    });
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it('should return 401 if refresh token has expired', async () => {
    mockFindOne.mockResolvedValue({
      token: 'expired-refresh-token',
      type: 'refresh',
      expiresAt: new Date(Date.now() - 10000), // Expired
    } as any);

    const params = mockRouteParams({});
    params.headers = { authorization: 'Bearer expired-refresh-token' };

    const result = await refreshSession(params);

    expect(result).toEqual({
      status: 401,
      data: {
        error: 'Refresh token has expired',
        error_code: 'InvalidSession',
      },
    });
    expect(mockInsertOne).not.toHaveBeenCalled();
  });

  it('should generate different access tokens each time', async () => {
    mockFindOne.mockResolvedValue({
      token: 'valid-refresh-token',
      type: 'refresh',
      expiresAt: new Date(Date.now() + 1000000),
    } as any);

    const params1 = mockRouteParams({});
    params1.headers = { authorization: 'Bearer valid-refresh-token' };

    const params2 = mockRouteParams({});
    params2.headers = { authorization: 'Bearer valid-refresh-token' };

    const result1 = await refreshSession(params1);
    const result2 = await refreshSession(params2);

    expect((result1.data as any).access_token).not.toBe((result2.data as any).access_token);
  });

  it('should store new access token with correct expiration', async () => {
    mockFindOne.mockResolvedValue({
      token: 'valid-refresh-token',
      type: 'refresh',
      expiresAt: new Date(Date.now() + 1000000),
    } as any);

    const params = mockRouteParams({});
    params.headers = { authorization: 'Bearer valid-refresh-token' };

    await refreshSession(params);

    expect(mockInsertOne).toHaveBeenCalled();
    const insertedToken = mockInsertOne.mock.calls[0][0];

    expect(insertedToken.type).toBe('access');
    expect(insertedToken.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('should return 500 on database error', async () => {
    mockFindOne.mockRejectedValue(new Error('Database connection failed'));

    const params = mockRouteParams({});
    params.headers = { authorization: 'Bearer token123' };

    const result = await refreshSession(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Database connection failed',
        error_code: 'InternalServerError',
      },
    });
  });

  it('should return 500 if token insertion fails', async () => {
    mockFindOne.mockResolvedValue({
      token: 'valid-refresh-token',
      type: 'refresh',
      expiresAt: new Date(Date.now() + 1000000),
    } as any);
    mockInsertOne.mockRejectedValue(new Error('Insert failed'));

    const params = mockRouteParams({});
    params.headers = { authorization: 'Bearer valid-refresh-token' };

    const result = await refreshSession(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Insert failed',
        error_code: 'InternalServerError',
      },
    });
  });
});
