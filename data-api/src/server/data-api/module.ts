import { Module } from 'modelence/server';

// Import all operation handlers
import { insertOne } from './operations/insertOne';
import { insertMany } from './operations/insertMany';
import { findOne } from './operations/findOne';
import { find } from './operations/find';
import { updateOne } from './operations/updateOne';
import { updateMany } from './operations/updateMany';
import { replaceOne } from './operations/replaceOne';
import { deleteOne } from './operations/deleteOne';
import { deleteMany } from './operations/deleteMany';
import { aggregate } from './operations/aggregate';
import { listCollections } from './operations/listCollections';
import { createCollection } from './operations/createCollection';
import { dropCollection } from './operations/dropCollection';
import { listDatabases } from './operations/listDatabases';
import { createIndex } from './operations/createIndex';
import { dropIndex } from './operations/dropIndex';
import { listIndexes } from './operations/listIndexes';
import { runCommand } from './operations/runCommand';
import { countDocuments } from './operations/countDocuments';
import { estimatedDocumentCount } from './operations/estimatedDocumentCount';
import { login } from './providers/api-key/login';
import { refreshSession } from './auth/session';
import { dataApiTokens } from './db';
import { withAuth } from './middleware/withAuth';

export default new Module('dataApi', {
  stores: [
    dataApiTokens,
  ],
  queries: {},
  mutations: {},
  configSchema: {
    apiKey: {
      type: 'string',
      isPublic: false,
      default: false,
    },
  },
  routes: [
    // Authentication
    {
      path: '/auth/providers/api-key/login',
      handlers: {
        post: login
      }
    },
    {
      path: '/auth/session',
      handlers: {
        post: refreshSession
      }
    },
    
    // CRUD Operations
    {
      path: '/data/v1/action/insertOne',
      handlers: {
        post: withAuth(insertOne)
      }
    },
    {
      path: '/data/v1/action/insertMany',
      handlers: {
        post: withAuth(insertMany)
      }
    },
    {
      path: '/data/v1/action/findOne',
      handlers: {
        post: withAuth(findOne)
      }
    },
    {
      path: '/data/v1/action/find',
      handlers: {
        post: withAuth(find)
      }
    },
    {
      path: '/data/v1/action/updateOne',
      handlers: {
        post: withAuth(updateOne)
      }
    },
    {
      path: '/data/v1/action/updateMany',
      handlers: {
        post: withAuth(updateMany)
      }
    },
    {
      path: '/data/v1/action/replaceOne',
      handlers: {
        post: withAuth(replaceOne)
      }
    },
    {
      path: '/data/v1/action/deleteOne',
      handlers: {
        post: withAuth(deleteOne)
      }
    },
    {
      path: '/data/v1/action/deleteMany',
      handlers: {
        post: withAuth(deleteMany)
      }
    },
    
    // Aggregation & Querying
    {
      path: '/data/v1/action/aggregate',
      handlers: {
        post: withAuth(aggregate)
      }
    },
    
    // Schema & Index Management
    {
      path: '/data/v1/action/listCollections',
      handlers: {
        post: withAuth(listCollections)
      }
    },
    {
      path: '/data/v1/action/createCollection',
      handlers: {
        post: withAuth(createCollection)
      }
    },
    {
      path: '/data/v1/action/dropCollection',
      handlers: {
        post: withAuth(dropCollection)
      }
    },
    {
      path: '/data/v1/action/listDatabases',
      handlers: {
        post: withAuth(listDatabases)
      }
    },
    {
      path: '/data/v1/action/createIndex',
      handlers: {
        post: withAuth(createIndex)
      }
    },
    {
      path: '/data/v1/action/dropIndex',
      handlers: {
        post: withAuth(dropIndex)
      }
    },
    {
      path: '/data/v1/action/listIndexes',
      handlers: {
        post: withAuth(listIndexes)
      }
    },
    
    // Commands & Utilities
    {
      path: '/data/v1/action/runCommand',
      handlers: {
        post: withAuth(runCommand)
      }
    },
    {
      path: '/data/v1/action/countDocuments',
      handlers: {
        post: withAuth(countDocuments)
      }
    },
    {
      path: '/data/v1/action/estimatedDocumentCount',
      handlers: {
        post: withAuth(estimatedDocumentCount)
      }
    }
  ],
});
