import { aggregate } from '../aggregate';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');

describe('aggregate', () => {
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

  it('should execute aggregation pipeline successfully', async () => {
    const aggregateResults = [
      { _id: 'active', count: 10 },
      { _id: 'inactive', count: 5 },
    ];

    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(aggregateResults),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      pipeline: [
        { $match: { type: 'user' } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ],
    });

    const result = await aggregate(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockCollection.aggregate).toHaveBeenCalledWith([
      { $match: { type: 'user' } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    expect(result).toEqual({
      data: {
        documents: aggregateResults,
      },
    });
  });

  it('should handle empty pipeline results', async () => {
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      pipeline: [{ $match: { nonExistent: 'value' } }],
    });

    const result = await aggregate(params);

    expect(result).toEqual({
      data: {
        documents: [],
      },
    });
  });

  it('should handle complex pipeline with multiple stages', async () => {
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([{ total: 100 }]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      pipeline: [
        { $match: { status: 'active' } },
        { $project: { name: 1, amount: 1 } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ],
    });

    await aggregate(params);

    expect(mockCollection.aggregate).toHaveBeenCalledWith([
      { $match: { status: 'active' } },
      { $project: { name: 1, amount: 1 } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);
  });

  it('should return 400 if pipeline is not an array', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      pipeline: { $match: { status: 'active' } },
    });

    const result = await aggregate(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'pipeline must be an array of aggregation stages',
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

    const result = await aggregate(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection, pipeline',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockRejectedValue(new Error('Aggregation failed')),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      pipeline: [{ $match: { status: 'active' } }],
    });

    const result = await aggregate(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Aggregation failed',
        error_code: 'InternalServerError',
      },
    });
  });

  it('should handle empty pipeline array', async () => {
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      pipeline: [],
    });

    const result = await aggregate(params);

    expect(mockCollection.aggregate).toHaveBeenCalledWith([]);
    expect(result.data).toHaveProperty('documents');
  });
});
