import { ObjectId } from 'mongodb';
import { insertOne } from '../insertOne';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('insertOne', () => {
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

  it('should insert a document successfully', async () => {
    const insertedId = new ObjectId();
    mockCollection.insertOne.mockResolvedValue({
      insertedId,
      acknowledged: true,
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      document: { name: 'Test Document' },
    });

    const result = await insertOne(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockCollection.insertOne).toHaveBeenCalledWith({ name: 'Test Document' });
    expect(result).toEqual({
      data: {
        insertedId: insertedId.toString(),
      },
    });
  });

  it('should return 400 if dataSource is missing', async () => {
    const params = mockRouteParams({
      database: 'test-db',
      collection: 'test-collection',
      document: { name: 'Test' },
    });

    const result = await insertOne(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection, document',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 400 if database is missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      collection: 'test-collection',
      document: { name: 'Test' },
    });

    const result = await insertOne(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection, document',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 400 if collection is missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      document: { name: 'Test' },
    });

    const result = await insertOne(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection, document',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 400 if document is missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await insertOne(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection, document',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockCollection.insertOne.mockRejectedValue(new Error('Database connection failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      document: { name: 'Test' },
    });

    const result = await insertOne(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Database connection failed',
        error_code: 'InternalServerError',
      },
    });
  });

  it('should handle complex documents', async () => {
    const insertedId = new ObjectId();
    mockCollection.insertOne.mockResolvedValue({
      insertedId,
      acknowledged: true,
    });

    const complexDocument = {
      name: 'Complex Doc',
      nested: {
        field: 'value',
        array: [1, 2, 3],
      },
      tags: ['tag1', 'tag2'],
      count: 42,
    };

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      document: complexDocument,
    });

    const result = await insertOne(params);

    expect(mockCollection.insertOne).toHaveBeenCalledWith(complexDocument);
    expect(result.data).toHaveProperty('insertedId');
  });
});
