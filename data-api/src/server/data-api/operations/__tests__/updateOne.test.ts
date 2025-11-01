import { ObjectId } from 'mongodb';
import { updateOne } from '../updateOne';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
  processUpdate: jest.fn((update) => update),
}));

import { processFilter, processUpdate } from '../../utils';

describe('updateOne', () => {
  const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;
  const mockProcessFilter = processFilter as jest.MockedFunction<typeof processFilter>;
  const mockProcessUpdate = processUpdate as jest.MockedFunction<typeof processUpdate>;
  let mockDb: ReturnType<typeof createMockDatabase>;
  let mockCollection: any;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockCollection = mockDb.collection();
    mockGetDatabase.mockResolvedValue(mockDb);
    mockProcessFilter.mockImplementation((filter) => filter);
    mockProcessUpdate.mockImplementation((update) => update);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update one document successfully', async () => {
    mockCollection.updateOne.mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      update: { $set: { name: 'Updated Name' } },
    });

    const result = await updateOne(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
    expect(mockProcessUpdate).toHaveBeenCalledWith({ $set: { name: 'Updated Name' } });
    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011' },
      { $set: { name: 'Updated Name' } },
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
    mockCollection.updateOne.mockResolvedValue({
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
      update: { $set: { name: 'New Name' } },
      upsert: true,
    });

    const result = await updateOne(params);

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { name: 'Non-existent' },
      { $set: { name: 'New Name' } },
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

  it('should return 400 if update does not contain operators', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      update: { name: 'Invalid Update' },
    });

    const result = await updateOne(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'update must contain at least one update operator (e.g., $set, $inc, $push)',
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

    const result = await updateOne(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'filter is required',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockCollection.updateOne.mockRejectedValue(new Error('Update failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      update: { $set: { name: 'Test' } },
    });

    const result = await updateOne(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Update failed',
        error_code: 'InternalServerError',
      },
    });
  });

  it('should handle multiple update operators', async () => {
    mockCollection.updateOne.mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      update: {
        $set: { name: 'Updated' },
        $inc: { count: 1 },
        $push: { tags: 'new-tag' },
      },
    });

    await updateOne(params);

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011' },
      {
        $set: { name: 'Updated' },
        $inc: { count: 1 },
        $push: { tags: 'new-tag' },
      },
      { upsert: false }
    );
  });
});
