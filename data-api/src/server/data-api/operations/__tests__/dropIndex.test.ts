import { dropIndex } from '../dropIndex';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('dropIndex', () => {
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

  it('should drop an index successfully', async () => {
    mockCollection.indexes.mockResolvedValue([
      { name: '_id_' },
      { name: 'name_1' },
      { name: 'status_1' },
    ]);
    mockCollection.dropIndex.mockResolvedValue({});

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      index: 'name_1',
    });

    const result = await dropIndex(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockCollection.indexes).toHaveBeenCalled();
    expect(mockCollection.dropIndex).toHaveBeenCalledWith('name_1');
    expect(result).toEqual({
      data: {
        nIndexesWas: 3,
        ok: 1,
      },
    });
  });

  it('should return 400 if trying to drop _id_ index', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      index: '_id_',
    });

    const result = await dropIndex(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Cannot drop the _id_ index',
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

    const result = await dropIndex(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection, index',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockCollection.indexes.mockResolvedValue([{ name: '_id_' }]);
    mockCollection.dropIndex.mockRejectedValue(new Error('Index not found'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      index: 'nonexistent_index',
    });

    const result = await dropIndex(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Index not found',
        error_code: 'InternalServerError',
      },
    });
  });
});
