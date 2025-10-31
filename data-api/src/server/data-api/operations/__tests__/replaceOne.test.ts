import { ObjectId } from 'mongodb';
import { replaceOne } from '../replaceOne';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
}));

import { processFilter } from '../../utils';

describe('replaceOne', () => {
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

  it('should replace one document successfully', async () => {
    mockCollection.replaceOne.mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      replacement: { name: 'New Name', status: 'active' },
    });

    const result = await replaceOne(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
    expect(mockCollection.replaceOne).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011' },
      { name: 'New Name', status: 'active' },
      { upsert: false }
    );
    expect(result).toEqual({
      data: {
        matchedCount: 1,
        modifiedCount: 1,
      },
    });
  });

  it('should handle upsert option', async () => {
    const upsertedId = new ObjectId();
    mockCollection.replaceOne.mockResolvedValue({
      matchedCount: 0,
      modifiedCount: 0,
      upsertedId,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { name: 'Non-existent' },
      replacement: { name: 'New Doc', status: 'active' },
      upsert: true,
    });

    const result = await replaceOne(params);

    expect(mockCollection.replaceOne).toHaveBeenCalledWith(
      { name: 'Non-existent' },
      { name: 'New Doc', status: 'active' },
      { upsert: true }
    );
    expect(result).toEqual({
      data: {
        matchedCount: 0,
        modifiedCount: 0,
        upsertedId: upsertedId.toString(),
      },
    });
  });

  it('should return 400 if replacement contains update operators', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      replacement: { $set: { name: 'Invalid' } },
    });

    const result = await replaceOne(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'replacement document cannot contain update operators (keys starting with $)',
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

    const result = await replaceOne(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'filter is required',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockCollection.replaceOne.mockRejectedValue(new Error('Replace failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      replacement: { name: 'Test' },
    });

    const result = await replaceOne(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Replace failed',
        error_code: 'InternalServerError',
      },
    });
  });
});
