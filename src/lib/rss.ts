import Parser from "rss-parser";

/**
 * Usamos um proxy CORS público para evitar bloqueios ao tentar acessar 
 * XMLs de outros domínios diretamente do navegador (Client Side).
 */
const CORS_PROXY = "https://corsproxy.io/?";

const parser = new Parser({
    customFields: {
        item: ['media:content', 'enclosure', 'content:encoded', 'description'],
    }
});

export interface RSSFeed {
    id: string; // url
    title: string;
    description: string;
    link: string;
    items: RSSItem[];
}

export interface RSSItem {
    id: string; // guid or link
    title: string;
    link: string;
    pubDate: string;
    content: string;
    contentSnippet?: string;
    author?: string;
    feedId: string;
    feedTitle?: string;
    read: boolean;
    bookmarked: boolean;
    thumbnail?: string;
}

export async function fetchFeed(url: string): Promise<RSSFeed> {
    // Limpar url e adicionar proxy
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;

    try {
        const feed = await parser.parseURL(proxyUrl);

        const parsedFeed: RSSFeed = {
            id: url,
            title: feed.title || new URL(url).hostname,
            description: feed.description || "",
            link: feed.link || url,
            items: feed.items.map(item => {

                let thumbnail = "";

                // Tentar extrair thumb de enclosure, media:content ou description html
                if (item.enclosure?.url && item.enclosure.type?.startsWith('image')) {
                    thumbnail = item.enclosure.url;
                } else if (item['media:content']?.$?.url) {
                    thumbnail = item['media:content'].$.url;
                } else if (item['content:encoded'] || item.content) {
                    const html = item['content:encoded'] || item.content;
                    const imgMatch = html?.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) thumbnail = imgMatch[1];
                }

                return {
                    id: item.guid || item.link || Math.random().toString(),
                    title: item.title || "Sem título",
                    link: item.link || "",
                    pubDate: item.pubDate || new Date().toISOString(),
                    content: item['content:encoded'] || item.content || item.description || "",
                    contentSnippet: item.contentSnippet || item.description?.replace(/<[^>]*>?/gm, ''),
                    author: item.creator || (item as any).author,
                    feedId: url,
                    feedTitle: feed.title || new URL(url).hostname,
                    read: false,
                    bookmarked: false,
                    thumbnail
                }
            })
        };

        return parsedFeed;
    } catch (error) {
        console.error("Erro ao buscar o RSS Feed:", error);
        throw new Error("Não foi possível carregar o feed. Verifique a URL ou tente novamente mais tarde.");
    }
}
