const express = require('express')
const { QueueServiceClient } = require('@azure/storage-queue');
const http = require('http');
const app = express()
const port = 3000

const AZURE_STORAGE_CONNECTION_STRING = "UseDevelopmentStorage=true";
const queueName = "queuescraper"

const queueServiceClient = QueueServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const queueClient = queueServiceClient.getQueueClient(queueName)

const mockDataBase = new Map()

app.get('/', async (req, res) => {
  const baseUrl = 'http://localhost:7071/api/newsScraper';
  const queryParams = new URLSearchParams({ name: 'Developer' });
  const fullUrl = `${baseUrl}?${queryParams}`; // Results in: http://localhost:7071/api/newsscraper?name=Developer
  const jobId = crypto.randomUUID();

  try {
    await queueClient.createIfNotExists();

    const payload = { jobId, name: "developer" };

    const base64Message = Buffer.from(JSON.stringify(payload)).toString('base64');
    await queueClient.sendMessage(base64Message);

    jobDatabase.set(jobId, { status: "processing", articles: null });

    res.status(202).json({ 
      status: "Accepted", 
      jobId: jobId,
      message: `Scraper job for '${targetName}' successfully added to the resilient queue.` 
    });
  } catch (error) {
    console.error('Queue error:', error);
    res.status(500).json({ error: 'Failed to queue the scraper job' });
  }

  // try {
  //   // 2. Send the GET request (GET is the default method for fetch)
  //   const response = await fetch(fullUrl);
    
  //   // 3. Handle the response (assuming it returns JSON)
  //   const data = await response.json();
  //   res.status(response.status).json(data);

  // } catch (error) {
  //   console.error('Fetch error:', error);
  //   res.status(500).json({ error: 'Failed to connect to the scraper function' });
  // }
  
})

app.post('/webhook/results', (req, res) => {
  const { jobId, articles, status } = req.body;
  console.log(`Webhook received for Job ID: ${jobId}`);

  if (status === "success") {
    jobDatabase.set(jobId, { status: "completed", articles });
  } else {
    jobDatabase.set(jobId, { status: "failed", error: "Scraper run failed" });
  }

  res.status(200).send("Express acknowledged webhook.");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})