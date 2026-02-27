import { useState } from 'react';
import { useRSS } from './hooks/useRSS';
import { Sidebar } from './components/Sidebar';
import { FeedList } from './components/FeedList';
import type { RSSItem } from './lib/rss';

export type ViewMode = 'all' | 'unread' | 'favorites' | string;

function App() {
  const {
    feeds,
    articles,
    isLoading,
    error,
    addFeed,
    removeFeed,
    refreshAll,
    markAsRead,
    toggleBookmark,
    setError
  } = useRSS();

  const [sidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedArticle, setSelectedArticle] = useState<RSSItem | null>(null);

  // Filter articles based on view mode
  const displayedArticles = articles.filter(article => {
    if (viewMode === 'all') return true;
    if (viewMode === 'unread') return !article.read;
    if (viewMode === 'favorites') return article.bookmarked;
    return article.feedId === viewMode; // Filtering by a specific feed
  });

  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden text-zinc-900 font-sans antialiased">

      {/* Sidebar - Feeds Management */}
      <Sidebar
        isOpen={sidebarOpen}
        feeds={feeds}
        onAddFeed={addFeed}
        onRemoveFeed={removeFeed}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isLoading={isLoading}
        onRefresh={refreshAll}
      />

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out`}>
        {/* Error Toast */}
        {error && (
          <div className="absolute top-4 right-4 z-50 bg-red-100 text-red-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-red-200 animate-in fade-in slide-in-from-top-4">
            <span className="flex-1 text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="opacity-70 hover:opacity-100">×</button>
          </div>
        )}

        <div className="flex-1 flex h-full overflow-hidden">
          {/* List of articles */}
          <div className="w-full max-w-xl h-full border-r border-zinc-200 bg-white flex flex-col">
            <FeedList
              articles={displayedArticles}
              onSelect={(article) => {
                setSelectedArticle(article);
                markAsRead(article.id);
              }}
              selectedId={selectedArticle?.id}
              onToggleBookmark={toggleBookmark}
              viewMode={viewMode}
              feeds={feeds}
            />
          </div>

          {/* Article Reader View */}
          <div className="flex-1 h-full bg-zinc-50 overflow-y-auto relative hidden md:block">
            {selectedArticle ? (
              <div className="max-w-3xl mx-auto px-8 py-12 pb-24 animate-in fade-in zoom-in-95 duration-200">
                <a
                  href={selectedArticle.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 bg-blue-50 px-3 py-1.5 rounded-full"
                >
                  Abrir no site original ↗
                </a>

                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-4 leading-tight">
                  {selectedArticle.title}
                </h1>

                <div className="flex items-center gap-3 text-sm text-zinc-500 mb-10 pb-8 border-b border-zinc-200">
                  <span className="font-medium text-zinc-700">{selectedArticle.feedTitle}</span>
                  <span>•</span>
                  <time>{new Date(selectedArticle.pubDate).toLocaleDateString('pt-BR', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}</time>
                  {selectedArticle.author && (
                    <>
                      <span>•</span>
                      <span>{selectedArticle.author}</span>
                    </>
                  )}
                </div>

                <div
                  className="prose prose-zinc prose-lg max-w-none prose-img:rounded-2xl prose-img:shadow-md prose-a:text-blue-600 prose-headings:font-bold prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                <div className="w-16 h-16 mb-4 rounded-full bg-zinc-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-lg font-medium">Selecione um artigo para ler</p>
                <p className="text-sm">Os detalhes aparecerão aqui</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
