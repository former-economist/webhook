import { app, InvocationContext } from "@azure/functions";
import Parser from "rss-parser";

const parser = new Parser();

export async function newsScraperQueue(queueMessage: any, context: InvocationContext): Promise<void> {
    context.log('Storage queue function processed work item:', queueMessage);

    const jobId = queueMessage.jobId;
    const searchTerm = queueMessage.name || "Developer";
    const webhookUrl = 'http://localhost:3000/webhook/results';

    try {
        context.log(`Scraping RSS for: "${searchTerm}" (Job ID: ${jobId})`);
        const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchTerm)}&hl=en-US&gl=US&ceid=US:en`;
        
        const feed = await parser.parseURL(feedUrl);
        context.log(`Scraped ${feed.items.length} articles.`);

        // Fire webhook back to Express with the data payload
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jobId: jobId,
                status: "success",
                articles: feed.items
            })
        });
        context.log(`Successfully sent Webhook data back to Express.`);

    } catch (error: any) {
        context.log(`Error running queue background task: ${error.message}`);
        
        // Let Express know it failed so the tracking state updates
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, status: "failed" })
            });
        } catch (webhookError) {
            context.log(`Could not notify webhook about failure.`);
        }

        // Throwing the error ensures Azure Queue triggers native automatic retries
        throw error; 
    }
}

app.storageQueue('newsScraperQueue', {
    queueName: 'newsqueue',
    connection: '2ddcc5_STORAGE',
    handler: newsScraperQueue
});
