import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', "true");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!email || !privateKey || !spreadsheetId) {
      return res.status(500).json({ error: 'Missing required environment variables.' });
    }

    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title'
    });

    const sheetNames = response.data.sheets?.map(s => s.properties?.title).filter(Boolean) || [];

    return res.status(200).json({ sheetNames });
  } catch (error: any) {
    console.error('API Error fetching Google Sheets metadata:', error);
    return res.status(500).json({ error: 'Failed to fetch metadata', details: error.message });
  }
}
