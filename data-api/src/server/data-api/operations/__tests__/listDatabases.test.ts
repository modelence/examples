import { listDatabases } from '../listDatabases';
import { getMongoClient } from '../../mongoClient';
import { mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('listDatabases', () => {
  const mockGetMongoClient = getMongoClient as jest.MockedFunction<typeof getMongoClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list databases successfully', async () => {
    const mockAdminDb = {
      listDatabases: jest.fn().mockResolvedValue({
        databases: [
          { name: 'admin', sizeOnDisk: 1024, empty: false },
          { name: 'test-db', sizeOnDisk: 2048, empty: false },
          { name: 'local', sizeOnDisk: 512, empty: false },
        ],
        totalSize: 3584,
      }),
    };

    const mockClient = {
      db: jest.fn().mockReturnValue({
        admin: jest.fn().mockReturnValue(mockAdminDb),
      }),
    };

    mockGetMongoClient.mockResolvedValue(mockClient as any);

    const params = mockRouteParams({
      dataSource: 'test-source',
    });

    const result = await listDatabases(params);

    expect(mockGetMongoClient).toHaveBeenCalled();
    expect(result).toEqual({
      data: {
        databases: [
          { name: 'admin', sizeOnDisk: 1024, empty: false },
          { name: 'test-db', sizeOnDisk: 2048, empty: false },
          { name: 'local', sizeOnDisk: 512, empty: false },
        ],
        totalSize: 3584,
      },
    });
  });

  it('should handle empty database list', async () => {
    const mockAdminDb = {
      listDatabases: jest.fn().mockResolvedValue({
        databases: [],
        totalSize: 0,
      }),
    };

    const mockClient = {
      db: jest.fn().mockReturnValue({
        admin: jest.fn().mockReturnValue(mockAdminDb),
      }),
    };

    mockGetMongoClient.mockResolvedValue(mockClient as any);

    const params = mockRouteParams({
      dataSource: 'test-source',
    });

    const result = await listDatabases(params);

    expect(result).toEqual({
      data: {
        databases: [],
        totalSize: 0,
      },
    });
  });

  it('should return 400 if dataSource is missing', async () => {
    const params = mockRouteParams({});

    const result = await listDatabases(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required field: dataSource',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetMongoClient).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    const mockAdminDb = {
      listDatabases: jest.fn().mockRejectedValue(new Error('Permission denied')),
    };

    const mockClient = {
      db: jest.fn().mockReturnValue({
        admin: jest.fn().mockReturnValue(mockAdminDb),
      }),
    };

    mockGetMongoClient.mockResolvedValue(mockClient as any);

    const params = mockRouteParams({
      dataSource: 'test-source',
    });

    const result = await listDatabases(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Permission denied',
        error_code: 'InternalServerError',
      },
    });
  });
});
