import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import Parser from "rss-parser";

const parser = new Parser();

export async function newsScraper(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    try {
        // Construct the Google News RSS URL for your search term
        const searchTerm = "trump";
        const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchTerm)}&hl=en-US&gl=US&ceid=US:en`;
        
        const feed = await parser.parseURL(feedUrl);
        
        // feed.items contains title, link, pubDate, contentSnippet, etc.
        // console.log(feed.items);
        
        return { 
            status: 200,
            jsonBody: { articles: feed.items } 
        };
    } catch (error) {
        context.log(`Error fetching news: ${error.message}`);
        return { status: 500, body: "Failed to fetch news." };
    }
    

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
};

app.http('newsScraper', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: newsScraper
});
