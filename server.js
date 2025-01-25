require('dotenv').config();
const express = require('express');
const Airtable = require('airtable');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

app.use(express.static('public'));
app.use(express.json());

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { searchTerm } = req.body;
    const sanitizedTerm = searchTerm.replace(/[']/g, "\\'");
    
    const records = await base('Sites').select({
      filterByFormula: `{fldFiKkGxKdXC5Xlh} = '${sanitizedTerm}'`,
      returnFieldsByFieldId: true
    }).firstPage();

    res.json(records.map(record => ({
      id: record.id,
      fields: record.fields
    })));
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Direct URL access for sites
app.get('/site/:siteId', async (req, res) => {
  try {
    const siteId = req.params.siteId.replace(/[^a-zA-Z0-9]/g, ''); // Sanitize input
    const record = await base('Sites').select({
      filterByFormula: `{fldFiKkGxKdXC5Xlh} = '${siteId}'`,
      maxRecords: 1
    }).firstPage();

    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } catch (error) {
    res.status(500).send('Error loading page');
  }
});

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => console.log(`Server running on port ${port}`));
