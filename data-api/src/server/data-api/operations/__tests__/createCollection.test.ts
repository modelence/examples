import { createCollection } from '../createCollection';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('createCollection', () => {
  const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;
  let mockDb: ReturnType<typeof createMockDatabase>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockGetDatabase.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a collection successfully', async () => {
    mockDb.createCollection.mockResolvedValue({} as any);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'new-collection',
    });

    const result = await createCollection(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.createCollection).toHaveBeenCalledWith('new-collection');
    expect(result).toEqual({
      data: {
        ok: 1,
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
    });

    const result = await createCollection(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 400 if collection name contains $', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'invalid$collection',
    });

    const result = await createCollection(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: "Invalid collection name: cannot contain '$' or start with 'system.'",
        error_code: 'InvalidParameter',
      },
    });
    expect(mockDb.createCollection).not.toHaveBeenCalled();
  });

  it('should return 400 if collection name starts with system.', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'system.indexes',
    });

    const result = await createCollection(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: "Invalid collection name: cannot contain '$' or start with 'system.'",
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockDb.createCollection.mockRejectedValue(new Error('Collection already exists'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await createCollection(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Collection already exists',
        error_code: 'InternalServerError',
      },
    });
  });
});
