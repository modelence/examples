import { ObjectId } from 'mongodb';
import { bulkWrite } from '../bulkWrite';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
  processUpdate: jest.fn((update) => update),
}));

import { processFilter, processUpdate } from '../../utils';

describe('bulkWrite', () => {
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

  it('should execute bulk write operations successfully', async () => {
    const upsertedId = new ObjectId();
    mockCollection.bulkWrite.mockResolvedValue({
      insertedCount: 2,
      matchedCount: 1,
      modifiedCount: 1,
      deletedCount: 1,
      upsertedCount: 1,
      upsertedIds: { 3: upsertedId },
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      operations: [
        { insertOne: { document: { name: 'Doc 1' } } },
        { insertOne: { document: { name: 'Doc 2' } } },
        { updateOne: { filter: { _id: '507f1f77bcf86cd799439011' }, update: { $set: { name: 'Updated' } } } },
        { deleteOne: { filter: { status: 'old' } } },
      ],
    });

    const result = await bulkWrite(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockCollection.bulkWrite).toHaveBeenCalledWith(
      expect.arrayContaining([
        { insertOne: { document: { name: 'Doc 1' } } },
        { insertOne: { document: { name: 'Doc 2' } } },
        { updateOne: { filter: { _id: '507f1f77bcf86cd799439011' }, update: { $set: { name: 'Updated' } }, upsert: undefined } },
        { deleteOne: { filter: { status: 'old' } } },
      ]),
      { ordered: true }
    );
    expect(result).toEqual({
      data: {
        insertedCount: 2,
        matchedCount: 1,
        modifiedCount: 1,
        deletedCount: 1,
        upsertedCount: 1,
        upsertedIds: { 3: upsertedId.toString() },
      },
    });
  });

  it('should handle insertOne operation', async () => {
    mockCollection.bulkWrite.mockResolvedValue({
      insertedCount: 1,
      matchedCount: 0,
      modifiedCount: 0,
      deletedCount: 0,
      upsertedCount: 0,
      upsertedIds: {},
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      operations: [
        { insertOne: { document: { name: 'Test' } } },
      ],
    });

    await bulkWrite(params);

    expect(mockCollection.bulkWrite).toHaveBeenCalledWith(
      [{ insertOne: { document: { name: 'Test' } } }],
      { ordered: true }
    );
  });

  it('should handle updateMany operation', async () => {
    mockCollection.bulkWrite.mockResolvedValue({
      insertedCount: 0,
      matchedCount: 5,
      modifiedCount: 5,
      deletedCount: 0,
      upsertedCount: 0,
      upsertedIds: {},
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      operations: [
        { updateMany: { filter: { status: 'pending' }, update: { $set: { status: 'active' } }, upsert: false } },
      ],
    });

    await bulkWrite(params);

    expect(mockProcessFilter).toHaveBeenCalledWith({ status: 'pending' });
    expect(mockProcessUpdate).toHaveBeenCalledWith({ $set: { status: 'active' } });
  });

  it('should handle replaceOne operation', async () => {
    mockCollection.bulkWrite.mockResolvedValue({
      insertedCount: 0,
      matchedCount: 1,
      modifiedCount: 1,
      deletedCount: 0,
      upsertedCount: 0,
      upsertedIds: {},
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      operations: [
        { replaceOne: { filter: { _id: '507f1f77bcf86cd799439011' }, replacement: { name: 'New Doc' } } },
      ],
    });

    await bulkWrite(params);

    expect(mockProcessFilter).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
  });

  it('should handle deleteMany operation', async () => {
    mockCollection.bulkWrite.mockResolvedValue({
      insertedCount: 0,
      matchedCount: 0,
      modifiedCount: 0,
      deletedCount: 10,
      upsertedCount: 0,
      upsertedIds: {},
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      operations: [
        { deleteMany: { filter: { status: 'archived' } } },
      ],
    });

    await bulkWrite(params);

    expect(mockProcessFilter).toHaveBeenCalledWith({ status: 'archived' });
  });

  it('should handle ordered option', async () => {
    mockCollection.bulkWrite.mockResolvedValue({
      insertedCount: 1,
      matchedCount: 0,
      modifiedCount: 0,
      deletedCount: 0,
      upsertedCount: 0,
      upsertedIds: {},
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      operations: [{ insertOne: { document: { name: 'Test' } } }],
      ordered: false,
    });

    await bulkWrite(params);

    expect(mockCollection.bulkWrite).toHaveBeenCalledWith(
      expect.any(Array),
      { ordered: false }
    );
  });

  it('should return 400 if operations is not an array', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      operations: { insertOne: { document: { name: 'Test' } } },
    });

    const result = await bulkWrite(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'operations must be a non-empty array',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 400 if operations array is empty', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      operations: [],
    });

    const result = await bulkWrite(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'operations must be a non-empty array',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
    });

    const result = await bulkWrite(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'collection is required',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockCollection.bulkWrite.mockRejectedValue(new Error('Bulk write failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      operations: [{ insertOne: { document: { name: 'Test' } } }],
    });

    const result = await bulkWrite(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Bulk write failed',
        error_code: 'InternalServerError',
      },
    });
  });

  it('should handle empty upsertedIds', async () => {
    mockCollection.bulkWrite.mockResolvedValue({
      insertedCount: 1,
      matchedCount: 0,
      modifiedCount: 0,
      deletedCount: 0,
      upsertedCount: 0,
      upsertedIds: undefined,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      operations: [{ insertOne: { document: { name: 'Test' } } }],
    });

    const result = await bulkWrite(params);

    expect(result).toEqual({
      data: {
        insertedCount: 1,
        matchedCount: 0,
        modifiedCount: 0,
        deletedCount: 0,
        upsertedCount: 0,
        upsertedIds: {},
      },
    });
  });
});
