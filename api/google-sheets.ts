import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS if necessary for local dev when running Vite separately
  res.setHeader('Access-Control-Allow-Credentials', "true");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { range, ranges } = req.query;

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Replace literal '\n' with actual newlines if they are escaped in env vars
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!email || !privateKey || !spreadsheetId) {
      return res.status(500).json({ error: 'Missing required environment variables for Google Sheets API.' });
    }

    if (!range && !ranges) {
      return res.status(400).json({ error: 'Range or ranges parameter is required.' });
    }

    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    if (ranges) {
      const rangesArray = Array.isArray(ranges) ? ranges : [ranges];
      const response = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges: rangesArray as string[],
      });
      return res.status(200).json({ valueRanges: response.data.valueRanges || [] });
    } else {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: range as string,
      });
      return res.status(200).json({ values: response.data.values || [] });
    }
  } catch (error: any) {
    console.error('API Error fetching Google Sheets:', error.message);
    
    // If the sheet/range doesn't exist, Google API throws "Unable to parse range"
    if (error.message?.includes('Unable to parse range')) {
      return res.status(200).json({ values: [] });
    }

    return res.status(500).json({ error: 'Failed to fetch data from Google Sheets', details: error.message });
  }
}
