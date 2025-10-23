import { listIndexes } from '../listIndexes';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('listIndexes', () => {
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

  it('should list indexes successfully', async () => {
    mockCollection.indexes.mockResolvedValue([
      { v: 2, key: { _id: 1 }, name: '_id_' },
      { v: 2, key: { name: 1 }, name: 'name_1', unique: false },
      { v: 2, key: { email: 1 }, name: 'email_1', unique: true },
    ]);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await listIndexes(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockCollection.indexes).toHaveBeenCalled();
    expect(result).toEqual({
      data: {
        indexes: [
          { v: 2, key: { _id: 1 }, name: '_id_' },
          { v: 2, key: { name: 1 }, name: 'name_1', unique: false },
          { v: 2, key: { email: 1 }, name: 'email_1', unique: true },
        ],
      },
    });
  });

  it('should return only default _id index for new collection', async () => {
    mockCollection.indexes.mockResolvedValue([
      { v: 2, key: { _id: 1 }, name: '_id_' },
    ]);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'new-collection',
    });

    const result = await listIndexes(params);

    expect(result).toEqual({
      data: {
        indexes: [{ v: 2, key: { _id: 1 }, name: '_id_' }],
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
    });

    const result = await listIndexes(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockCollection.indexes.mockRejectedValue(new Error('Collection not found'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'non-existent',
    });

    const result = await listIndexes(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Collection not found',
        error_code: 'InternalServerError',
      },
    });
  });
});
