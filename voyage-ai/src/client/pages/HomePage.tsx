import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import logo from '@/client/assets/modelence.svg';
import { modelenceMutation, modelenceQuery } from '@modelence/react-query';

interface Document {
  _id: string;
  content: string;
  title: string;
  description: string;
  createdAt: Date;
}

interface SearchResult extends Document {
  score: number;
}

export default function HomePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isAddingDocument, setIsAddingDocument] = useState(false);

  const { data: documents, refetch } = useQuery<Document[]>(modelenceQuery('voyage.getDocuments'));
  const addDocument = useMutation(modelenceMutation('voyage.addDocument'));
  const deleteDocument = useMutation(modelenceMutation('voyage.deleteDocument'));
  const searchSimilar = useMutation(modelenceMutation('voyage.searchSimilar'));

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    await addDocument.mutateAsync({
      title,
      description
    });
    setTitle('');
    setDescription('');
    setIsAddingDocument(false);
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

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Modelence Logo" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Support Chatbot Agentic Memory</h1>
                <p className="text-sm text-slate-500">Powered by Voyage AI</p>
              </div>
            </div>

            <button
              onClick={() => setIsAddingDocument(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-100"
              aria-label="Add new document"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Document
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Semantic Search Card */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-900">Semantic Search</h2>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for similar documents using AI..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                         focus:bg-white transition-all duration-200"
                aria-label="Semantic search query"
              />
              <button
                type="submit"
                disabled={searchSimilar.isPending || !searchQuery.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium
                         hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200
                         hover:shadow-md disabled:hover:shadow-none"
              >
                {searchSimilar.isPending ? 'Searching...' : 'Search'}
              </button>
              {searchResults.length > 0 && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium
                           hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                           transition-all duration-200"
                >
                  Clear
                </button>
              )}
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-6 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Found {searchResults.length} similar {searchResults.length === 1 ? 'document' : 'documents'}
                </div>
                {searchResults.map((result) => (
                  <div
                    key={result._id}
                    className="p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100
                             hover:border-blue-200 transition-all duration-200"
                  >
                    {result.title ? (
                      <>
                        <h3 className="text-base font-semibold text-slate-900 mb-2">{result.title}</h3>
                        <p className="text-sm text-slate-700 leading-relaxed">{result.description}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-700 leading-relaxed">{result.content}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700
                                     rounded-full font-medium">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {(result.score * 100).toFixed(0)}% match
                      </span>
                      <span className="text-slate-500">
                        {new Date(result.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Documents</h2>
              <p className="text-sm text-slate-500 mt-1">
                {documents?.length || 0} {documents?.length === 1 ? 'document' : 'documents'}
              </p>
            </div>
          </div>

          {!documents || documents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No documents yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Get started by creating your first document. Click the "Add Document" button above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <article
                  key={doc._id}
                  className="group bg-white rounded-xl border border-slate-200 p-5
                           hover:shadow-lg hover:border-slate-300 transition-all duration-200
                           focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      {doc.title ? (
                        <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">
                          {doc.title}
                        </h3>
                      ) : (
                        <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">
                          Untitled Document
                        </h3>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(doc.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600
                               hover:bg-red-50 rounded-lg transition-all duration-200
                               focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Delete document"
                      title="Delete document"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {doc.description || doc.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Document Modal */}
      {isAddingDocument && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setIsAddingDocument(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Add New Document</h2>
              <button
                onClick={() => setIsAddingDocument(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg
                         transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="p-6 space-y-4">
              <div>
                <label htmlFor="document-title" className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>
                <input
                  id="document-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                           focus:bg-white transition-all duration-200"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="document-description" className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  id="document-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter document description..."
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                           focus:bg-white transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDocument(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium
                           hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                           transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addDocument.isPending || !title.trim() || !description.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium
                           hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200
                           hover:shadow-md disabled:hover:shadow-none"
                >
                  {addDocument.isPending ? 'Adding...' : 'Add Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
