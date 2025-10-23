import { ObjectId } from 'mongodb';
import { updateMany } from '../updateMany';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
  processUpdate: jest.fn((update) => update),
}));

import { processFilter, processUpdate } from '../../utils';

describe('updateMany', () => {
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

  it('should update multiple documents successfully', async () => {
    mockCollection.updateMany.mockResolvedValue({
      matchedCount: 5,
      modifiedCount: 5,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { status: 'pending' },
      update: { $set: { status: 'active' } },
    });

    const result = await updateMany(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({ status: 'pending' });
    expect(mockProcessUpdate).toHaveBeenCalledWith({ $set: { status: 'active' } });
    expect(mockCollection.updateMany).toHaveBeenCalledWith(
      { status: 'pending' },
      { $set: { status: 'active' } },
      { upsert: false }
    );
    expect(result).toEqual({
      data: {
        matchedCount: 5,
        modifiedCount: 5,
      },
    });
  });

  it('should handle upsert option', async () => {
    const upsertedId = new ObjectId();
    mockCollection.updateMany.mockResolvedValue({
      matchedCount: 0,
      modifiedCount: 0,
      upsertedId,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { category: 'new-category' },
      update: { $set: { active: true } },
      upsert: true,
    });

    const result = await updateMany(params);

    expect(mockCollection.updateMany).toHaveBeenCalledWith(
      { category: 'new-category' },
      { $set: { active: true } },
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
      filter: { status: 'pending' },
      update: { status: 'active' },
    });

    const result = await updateMany(params);

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

    const result = await updateMany(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection, filter, update',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockCollection.updateMany.mockRejectedValue(new Error('Bulk update failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { status: 'pending' },
      update: { $set: { status: 'active' } },
    });

    const result = await updateMany(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Bulk update failed',
        error_code: 'InternalServerError',
      },
    });
  });
});
