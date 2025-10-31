import { deleteMany } from '../deleteMany';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
}));

import { processFilter } from '../../utils';

describe('deleteMany', () => {
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

  it('should delete multiple documents successfully', async () => {
    mockCollection.deleteMany.mockResolvedValue({
      deletedCount: 5,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { status: 'inactive' },
    });

    const result = await deleteMany(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({ status: 'inactive' });
    expect(mockCollection.deleteMany).toHaveBeenCalledWith({ status: 'inactive' });
    expect(result).toEqual({
      data: {
        deletedCount: 5,
      },
    });
  });

  it('should return deletedCount 0 when no documents match', async () => {
    mockCollection.deleteMany.mockResolvedValue({
      deletedCount: 0,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { category: 'non-existent' },
    });

    const result = await deleteMany(params);

    expect(result).toEqual({
      data: {
        deletedCount: 0,
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await deleteMany(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'filter is required',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockCollection.deleteMany.mockRejectedValue(new Error('Bulk delete failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { status: 'inactive' },
    });

    const result = await deleteMany(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Bulk delete failed',
        error_code: 'InternalServerError',
      },
    });
  });
});
