import { listCollections } from '../listCollections';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('listCollections', () => {
  const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;
  let mockDb: ReturnType<typeof createMockDatabase>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockGetDatabase.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list collections successfully', async () => {
    mockDb.listCollections.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([
        { name: 'users', type: 'collection' },
        { name: 'posts', type: 'collection' },
        { name: 'comments', type: 'collection' },
      ]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
    });

    const result = await listCollections(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.listCollections).toHaveBeenCalled();
    expect(result).toEqual({
      data: {
        collections: [
          { name: 'users', type: 'collection' },
          { name: 'posts', type: 'collection' },
          { name: 'comments', type: 'collection' },
        ],
      },
    });
  });

  it('should handle empty collection list', async () => {
    mockDb.listCollections.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'empty-db',
    });

    const result = await listCollections(params);

    expect(result).toEqual({
      data: {
        collections: [],
      },
    });
  });

  it('should default type to collection when not provided', async () => {
    mockDb.listCollections.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([
        { name: 'users' },
        { name: 'posts', type: 'view' },
      ]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
    });

    const result = await listCollections(params);

    expect(result).toEqual({
      data: {
        collections: [
          { name: 'users', type: 'collection' },
          { name: 'posts', type: 'view' },
        ],
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
    });

    const result = await listCollections(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockDb.listCollections.mockReturnValue({
      toArray: jest.fn().mockRejectedValue(new Error('List failed')),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
    });

    const result = await listCollections(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'List failed',
        error_code: 'InternalServerError',
      },
    });
  });
});
