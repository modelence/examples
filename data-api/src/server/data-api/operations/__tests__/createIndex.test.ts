import { createIndex } from '../createIndex';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('createIndex', () => {
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

  it('should create an index successfully', async () => {
    mockCollection.indexes.mockResolvedValueOnce([
      { name: '_id_' },
    ]).mockResolvedValueOnce([
      { name: '_id_' },
      { name: 'name_1' },
    ]);
    mockCollection.createIndex.mockResolvedValue('name_1');

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      keys: { name: 1 },
    });

    const result = await createIndex(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockCollection.createIndex).toHaveBeenCalledWith({ name: 1 }, {});
    expect(result).toEqual({
      data: {
        createdCollectionAutomatically: false,
        numIndexesBefore: 1,
        numIndexesAfter: 2,
        ok: 1,
      },
    });
  });

  it('should create a compound index', async () => {
    mockCollection.indexes.mockResolvedValueOnce([{ name: '_id_' }]).mockResolvedValueOnce([{ name: '_id_' }, { name: 'name_1_email_1' }]);
    mockCollection.createIndex.mockResolvedValue('name_1_email_1');

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      keys: { name: 1, email: 1 },
    });

    await createIndex(params);

    expect(mockCollection.createIndex).toHaveBeenCalledWith({ name: 1, email: 1 }, {});
  });

  it('should create index with options', async () => {
    mockCollection.indexes.mockResolvedValue([{ name: '_id_' }]);
    mockCollection.createIndex.mockResolvedValue('email_unique');

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      keys: { email: 1 },
      options: {
        name: 'email_unique',
        unique: true,
        sparse: true,
      },
    });

    await createIndex(params);

    expect(mockCollection.createIndex).toHaveBeenCalledWith(
      { email: 1 },
      { name: 'email_unique', unique: true, sparse: true }
    );
  });

  it('should support special index types', async () => {
    mockCollection.indexes.mockResolvedValue([{ name: '_id_' }]);
    mockCollection.createIndex.mockResolvedValue('location_2dsphere');

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      keys: { location: '2dsphere' },
    });

    await createIndex(params);

    expect(mockCollection.createIndex).toHaveBeenCalledWith({ location: '2dsphere' }, {});
  });

  it('should return 400 if keys is not an object', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      keys: ['name', 'email'],
    });

    const result = await createIndex(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'keys must be an object specifying field names and index directions',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 400 if index direction is invalid', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      keys: { name: 2 },
    });

    const result = await createIndex(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: "Invalid index direction for field 'name': must be 1, -1, '2d', '2dsphere', 'text', or 'hashed'",
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await createIndex(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'keys is required',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockCollection.indexes.mockResolvedValue([{ name: '_id_' }]);
    mockCollection.createIndex.mockRejectedValue(new Error('Index already exists'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      keys: { name: 1 },
    });

    const result = await createIndex(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Index already exists',
        error_code: 'InternalServerError',
      },
    });
  });
});
