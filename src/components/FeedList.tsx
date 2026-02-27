import type { RSSItem, RSSFeed } from '../lib/rss';
import { Bookmark, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ViewMode } from '../App';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FeedListProps {
    articles: RSSItem[];
    onSelect: (item: RSSItem) => void;
    selectedId?: string;
    onToggleBookmark: (id: string) => void;
    viewMode: ViewMode;
    feeds: RSSFeed[];
}

export function FeedList({ articles, onSelect, selectedId, onToggleBookmark, viewMode, feeds }: FeedListProps) {

    const getHeaderTitle = () => {
        switch (viewMode) {
            case 'all': return 'Todos os Artigos';
            case 'unread': return 'Não Lidos';
            case 'favorites': return 'Favoritos';
            default: return feeds.find(f => f.id === viewMode)?.title || 'Feed';
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="h-16 px-6 border-b border-zinc-200 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <h2 className="font-bold text-lg text-zinc-900 tracking-tight">{getHeaderTitle()}</h2>
                <span className="text-sm font-medium text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">{articles.length} itens</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100/50 p-2 space-y-2">
                {articles.length === 0 ? (
                    <div className="p-10 text-center text-zinc-400">
                        <p>Nenhum artigo encontrado para esta visualização.</p>
                    </div>
                ) : (
                    articles.map(article => (
                        <article
                            key={article.id}
                            onClick={() => onSelect(article)}
                            className={cn(
                                "p-4 rounded-xl cursor-pointer transition-all border border-transparent group relative overflow-hidden",
                                selectedId === article.id
                                    ? "bg-orange-50 border-orange-200/50 shadow-sm"
                                    : "hover:bg-zinc-50 hover:border-zinc-200/50"
                            )}
                        >
                            {/* Unread dot indicator */}
                            {!article.read && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full" />
                            )}

                            <div className="flex gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider truncate max-w-[150px]">
                                            {article.feedTitle}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>

                                    <h3 className={cn(
                                        "text-[15px] font-bold leading-snug mb-2 group-hover:text-orange-600 transition-colors line-clamp-2",
                                        article.read ? "text-zinc-600" : "text-zinc-900"
                                    )}>
                                        {article.title}
                                    </h3>

                                    {article.contentSnippet && (
                                        <p className="text-sm text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
                                            {article.contentSnippet}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mt-auto">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleBookmark(article.id);
                                            }}
                                            className={cn(
                                                "p-1.5 rounded-lg transition-colors",
                                                article.bookmarked
                                                    ? "text-orange-500 bg-orange-50"
                                                    : "text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100"
                                            )}
                                        >
                                            <Bookmark size={16} fill={article.bookmarked ? "currentColor" : "none"} />
                                        </button>

                                        {article.read && (
                                            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                                                <CheckCircle2 size={12} /> Lida
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Thumbnail if exists */}
                                {article.thumbnail && (
                                    <div className="w-24 h-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-200/50">
                                        <img
                                            src={article.thumbnail}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
