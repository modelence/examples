import { ObjectId } from 'mongodb';
import { insertMany } from '../insertMany';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('insertMany', () => {
  const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;
  let mockDb: ReturnType<typeof createMockDatabase>;
  let mockCollection: any;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockCollection = mockDb.collection();
    mockGetDatabase.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should insert multiple documents successfully', async () => {
    const id1 = new ObjectId();
    const id2 = new ObjectId();
    const id3 = new ObjectId();

    mockCollection.insertMany.mockResolvedValue({
      insertedIds: { 0: id1, 1: id2, 2: id3 },
      insertedCount: 3,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      documents: [
        { name: 'Doc 1' },
        { name: 'Doc 2' },
        { name: 'Doc 3' },
      ],
    });

    const result = await insertMany(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockCollection.insertMany).toHaveBeenCalledWith([
      { name: 'Doc 1' },
      { name: 'Doc 2' },
      { name: 'Doc 3' },
    ]);
    expect(result).toEqual({
      data: {
        insertedIds: [id1.toString(), id2.toString(), id3.toString()],
      },
    });
  });

  it('should return 400 if documents is not an array', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      documents: { name: 'Not an array' },
    });

    const result = await insertMany(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'documents must be an array',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 400 if documents array is empty', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      documents: [],
    });

    const result = await insertMany(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'documents array cannot be empty',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should work when dataSource is missing (optional field)', async () => {
    const params = mockRouteParams({
      database: 'test-db',
      collection: 'test-collection',
      documents: [{ name: 'Test' }],
    });

    const insertedId1 = new ObjectId();
    const insertedId2 = new ObjectId();
    mockCollection.insertMany.mockResolvedValue({
      insertedIds: { 0: insertedId1, 1: insertedId2 },
      insertedCount: 2,
      acknowledged: true,
    });

    const result = await insertMany(params);

    expect(result).toEqual({
      data: {
        insertedIds: [insertedId1.toString(), insertedId2.toString()],
      },
    });
    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
  });

  it('should return 500 on database error', async () => {
    mockCollection.insertMany.mockRejectedValue(new Error('Bulk insert failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      documents: [{ name: 'Test' }],
    });

    const result = await insertMany(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Bulk insert failed',
        error_code: 'InternalServerError',
      },
    });
  });

  it('should handle single document in array', async () => {
    const id = new ObjectId();
    mockCollection.insertMany.mockResolvedValue({
      insertedIds: { 0: id },
      insertedCount: 1,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      documents: [{ name: 'Single Doc' }],
    });

    const result = await insertMany(params);

    expect(result).toEqual({
      data: {
        insertedIds: [id.toString()],
      },
    });
  });
});
