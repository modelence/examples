import { ObjectId } from 'mongodb';
import { findOne } from '../findOne';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
}));

import { processFilter } from '../../utils';

describe('findOne', () => {
  const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;
  const mockProcessFilter = processFilter as jest.MockedFunction<typeof processFilter>;
  let mockDb: ReturnType<typeof createMockDatabase>;
  let mockCollection: any;

  beforeEach(() => {
    mockDb = createMockDatabase();
    mockCollection = mockDb.collection();
    mockGetDatabase.mockResolvedValue(mockDb);
    mockProcessFilter.mockImplementation((filter) => filter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find one document successfully', async () => {
    const doc = { _id: new ObjectId(), name: 'Test Doc' };
    mockCollection.findOne.mockResolvedValue(doc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
    });

    const result = await findOne(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
    expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' }, {});
    expect(result).toEqual({
      data: {
        document: doc,
      },
    });
  });

  it('should return null when document is not found', async () => {
    mockCollection.findOne.mockResolvedValue(null);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
    });

    const result = await findOne(params);

    expect(result).toEqual({
      data: {
        document: null,
      },
    });
  });

  it('should apply projection option', async () => {
    const doc = { name: 'Test Doc' };
    mockCollection.findOne.mockResolvedValue(doc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { name: 'Test Doc' },
      projection: { name: 1, _id: 0 },
    });

    await findOne(params);

    expect(mockCollection.findOne).toHaveBeenCalledWith(
      { name: 'Test Doc' },
      { projection: { name: 1, _id: 0 } }
    );
  });

  it('should use empty filter when not provided', async () => {
    mockCollection.findOne.mockResolvedValue(null);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    await findOne(params);

    expect(mockProcessFilter).toHaveBeenCalledWith({});
    expect(mockCollection.findOne).toHaveBeenCalledWith({}, {});
  });

  it('should work when dataSource is missing (optional field)', async () => {
    const params = mockRouteParams({
      database: 'test-db',
      collection: 'test-collection',
    });

    const document = { _id: new ObjectId(), name: 'Test' };
    mockCollection.findOne.mockResolvedValue(document);

    const result = await findOne(params);

    expect(result).toEqual({
      data: {
        document: { _id: expect.any(Object), name: 'Test' },
      },
    });
    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
  });

  it('should return 500 on database error', async () => {
    mockCollection.findOne.mockRejectedValue(new Error('Query failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await findOne(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Query failed',
        error_code: 'InternalServerError',
      },
    });
  });
});
