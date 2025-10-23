import { deleteOne } from '../deleteOne';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
}));

import { processFilter } from '../../utils';

describe('deleteOne', () => {
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

  it('should delete one document successfully', async () => {
    mockCollection.deleteOne.mockResolvedValue({
      deletedCount: 1,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
    });

    const result = await deleteOne(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
    expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
    expect(result).toEqual({
      data: {
        deletedCount: 1,
      },
    });
  });

  it('should return deletedCount 0 when no document matches', async () => {
    mockCollection.deleteOne.mockResolvedValue({
      deletedCount: 0,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { name: 'Non-existent' },
    });

    const result = await deleteOne(params);

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

    const result = await deleteOne(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection, filter',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockCollection.deleteOne.mockRejectedValue(new Error('Delete failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
    });

    const result = await deleteOne(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Delete failed',
        error_code: 'InternalServerError',
      },
    });
  });
});
