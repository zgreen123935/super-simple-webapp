# Airtable Web App

## Airtable Configuration

### Base Information
- **Base ID**: `appxxdqQIFTyoNZMU`

### Tables
- **Sites Table**: `tblGHLz5k1iXCP6oN`

### Field IDs
*Note: Add field IDs here as we use them in the application*
- **Search Field**: `fldFiKkGxKdXC5Xlh`
- **Install Complete Checkbox**: `fldn0eoqW6c3aOVlR`

## Environment Variables
The application uses the following environment variables:
- `AIRTABLE_API_KEY`: Personal Access Token for Airtable API
- `AIRTABLE_BASE_ID`: The ID of the Airtable base
- `PORT`: The port number for the local server (default: 3000)

## Running the Application
1. Ensure `.env` file is configured with the correct credentials
2. Run `npm install` to install dependencies
3. Start the server with `node server.js`
4. Access the application at `http://localhost:3000`

## Features
1. Search for sites using the search field
2. Access sites directly via URL: `http://localhost:3000/site/{siteId}`
3. Mark installations as complete with the update button
4. Rate limiting to prevent abuse
5. Input sanitization for security
