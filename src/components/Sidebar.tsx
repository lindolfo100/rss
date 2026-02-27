import { useState } from 'react';
import type { RSSFeed } from '../lib/rss';
import type { ViewMode } from '../App';
import {
    Plus,
    Rss,
    Inbox,
    Bookmark,
    Trash2,
    RefreshCw,
    Layers
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
    isOpen: boolean;
    feeds: RSSFeed[];
    onAddFeed: (url: string) => Promise<void>;
    onRemoveFeed: (id: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    isLoading: boolean;
    onRefresh: () => void;
}

export function Sidebar({
    isOpen,
    feeds,
    onAddFeed,
    onRemoveFeed,
    viewMode,
    setViewMode,
    isLoading,
    onRefresh
}: SidebarProps) {
    const [newUrl, setNewUrl] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl.trim()) return;

        setIsAdding(true);
        await onAddFeed(newUrl.trim());
        setNewUrl('');
        setIsAdding(false);
    };

    const NavItem = ({ icon: Icon, label, mode, count }: { icon: any, label: string, mode: ViewMode, count?: number }) => (
        <button
            onClick={() => setViewMode(mode)}
            className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                viewMode === mode
                    ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
        >
            <div className="flex items-center gap-3">
                <Icon className={cn("w-[18px] h-[18px]", viewMode === mode ? "text-zinc-300" : "text-zinc-400 group-hover:text-zinc-600")} />
                <span className="truncate">{label}</span>
            </div>
            {count !== undefined && (
                <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs",
                    viewMode === mode ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                )}>
                    {count}
                </span>
            )}
        </button>
    );

    return (
        <aside
            className={cn(
                "flex flex-col bg-zinc-50 h-full border-r border-zinc-200 transition-all duration-300 ease-in-out shrink-0",
                isOpen ? "w-64" : "w-0 border-r-0 opacity-0 overflow-hidden"
            )}
        >
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm shadow-orange-500/20">
                        <Rss size={18} />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-zinc-900">Super RSS</span>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
                    title="Atualizar todos feeds"
                >
                    <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
                </button>
            </div>

            <div className="px-3 pb-4">
                <form onSubmit={handleAddSubmit} className="relative">
                    <input
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="Adicionar URL do feed..."
                        disabled={isAdding}
                        className="w-full bg-white border border-zinc-200 text-sm rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-60 shadow-sm transition-all text-zinc-800 placeholder:text-zinc-400"
                    />
                    <button
                        type="submit"
                        disabled={isAdding || !newUrl}
                        className="absolute right-1 top-1 p-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        {isAdding ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                    </button>
                </form>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-6 pb-6">

                <div className="space-y-1">
                    <p className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Visualizações</p>
                    <NavItem icon={Layers} label="Todos os Artigos" mode="all" />
                    <NavItem icon={Inbox} label="Não Lidos" mode="unread" />
                    <NavItem icon={Bookmark} label="Favoritos" mode="favorites" />
                </div>

                {feeds.length > 0 && (
                    <div className="space-y-1 mt-4">
                        <div className="px-3 py-2 flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            <span>Feeds Assinados</span>
                            <span className="bg-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded-md text-[10px]">{feeds.length}</span>
                        </div>

                        <div className="space-y-0.5">
                            {feeds.map(feed => (
                                <div key={feed.id} className="relative group/feed flex items-center">
                                    <button
                                        onClick={() => setViewMode(feed.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-left",
                                            viewMode === feed.id
                                                ? "bg-orange-50 text-orange-700 font-medium"
                                                : "text-zinc-600 hover:bg-zinc-100"
                                        )}
                                    >
                                        <div className="w-5 h-5 rounded-md bg-zinc-200 flex items-center justify-center shrink-0 overflow-hidden">
                                            <img
                                                src={`https://www.google.com/s2/favicons?domain=${new URL(feed.link).hostname}&sz=32`}
                                                alt=""
                                                className="w-4 h-4"
                                                onError={(e) => e.currentTarget.style.display = 'none'}
                                            />
                                        </div>
                                        <span className="truncate flex-1">{feed.title}</span>
                                    </button>

                                    <button
                                        onClick={() => onRemoveFeed(feed.id)}
                                        className="absolute right-2 opacity-0 group-hover/feed:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Remover Feed"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </aside>
    );
}
