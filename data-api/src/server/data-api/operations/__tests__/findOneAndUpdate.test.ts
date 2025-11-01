import { ObjectId } from 'mongodb';
import { findOneAndUpdate } from '../findOneAndUpdate';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
  processUpdate: jest.fn((update) => update),
}));

import { processFilter, processUpdate } from '../../utils';

describe('findOneAndUpdate', () => {
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

  it('should find and update one document successfully', async () => {
    const doc = { _id: new ObjectId(), name: 'Updated Doc', status: 'active' };
    mockCollection.findOneAndUpdate.mockResolvedValue(doc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      update: { $set: { name: 'Updated Doc' } },
    });

    const result = await findOneAndUpdate(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
    expect(mockProcessUpdate).toHaveBeenCalledWith({ $set: { name: 'Updated Doc' } });
    expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011' },
      { $set: { name: 'Updated Doc' } },
      { upsert: false, returnDocument: 'after' }
    );
    expect(result).toEqual({
      data: {
        document: doc,
      },
    });
  });

  it('should handle returnNewDocument option', async () => {
    const oldDoc = { _id: new ObjectId(), name: 'Old Doc' };
    mockCollection.findOneAndUpdate.mockResolvedValue(oldDoc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      update: { $set: { name: 'New Doc' } },
      returnNewDocument: false,
    });

    await findOneAndUpdate(params);

    expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011' },
      { $set: { name: 'New Doc' } },
      { upsert: false, returnDocument: 'before' }
    );
  });

  it('should handle upsert option', async () => {
    const doc = { _id: new ObjectId(), name: 'New Doc' };
    mockCollection.findOneAndUpdate.mockResolvedValue(doc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { name: 'Non-existent' },
      update: { $set: { name: 'New Doc' } },
      upsert: true,
    });

    await findOneAndUpdate(params);

    expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { name: 'Non-existent' },
      { $set: { name: 'New Doc' } },
      { upsert: true, returnDocument: 'after' }
    );
  });

  it('should apply projection and sort options', async () => {
    const doc = { name: 'Test Doc' };
    mockCollection.findOneAndUpdate.mockResolvedValue(doc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { status: 'active' },
      update: { $set: { name: 'Updated' } },
      projection: { name: 1 },
      sort: { createdAt: -1 },
    });

    await findOneAndUpdate(params);

    expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { status: 'active' },
      { $set: { name: 'Updated' } },
      { upsert: false, returnDocument: 'after', projection: { name: 1 }, sort: { createdAt: -1 } }
    );
  });

  it('should return 400 if update does not contain operators', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      update: { name: 'Invalid' },
    });

    const result = await findOneAndUpdate(params);

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

    const result = await findOneAndUpdate(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'filter is required',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockCollection.findOneAndUpdate.mockRejectedValue(new Error('Update failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      update: { $set: { name: 'Test' } },
    });

    const result = await findOneAndUpdate(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Update failed',
        error_code: 'InternalServerError',
      },
    });
  });

  it('should return null when no document matches', async () => {
    mockCollection.findOneAndUpdate.mockResolvedValue(null);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { name: 'Non-existent' },
      update: { $set: { status: 'active' } },
    });

    const result = await findOneAndUpdate(params);

    expect(result).toEqual({
      data: {
        document: null,
      },
    });
  });
});
