import { withAuth } from '../withAuth';
import { authenticateToken } from '../auth';
import { mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../auth');

describe('withAuth', () => {
  const mockAuthenticateToken = authenticateToken as jest.MockedFunction<typeof authenticateToken>;
  const mockHandler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call handler when authentication succeeds', async () => {
    mockAuthenticateToken.mockResolvedValue(null);
    mockHandler.mockResolvedValue({
      data: { success: true },
    });

    const wrappedHandler = withAuth(mockHandler);
    const params = mockRouteParams({ test: 'data' });

    const result = await wrappedHandler(params);

    expect(mockAuthenticateToken).toHaveBeenCalledWith(params);
    expect(mockHandler).toHaveBeenCalledWith(params);
    expect(result).toEqual({ data: { success: true } });
  });

  it('should return auth error when authentication fails', async () => {
    const authError = {
      status: 401,
      data: {
        error: 'Invalid token',
        error_code: 'InvalidSession',
      },
    };
    mockAuthenticateToken.mockResolvedValue(authError);

    const wrappedHandler = withAuth(mockHandler);
    const params = mockRouteParams({ test: 'data' });

    const result = await wrappedHandler(params);

    expect(mockAuthenticateToken).toHaveBeenCalledWith(params);
    expect(mockHandler).not.toHaveBeenCalled();
    expect(result).toEqual(authError);
  });

  it('should not call handler if authentication returns error', async () => {
    mockAuthenticateToken.mockResolvedValue({
      status: 401,
      data: {
        error: 'Missing Authorization header',
        error_code: 'MissingAuthInfo',
      },
    });

    const wrappedHandler = withAuth(mockHandler);
    const params = mockRouteParams({});

    await wrappedHandler(params);

    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should pass through handler errors', async () => {
    mockAuthenticateToken.mockResolvedValue(null);
    const handlerError = {
      status: 500,
      data: {
        error: 'Handler error',
        error_code: 'InternalServerError',
      },
    };
    mockHandler.mockResolvedValue(handlerError);

    const wrappedHandler = withAuth(mockHandler);
    const params = mockRouteParams({});

    const result = await wrappedHandler(params);

    expect(result).toEqual(handlerError);
  });

  it('should work with different handler response types', async () => {
    mockAuthenticateToken.mockResolvedValue(null);
    mockHandler.mockResolvedValue({
      data: { count: 42, items: ['a', 'b', 'c'] },
    });

    const wrappedHandler = withAuth(mockHandler);
    const params = mockRouteParams({});

    const result = await wrappedHandler(params);

    expect(result).toEqual({
      data: { count: 42, items: ['a', 'b', 'c'] },
    });
  });
});
