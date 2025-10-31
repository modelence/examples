import { distinct } from '../distinct';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
}));

import { processFilter } from '../../utils';

describe('distinct', () => {
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

  it('should get distinct values successfully', async () => {
    mockCollection.distinct.mockResolvedValue(['value1', 'value2', 'value3']);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      key: 'status',
    });

    const result = await distinct(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({});
    expect(mockCollection.distinct).toHaveBeenCalledWith('status', {});
    expect(result).toEqual({
      data: {
        values: ['value1', 'value2', 'value3'],
      },
    });
  });

  it('should apply filter when provided', async () => {
    mockCollection.distinct.mockResolvedValue(['active', 'inactive']);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      key: 'status',
      filter: { type: 'user' },
    });

    const result = await distinct(params);

    expect(mockProcessFilter).toHaveBeenCalledWith({ type: 'user' });
    expect(mockCollection.distinct).toHaveBeenCalledWith('status', { type: 'user' });
    expect(result).toEqual({
      data: {
        values: ['active', 'inactive'],
      },
    });
  });

  it('should return 400 if key is not a string', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      key: 123,
    });

    const result = await distinct(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'key must be a string representing the field name',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await distinct(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'key is required',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockCollection.distinct.mockRejectedValue(new Error('Distinct failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      key: 'status',
    });

    const result = await distinct(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Distinct failed',
        error_code: 'InternalServerError',
      },
    });
  });

  it('should handle empty distinct results', async () => {
    mockCollection.distinct.mockResolvedValue([]);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      key: 'nonExistentField',
    });

    const result = await distinct(params);

    expect(result).toEqual({
      data: {
        values: [],
      },
    });
  });
});
