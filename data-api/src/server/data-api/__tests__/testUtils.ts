import { ObjectId } from 'mongodb';

export const createMockCollection = () => {
  const mockFind = jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    project: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue([]),
  });

  return {
    insertOne: jest.fn().mockResolvedValue({
      insertedId: new ObjectId(),
      acknowledged: true,
    }),
    insertMany: jest.fn().mockResolvedValue({
      insertedIds: { 0: new ObjectId(), 1: new ObjectId() },
      insertedCount: 2,
      acknowledged: true,
    }),
    find: mockFind,
    findOne: jest.fn().mockResolvedValue(null),
    updateOne: jest.fn().mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
      acknowledged: true,
    }),
    updateMany: jest.fn().mockResolvedValue({
      matchedCount: 2,
      modifiedCount: 2,
      acknowledged: true,
    }),
    deleteOne: jest.fn().mockResolvedValue({
      deletedCount: 1,
      acknowledged: true,
    }),
    deleteMany: jest.fn().mockResolvedValue({
      deletedCount: 2,
      acknowledged: true,
    }),
    replaceOne: jest.fn().mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
      acknowledged: true,
    }),
    countDocuments: jest.fn().mockResolvedValue(10),
    estimatedDocumentCount: jest.fn().mockResolvedValue(100),
    aggregate: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    }),
    bulkWrite: jest.fn().mockResolvedValue({
      insertedCount: 1,
      matchedCount: 1,
      modifiedCount: 1,
      deletedCount: 1,
      upsertedCount: 0,
      upsertedIds: {},
    }),
    findOneAndUpdate: jest.fn().mockResolvedValue({
      value: { _id: new ObjectId(), name: 'test' },
    }),
    findOneAndReplace: jest.fn().mockResolvedValue({
      value: { _id: new ObjectId(), name: 'test' },
    }),
    findOneAndDelete: jest.fn().mockResolvedValue({
      value: { _id: new ObjectId(), name: 'test' },
    }),
    distinct: jest.fn().mockResolvedValue(['value1', 'value2']),
    createIndex: jest.fn().mockResolvedValue('index_name'),
    dropIndex: jest.fn().mockResolvedValue({}),
    indexes: jest.fn().mockResolvedValue([]),
  };
};

export const createMockDatabase = () => {
  const mockCollection = createMockCollection();

  return {
    collection: jest.fn().mockReturnValue(mockCollection),
    listCollections: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    }),
    createCollection: jest.fn().mockResolvedValue(mockCollection),
    dropCollection: jest.fn().mockResolvedValue(true),
    admin: jest.fn().mockReturnValue({
      listDatabases: jest.fn().mockResolvedValue({
        databases: [],
      }),
    }),
    command: jest.fn().mockResolvedValue({}),
  };
};

export const mockRouteParams = (body: any) => ({
  body,
  params: {},
  query: {},
  headers: {},
  session: {},
});
