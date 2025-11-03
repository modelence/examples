import { dropCollection } from '../dropCollection';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('dropCollection', () => {
  const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;
  let mockDb: ReturnType<typeof createMockDatabase>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockGetDatabase.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should drop a collection successfully', async () => {
    mockDb.dropCollection.mockResolvedValue(true);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await dropCollection(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.dropCollection).toHaveBeenCalledWith('test-collection');
    expect(result).toEqual({
      data: {
        ok: 1,
      },
    });
  });

  it('should return ok: 0 when drop returns false', async () => {
    mockDb.dropCollection.mockResolvedValue(false);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await dropCollection(params);

    expect(result).toEqual({
      data: {
        ok: 0,
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
    });

    const result = await dropCollection(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'collection is required',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockDb.dropCollection.mockRejectedValue(new Error('Collection not found'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'non-existent',
    });

    const result = await dropCollection(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Collection not found',
        error_code: 'InternalServerError',
      },
    });
  });
});
