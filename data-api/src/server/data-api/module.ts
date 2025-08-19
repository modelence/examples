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

export default new Module('dataApi', {
  stores: [],
  queries: {},
  mutations: {},
  routes: [
    // CRUD Operations
    {
      path: '/data/v1/action/insertOne',
      handlers: {
        post: insertOne
      }
    },
    {
      path: '/data/v1/action/insertMany',
      handlers: {
        post: insertMany
      }
    },
    {
      path: '/data/v1/action/findOne',
      handlers: {
        post: findOne
      }
    },
    {
      path: '/data/v1/action/find',
      handlers: {
        post: find
      }
    },
    {
      path: '/data/v1/action/updateOne',
      handlers: {
        post: updateOne
      }
    },
    {
      path: '/data/v1/action/updateMany',
      handlers: {
        post: updateMany
      }
    },
    {
      path: '/data/v1/action/replaceOne',
      handlers: {
        post: replaceOne
      }
    },
    {
      path: '/data/v1/action/deleteOne',
      handlers: {
        post: deleteOne
      }
    },
    {
      path: '/data/v1/action/deleteMany',
      handlers: {
        post: deleteMany
      }
    },
    
    // Aggregation & Querying
    {
      path: '/data/v1/action/aggregate',
      handlers: {
        post: aggregate
      }
    },
    
    // Schema & Index Management
    {
      path: '/data/v1/action/listCollections',
      handlers: {
        post: listCollections
      }
    },
    {
      path: '/data/v1/action/createCollection',
      handlers: {
        post: createCollection
      }
    },
    {
      path: '/data/v1/action/dropCollection',
      handlers: {
        post: dropCollection
      }
    },
    {
      path: '/data/v1/action/listDatabases',
      handlers: {
        post: listDatabases
      }
    },
    {
      path: '/data/v1/action/createIndex',
      handlers: {
        post: createIndex
      }
    },
    {
      path: '/data/v1/action/dropIndex',
      handlers: {
        post: dropIndex
      }
    },
    {
      path: '/data/v1/action/listIndexes',
      handlers: {
        post: listIndexes
      }
    },
    
    // Commands & Utilities
    {
      path: '/data/v1/action/runCommand',
      handlers: {
        post: runCommand
      }
    },
    {
      path: '/data/v1/action/countDocuments',
      handlers: {
        post: countDocuments
      }
    },
    {
      path: '/data/v1/action/estimatedDocumentCount',
      handlers: {
        post: estimatedDocumentCount
      }
    }
  ],
});
