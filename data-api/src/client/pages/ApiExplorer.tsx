import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Endpoint {
  path: string;
  method: string;
  category: string;
  description: string;
  exampleRequest: any;
  requiresAuth: boolean;
}

interface ApiResponse {
  data?: any;
  error?: string;
  error_code?: string;
  status?: number;
}

const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [requestBody, setRequestBody] = useState<string>('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState<string>('');

  const endpoints: Endpoint[] = [
    // Authentication
    {
      path: '/auth/providers/api-key/login',
      method: 'POST',
      category: 'Authentication',
      description: 'Login with API key to get access and refresh tokens',
      exampleRequest: { key: 'your-api-key' },
      requiresAuth: false
    },
    {
      path: '/auth/session',
      method: 'POST',
      category: 'Authentication',
      description: 'Refresh access token using refresh token',
      exampleRequest: { refreshToken: 'your-refresh-token' },
      requiresAuth: false
    },

    // CRUD Operations
    {
      path: '/data/v1/action/insertOne',
      method: 'POST',
      category: 'CRUD Operations',
      description: 'Insert a single document into a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        document: { name: 'Sample Listing', price: 100 }
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/insertMany',
      method: 'POST',
      category: 'CRUD Operations',
      description: 'Insert multiple documents into a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        documents: [
          { name: 'Listing 1', price: 100 },
          { name: 'Listing 2', price: 200 }
        ]
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/findOne',
      method: 'POST',
      category: 'CRUD Operations',
      description: 'Find a single document in a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        filter: { price: { $lt: 100 } }
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/find',
      method: 'POST',
      category: 'CRUD Operations',
      description: 'Find multiple documents in a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        filter: { price: { $lt: 100 } },
        limit: 10
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/updateOne',
      method: 'POST',
      category: 'CRUD Operations',
      description: 'Update a single document in a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        filter: { _id: 'ObjectId("...")' },
        update: { $set: { price: 150 } }
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/updateMany',
      method: 'POST',
      category: 'CRUD Operations',
      description: 'Update multiple documents in a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        filter: { price: { $lt: 100 } },
        update: { $set: { discount: true } }
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/replaceOne',
      method: 'POST',
      category: 'CRUD Operations',
      description: 'Replace a single document in a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        filter: { _id: 'ObjectId("...")' },
        replacement: { name: 'Updated Listing', price: 200, updated: true }
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/deleteOne',
      method: 'POST',
      category: 'CRUD Operations',
      description: 'Delete a single document from a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        filter: { _id: 'ObjectId("...")' }
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/deleteMany',
      method: 'POST',
      category: 'CRUD Operations',
      description: 'Delete multiple documents from a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        filter: { price: { $lt: 50 } }
      },
      requiresAuth: true
    },

    // Aggregation & Querying
    {
      path: '/data/v1/action/aggregate',
      method: 'POST',
      category: 'Aggregation & Querying',
      description: 'Perform aggregation pipeline on a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        pipeline: [
          { $match: { price: { $lt: 100 } } },
          { $group: { _id: null, avgPrice: { $avg: '$price' } } }
        ]
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/distinct',
      method: 'POST',
      category: 'Aggregation & Querying',
      description: 'Get distinct values for a field in a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        field: 'property_type',
        filter: { price: { $lt: 100 } }
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/countDocuments',
      method: 'POST',
      category: 'Aggregation & Querying',
      description: 'Count documents in a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        filter: { price: { $lt: 100 } }
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/estimatedDocumentCount',
      method: 'POST',
      category: 'Aggregation & Querying',
      description: 'Get estimated document count for a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews'
      },
      requiresAuth: true
    },

    // FindAndModify Operations
    {
      path: '/data/v1/action/findOneAndDelete',
      method: 'POST',
      category: 'FindAndModify Operations',
      description: 'Find a document and delete it in one atomic operation',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        filter: { _id: 'ObjectId("...")' },
        projection: { name: 1, price: 1 }
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/findOneAndReplace',
      method: 'POST',
      category: 'FindAndModify Operations',
      description: 'Find a document and replace it in one atomic operation',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        filter: { _id: 'ObjectId("...")' },
        replacement: { name: 'New Listing', price: 250 },
        returnNewDocument: true
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/findOneAndUpdate',
      method: 'POST',
      category: 'FindAndModify Operations',
      description: 'Find a document and update it in one atomic operation',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        filter: { _id: 'ObjectId("...")' },
        update: { $set: { price: 175 } },
        returnNewDocument: true
      },
      requiresAuth: true
    },

    // Bulk Operations
    {
      path: '/data/v1/action/bulkWrite',
      method: 'POST',
      category: 'Bulk Operations',
      description: 'Perform multiple write operations in a single request',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        operations: [
          {
            insertOne: {
              document: { name: 'New Listing 1', price: 100 }
            }
          },
          {
            updateOne: {
              filter: { _id: 'ObjectId("...")' },
              update: { $set: { price: 150 } }
            }
          },
          {
            deleteOne: {
              filter: { _id: 'ObjectId("...")' }
            }
          }
        ]
      },
      requiresAuth: true
    },

    // Schema & Index Management
    {
      path: '/data/v1/action/listCollections',
      method: 'POST',
      category: 'Schema & Index Management',
      description: 'List all collections in a database',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb'
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/createCollection',
      method: 'POST',
      category: 'Schema & Index Management',
      description: 'Create a new collection in a database',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'newCollection'
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/dropCollection',
      method: 'POST',
      category: 'Schema & Index Management',
      description: 'Drop a collection from a database',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'collectionToDrop'
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/listDatabases',
      method: 'POST',
      category: 'Schema & Index Management',
      description: 'List all databases in a data source',
      exampleRequest: {
        dataSource: 'Cluster0'
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/createIndex',
      method: 'POST',
      category: 'Schema & Index Management',
      description: 'Create an index on a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        keys: { price: 1 },
        options: {
          name: 'price_index',
        },
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/dropIndex',
      method: 'POST',
      category: 'Schema & Index Management',
      description: 'Drop an index from a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews',
        index: 'price_index'
      },
      requiresAuth: true
    },
    {
      path: '/data/v1/action/listIndexes',
      method: 'POST',
      category: 'Schema & Index Management',
      description: 'List all indexes on a collection',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        collection: 'listingsAndReviews'
      },
      requiresAuth: true
    },

    // Commands & Utilities
    {
      path: '/data/v1/action/runCommand',
      method: 'POST',
      category: 'Commands & Utilities',
      description: 'Run a database command',
      exampleRequest: {
        dataSource: 'Cluster0',
        database: 'sample_airbnb',
        command: { ping: 1 }
      },
      requiresAuth: true
    }
  ];

  const categories = [...new Set(endpoints.map(ep => ep.category))];

  const handleEndpointSelect = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(JSON.stringify(endpoint.exampleRequest, null, 2));
    setResponse(null);
  };

  const handleLogin = async () => {
    if (!apiKey.trim()) {
      setLoginError('Please enter an API key');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');
    try {
      console.log('Attempting login with key:', apiKey);
      
      const response = await fetch('/auth/providers/api-key/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey })
      });

      const data = await response.json();
      console.log('Login response:', response.status, data);
      
      if (response.ok) {
        setAuthToken(data.access_token);
        setLoginSuccess('Authentication successful! You can now close this modal.');
        toast.success('Authentication successful!');
      } else {
        setLoginError(data.error || 'Authentication failed');
        toast.error(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please try again.');
      toast.error('Authentication failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const executeRequest = async () => {
    if (!selectedEndpoint) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (selectedEndpoint.requiresAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(selectedEndpoint.path, {
        method: selectedEndpoint.method,
        headers,
        body: requestBody
      });

      const responseData = await response.json();
      
      setResponse({
        data: responseData,
        status: response.status
      });

      if (response.ok) {
        toast.success('Request executed successfully!');
      } else {
        toast.error(responseData.error || 'Request failed');
      }
    } catch (error) {
      setResponse({
        error: error instanceof Error ? error.message : 'Request failed'
      });
      toast.error('Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
    setLoginError('');
    setLoginSuccess('');
    setApiKey('');
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setLoginError('');
    setLoginSuccess('');
    setApiKey('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Authentication Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h2 className="text-xl font-semibold text-gray-900">API Explorer</h2>
            <div className="flex items-center space-x-4">
              {authToken ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Authenticated</span>
                  <button
                    onClick={() => setAuthToken('')}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Endpoints List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Endpoints</h2>
              </div>
              <div className="p-4 space-y-4">
                {categories.map(category => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
                    <div className="space-y-1">
                      {endpoints
                        .filter(ep => ep.category === category)
                        .map(endpoint => (
                          <button
                            key={endpoint.path}
                            onClick={() => handleEndpointSelect(endpoint)}
                            className={`w-full text-left p-2 rounded text-sm hover:bg-gray-50 ${
                              selectedEndpoint?.path === endpoint.path
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'text-gray-600'
                            }`}
                          >
                            <div className="font-mono text-xs">{endpoint.method}</div>
                            <div className="truncate">{endpoint.path}</div>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Request/Response Panel */}
          <div className="lg:col-span-2">
            {selectedEndpoint ? (
              <div className="space-y-6">
                {/* Endpoint Info */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      selectedEndpoint.method === 'POST' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEndpoint.method}
                    </span>
                    <code className="text-sm font-mono text-gray-900">{selectedEndpoint.path}</code>
                  </div>
                  <p className="text-gray-600 mb-4">{selectedEndpoint.description}</p>
                  {selectedEndpoint.requiresAuth && !authToken && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm text-yellow-800">
                        This endpoint requires authentication. Please login first.
                      </p>
                    </div>
                  )}
                </div>

                {/* Request */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Request Body</h3>
                  </div>
                  <div className="p-4">
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full h-48 p-3 border border-gray-300 rounded-md font-mono text-sm"
                      placeholder="Enter JSON request body..."
                    />
                    <div className="mt-3 flex justify-between items-center">
                      <button
                        onClick={() => setRequestBody(JSON.stringify(selectedEndpoint.exampleRequest, null, 2))}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Reset to Example
                      </button>
                      <button
                        onClick={() => copyToClipboard(requestBody)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Execute Button */}
                <div className="flex justify-center">
                  <button
                    onClick={executeRequest}
                    disabled={isLoading || (selectedEndpoint.requiresAuth && !authToken)}
                    className={`px-6 py-3 rounded-md font-medium ${
                      isLoading || (selectedEndpoint.requiresAuth && !authToken)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Executing...' : 'Execute Request'}
                  </button>
                </div>

                {/* Response */}
                {response && (
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-900">Response</h3>
                      {response.status && (
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                          response.status >= 200 && response.status < 300
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {response.status}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <pre className="bg-gray-50 p-3 rounded-md overflow-x-auto text-sm">
                        {JSON.stringify(response.data || response, null, 2)}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(response.data || response, null, 2))}
                        className="mt-3 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Copy Response
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="text-gray-400 mb-6">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
                <div className="text-left text-gray-600 space-y-3 max-w-2xl mx-auto">
                  <p className="text-center text-gray-500 mt-4">
                    Choose an endpoint from the left panel to start testing the API
                  </p>
                  <p>
                    Endpoints require authentication bearer to be passed every time. Thus first we need to call the 
                    <b> /api-key/login</b> endpoint to generate an authentication token and use it for other endpoints.
                  </p>
                  <p>
                    To simplify this process, we've introduced a login button above. Once authenticated, you can explore and test all Data API endpoints 
                    including CRUD operations, aggregation pipelines, and database management commands.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Login with API Key</h3>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full p-2 border border-gray-300 rounded-md mb-4"
              />
              {loginError && (
                <div className="bg-red-100 border border-red-200 rounded-md p-2 text-red-800 text-sm">
                  {loginError}
                </div>
              )}
              {loginSuccess && (
                <div className="bg-green-100 border border-green-200 rounded-md p-2 text-green-800 text-sm">
                  {loginSuccess}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                {loginSuccess ? (
                  <button
                    onClick={closeAuthModal}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      onClick={closeAuthModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogin}
                      disabled={isLoggingIn}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {isLoggingIn ? 'Logging In...' : 'Login'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiExplorer;
