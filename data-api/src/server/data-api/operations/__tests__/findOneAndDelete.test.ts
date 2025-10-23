import { ObjectId } from 'mongodb';
import { findOneAndDelete } from '../findOneAndDelete';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
}));

import { processFilter } from '../../utils';

describe('findOneAndDelete', () => {
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

  it('should find and delete one document successfully', async () => {
    const doc = { _id: new ObjectId(), name: 'Test Doc', status: 'active' };
    mockCollection.findOneAndDelete.mockResolvedValue(doc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
    });

    const result = await findOneAndDelete(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
    expect(mockCollection.findOneAndDelete).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' }, {});
    expect(result).toEqual({
      data: {
        document: doc,
      },
    });
  });

  it('should return null when no document matches', async () => {
    mockCollection.findOneAndDelete.mockResolvedValue(null);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { name: 'Non-existent' },
    });

    const result = await findOneAndDelete(params);

    expect(result).toEqual({
      data: {
        document: null,
      },
    });
  });

  it('should apply projection option', async () => {
    const doc = { name: 'Test Doc' };
    mockCollection.findOneAndDelete.mockResolvedValue(doc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { name: 'Test Doc' },
      projection: { name: 1, _id: 0 },
    });

    await findOneAndDelete(params);

    expect(mockCollection.findOneAndDelete).toHaveBeenCalledWith(
      { name: 'Test Doc' },
      { projection: { name: 1, _id: 0 } }
    );
  });

  it('should apply sort option', async () => {
    const doc = { _id: new ObjectId(), createdAt: new Date() };
    mockCollection.findOneAndDelete.mockResolvedValue(doc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { status: 'active' },
      sort: { createdAt: -1 },
    });

    await findOneAndDelete(params);

    expect(mockCollection.findOneAndDelete).toHaveBeenCalledWith(
      { status: 'active' },
      { sort: { createdAt: -1 } }
    );
  });

  it('should return 400 if required fields are missing', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
    });

    const result = await findOneAndDelete(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection, filter',
        error_code: 'InvalidParameter',
      },
    });
    expect(mockGetDatabase).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    mockCollection.findOneAndDelete.mockRejectedValue(new Error('Delete failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
    });

    const result = await findOneAndDelete(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Delete failed',
        error_code: 'InternalServerError',
      },
    });
  });
});
