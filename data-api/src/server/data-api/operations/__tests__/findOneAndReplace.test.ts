import { ObjectId } from 'mongodb';
import { findOneAndReplace } from '../findOneAndReplace';
import { getDatabase } from '../../mongoClient';
import { createMockDatabase, mockRouteParams } from '../../__tests__/testUtils';

jest.mock('../../mongoClient');
jest.mock('../../utils', () => ({
  ...jest.requireActual('../../utils'),
  processFilter: jest.fn((filter) => filter),
}));

import { processFilter } from '../../utils';

describe('findOneAndReplace', () => {
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

  it('should find and replace one document successfully', async () => {
    const doc = { _id: new ObjectId(), name: 'Replaced Doc', status: 'active' };
    mockCollection.findOneAndReplace.mockResolvedValue(doc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      replacement: { name: 'Replaced Doc', status: 'active' },
    });

    const result = await findOneAndReplace(params);

    expect(mockGetDatabase).toHaveBeenCalledWith('test-db');
    expect(mockDb.collection).toHaveBeenCalledWith('test-collection');
    expect(mockProcessFilter).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
    expect(mockCollection.findOneAndReplace).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011' },
      { name: 'Replaced Doc', status: 'active' },
      { upsert: false, returnDocument: 'after' }
    );
    expect(result).toEqual({
      data: {
        document: doc,
      },
    });
  });

  it('should handle returnNewDocument option', async () => {
    const oldDoc = { _id: new ObjectId(), name: 'Old Doc' };
    mockCollection.findOneAndReplace.mockResolvedValue(oldDoc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      replacement: { name: 'New Doc' },
      returnNewDocument: false,
    });

    await findOneAndReplace(params);

    expect(mockCollection.findOneAndReplace).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011' },
      { name: 'New Doc' },
      { upsert: false, returnDocument: 'before' }
    );
  });

  it('should handle upsert option', async () => {
    const doc = { _id: new ObjectId(), name: 'New Doc' };
    mockCollection.findOneAndReplace.mockResolvedValue(doc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { name: 'Non-existent' },
      replacement: { name: 'New Doc' },
      upsert: true,
    });

    await findOneAndReplace(params);

    expect(mockCollection.findOneAndReplace).toHaveBeenCalledWith(
      { name: 'Non-existent' },
      { name: 'New Doc' },
      { upsert: true, returnDocument: 'after' }
    );
  });

  it('should apply projection and sort options', async () => {
    const doc = { name: 'Test Doc' };
    mockCollection.findOneAndReplace.mockResolvedValue(doc);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { status: 'active' },
      replacement: { name: 'Updated', status: 'inactive' },
      projection: { name: 1 },
      sort: { createdAt: -1 },
    });

    await findOneAndReplace(params);

    expect(mockCollection.findOneAndReplace).toHaveBeenCalledWith(
      { status: 'active' },
      { name: 'Updated', status: 'inactive' },
      { upsert: false, returnDocument: 'after', projection: { name: 1 }, sort: { createdAt: -1 } }
    );
  });

  it('should return 400 if replacement contains update operators', async () => {
    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      replacement: { $set: { name: 'Invalid' } },
    });

    const result = await findOneAndReplace(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'replacement document cannot contain update operators (keys starting with $)',
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

    const result = await findOneAndReplace(params);

    expect(result).toEqual({
      status: 400,
      data: {
        error: 'Missing required fields: dataSource, database, collection, filter, replacement',
        error_code: 'InvalidParameter',
      },
    });
  });

  it('should return 500 on database error', async () => {
    mockCollection.findOneAndReplace.mockRejectedValue(new Error('Replace failed'));

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { _id: '507f1f77bcf86cd799439011' },
      replacement: { name: 'Test' },
    });

    const result = await findOneAndReplace(params);

    expect(result).toEqual({
      status: 500,
      data: {
        error: 'Replace failed',
        error_code: 'InternalServerError',
      },
    });
  });

  it('should return null when no document matches', async () => {
    mockCollection.findOneAndReplace.mockResolvedValue(null);

    const params = mockRouteParams({
      dataSource: 'test-source',
      database: 'test-db',
      collection: 'test-collection',
      filter: { name: 'Non-existent' },
      replacement: { name: 'New Doc' },
    });

    const result = await findOneAndReplace(params);

    expect(result).toEqual({
      data: {
        document: null,
      },
    });
  });
});
