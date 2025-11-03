import { ObjectId } from 'mongodb';
import { find } from '../find';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
}));

import { processFilter } from '../../utils';

describe('find', () => {
  const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;
  const mockProcessFilter = processFilter as jest.MockedFunction<typeof processFilter>;
  let mockDb: ReturnType<typeof createMockDatabase>;
  let mockCollection: any;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockCollection = mockDb.collection();
    mockGetDatabase.mockResolvedValue(mockDb);
    mockProcessFilter.mockImplementation((filter) => filter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find documents successfully', async () => {
    const docs = [
      { _id: new ObjectId(), name: 'Doc 1' },
      { _id: new ObjectId(), name: 'Doc 2' },
    ];

    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(docs),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { status: 'active' },
    });

    const result = await find(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({ status: 'active' });
    expect(mockCollection.find).toHaveBeenCalledWith({ status: 'active' }, {});
    expect(result).toEqual({
      data: {
        documents: docs,
      },
    });
  });

  it('should apply limit option', async () => {
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      limit: 10,
    });

    await find(params);

    expect(mockCollection.find).toHaveBeenCalledWith({}, { limit: 10 });
  });

  it('should apply skip option', async () => {
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      skip: 5,
    });

    await find(params);

    expect(mockCollection.find).toHaveBeenCalledWith({}, { skip: 5 });
  });

  it('should apply sort option', async () => {
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      sort: { name: 1 },
    });

    await find(params);

    expect(mockCollection.find).toHaveBeenCalledWith({}, { sort: { name: 1 } });
  });

  it('should apply projection option', async () => {
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      projection: { name: 1, _id: 0 },
    });

    await find(params);

    expect(mockCollection.find).toHaveBeenCalledWith({}, { projection: { name: 1, _id: 0 } });
  });

  it('should apply all options together', async () => {
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { status: 'active' },
      projection: { name: 1 },
      sort: { createdAt: -1 },
      limit: 20,
      skip: 10,
    });

    await find(params);

    expect(mockCollection.find).toHaveBeenCalledWith(
      { status: 'active' },
      {
        projection: { name: 1 },
        sort: { createdAt: -1 },
        limit: 20,
        skip: 10,
      }
    );
  });

  it('should return 400 if limit exceeds maximum', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      limit: 60000,
    });

    const result = await find(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'limit must be between 0 and 50000',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 400 if limit is negative', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      limit: -5,
    });

    const result = await find(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'limit must be between 0 and 50000',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 400 if skip is negative', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      skip: -5,
    });

    const result = await find(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'skip must be >= 0',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should work with all required fields', async () => {
    const params = mockRouteParams({
      dataSource: 'test-datasource',
      database: 'test-db',
      collection: 'test-collection',
    });

    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([{ _id: new ObjectId(), name: 'Test' }]),
    } as any);

    const result = await find(params);

    expect(result).toEqual({
      data: {
        documents: [{ _id: expect.any(Object), name: 'Test' }],
      },
    });
    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
  });

  it('should return 500 on database error', async () => {
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockRejectedValue(new Error('Query failed')),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await find(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Query failed',
        error_code: 'InternalServerError',
      },
    });
  });

  it('should use empty filter when not provided', async () => {
    mockCollection.find.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    await find(params);

    expect(mockProcessFilter).toHaveBeenCalledWith({});
    expect(mockCollection.find).toHaveBeenCalledWith({}, {});
  });
});
