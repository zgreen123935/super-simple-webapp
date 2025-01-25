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

// Configure specific rate limit for updates
const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 update requests per window
  message: 'Too many update attempts, please try again later'
});

app.use(limiter);

// Configure Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

app.use(express.static('public'));
app.use(express.json());

// Validation middleware for record ID
app.use('/api/update/:recordId', (req, res, next) => {
  const recordId = req.params.recordId;
  
  // Validate record ID format
  if(!/^rec[A-Za-z0-9]{14,17}$/.test(recordId)) {
    return res.status(400).json({ error: 'Invalid record ID format' });
  }
  
  next();
});

// Apply update rate limiting
app.use('/api/update/:recordId', updateLimiter);

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

// Update endpoint
app.patch('/api/update/:recordId', async (req, res) => {
  try {
    const recordId = req.params.recordId;
    const updatedRecord = await base('Sites').update([{
      id: recordId,
      fields: {
        'fldn0eoqW6c3aOVlR': true
      }
    }]);

    if(!updatedRecord || updatedRecord.length === 0) {
      throw new Error('Record not found');
    }

    res.json(updatedRecord[0].fields);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data?.error?.message 
    });
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
