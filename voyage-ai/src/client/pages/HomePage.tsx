import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import logo from '@/client/assets/modelence.svg';
import { modelenceMutation, modelenceQuery } from '@modelence/react-query';

interface Document {
  _id: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

interface SearchResult extends Document {
  score: number;
}

export default function HomePage() {
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const { data: documents, refetch } = useQuery<Document[]>(modelenceQuery('voyage.getDocuments'));
  const addDocument = useMutation(modelenceMutation('voyage.addDocument'));
  const deleteDocument = useMutation(modelenceMutation('voyage.deleteDocument'));
  const searchSimilar = useMutation(modelenceMutation('voyage.searchSimilar'));

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addDocument.mutateAsync({ content });
    setContent('');
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteDocument.mutateAsync({ id });
    refetch();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const results = await searchSimilar.mutateAsync({ query: searchQuery, limit: 5 });
    setSearchResults(results as SearchResult[]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Modelence Logo" className="w-20 h-20" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Voyage AI Vector Search</h1>
          <p className="mt-2 text-gray-600">Semantic search with Voyage AI embeddings and MongoDB</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Document Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add Document</h2>
            <form onSubmit={handleAddDocument}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter document content..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              />
              <button
                type="submit"
                disabled={addDocument.isPending}
                className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {addDocument.isPending ? 'Adding...' : 'Add Document'}
              </button>
            </form>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Search Similar</h2>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search query..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={searchSimilar.isPending}
                className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {searchSimilar.isPending ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Results:</h3>
                {searchResults.map((result) => (
                  <div key={result._id} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-800">{result.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Similarity: {(result.score * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Documents Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">All Documents</h2>
          {!documents || documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No documents yet. Add your first document above!</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-800">{doc.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(doc.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
