require('dotenv').config();
const express = require('express');
const Airtable = require('airtable');

const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => console.log(`Server running on port ${port}`));
