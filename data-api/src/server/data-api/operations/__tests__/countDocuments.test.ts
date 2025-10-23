import { countDocuments } from '../countDocuments';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
}));

import { processFilter } from '../../utils';

describe('countDocuments', () => {
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

  it('should count documents successfully with filter', async () => {
    mockCollection.countDocuments.mockResolvedValue(42);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { status: 'active' },
    });

    const result = await countDocuments(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({ status: 'active' });
    expect(mockCollection.countDocuments).toHaveBeenCalledWith({ status: 'active' });
    expect(result).toEqual({
      data: {
        count: 42,
      },
    });
  });

  it('should count all documents when no filter provided', async () => {
    mockCollection.countDocuments.mockResolvedValue(100);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await countDocuments(params);

    expect(mockProcessFilter).toHaveBeenCalledWith({});
    expect(mockCollection.countDocuments).toHaveBeenCalledWith({});
    expect(result).toEqual({
      data: {
        count: 100,
      },
    });
  });

  it('should return 0 when no documents match', async () => {
    mockCollection.countDocuments.mockResolvedValue(0);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { category: 'non-existent' },
    });

    const result = await countDocuments(params);

    expect(result).toEqual({
      data: {
        count: 0,
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
    });

    const result = await countDocuments(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockCollection.countDocuments.mockRejectedValue(new Error('Count failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await countDocuments(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Count failed',
        error_code: 'InternalServerError',
      },
    });
  });
});
