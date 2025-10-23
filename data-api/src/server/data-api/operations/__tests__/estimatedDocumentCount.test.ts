import { estimatedDocumentCount } from '../estimatedDocumentCount';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('estimatedDocumentCount', () => {
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

  it('should get estimated document count successfully', async () => {
    mockCollection.estimatedDocumentCount.mockResolvedValue(1000);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await estimatedDocumentCount(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockCollection.estimatedDocumentCount).toHaveBeenCalled();
    expect(result).toEqual({
      data: {
        count: 1000,
      },
    });
  });

  it('should return 0 for empty collection', async () => {
    mockCollection.estimatedDocumentCount.mockResolvedValue(0);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'empty-collection',
    });

    const result = await estimatedDocumentCount(params);

    expect(result).toEqual({
      data: {
        count: 0,
      },
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
    });

    const result = await estimatedDocumentCount(params);

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
    mockCollection.estimatedDocumentCount.mockRejectedValue(new Error('Count failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await estimatedDocumentCount(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Count failed',
        error_code: 'InternalServerError',
      },
    });
  });
});
