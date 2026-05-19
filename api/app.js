const express = require('express')
const http = require('http');
const app = express()
const port = 3000

app.get('/', async (req, res) => {
  const baseUrl = 'http://localhost:7071/api/newsScraper';
  const queryParams = new URLSearchParams({ name: 'Developer' });
  const fullUrl = `${baseUrl}?${queryParams}`; // Results in: http://localhost:7071/api/newsscraper?name=Developer

  try {
    // 2. Send the GET request (GET is the default method for fetch)
    const response = await fetch(fullUrl);
    
    // 3. Handle the response (assuming it returns JSON)
    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to connect to the scraper function' });
  }
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})