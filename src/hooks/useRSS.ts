import { useState, useEffect } from "react";
import { fetchFeed, type RSSFeed, type RSSItem } from "../lib/rss";

const STORAGE_KEY_FEEDS = "super-rss-feeds";
const STORAGE_KEY_ARTICLES = "super-rss-articles";

export function useRSS() {
    const [feeds, setFeeds] = useState<RSSFeed[]>([]);
    const [articles, setArticles] = useState<RSSItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load from local storage on mount
    useEffect(() => {
        const storedFeeds = localStorage.getItem(STORAGE_KEY_FEEDS);
        const storedArticles = localStorage.getItem(STORAGE_KEY_ARTICLES);

        if (storedFeeds) {
            try {
                setFeeds(JSON.parse(storedFeeds));
            } catch (e) {
                console.error(e);
            }
        }

        if (storedArticles) {
            try {
                setArticles(JSON.parse(storedArticles));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Sync to local storage when state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_FEEDS, JSON.stringify(feeds));
    }, [feeds]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
    }, [articles]);

    const addFeed = async (url: string) => {
        if (feeds.some(f => f.id === url)) {
            setError("Este feed já foi adicionado.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const newFeed = await fetchFeed(url);

            // We store the feed info without items to save space in the feeds array
            const feedMeta = { ...newFeed, items: [] };
            setFeeds(prev => [...prev, feedMeta]);

            // Store the new articles, filtering out duplicates
            setArticles(prev => {
                const existingIds = new Set(prev.map(a => a.id));
                const newArticles = newFeed.items.filter(a => !existingIds.has(a.id));

                // Sort newest first
                const combined = [...newArticles, ...prev].sort((a, b) =>
                    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
                );
                return combined;
            });

        } catch (err: any) {
            setError(err.message || "Erro desconhecido");
        } finally {
            setIsLoading(false);
        }
    };

    const removeFeed = (feedId: string) => {
        setFeeds(prev => prev.filter(f => f.id !== feedId));
        // Remove all articles from that feed unless bookmarked
        setArticles(prev => prev.filter(a => a.feedId !== feedId || a.bookmarked));
    };

    const refreshAll = async () => {
        setIsLoading(true);
        setError(null);
        try {
            let allNewArticles: RSSItem[] = [];
            for (const feed of feeds) {
                const freshFeed = await fetchFeed(feed.id);
                allNewArticles = [...allNewArticles, ...freshFeed.items];
            }

            setArticles(prev => {
                const existingMap = new Map(prev.map(a => [a.id, a]));
                allNewArticles.forEach(na => {
                    if (!existingMap.has(na.id)) {
                        existingMap.set(na.id, na);
                    }
                });

                return Array.from(existingMap.values()).sort((a, b) =>
                    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
                );
            });

        } catch (err: any) {
            setError("Erro ao atualizar os feeds: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = (articleId: string) => {
        setArticles(prev => prev.map(a => a.id === articleId ? { ...a, read: true } : a));
    };

    const toggleBookmark = (articleId: string) => {
        setArticles(prev => prev.map(a => a.id === articleId ? { ...a, bookmarked: !a.bookmarked } : a));
    };

    return {
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
    };
}
