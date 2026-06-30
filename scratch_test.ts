import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.join(process.cwd(), '.env.example');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1].trim()] = val;
  }
});

const email = env['GOOGLE_SERVICE_ACCOUNT_EMAIL'];
const privateKey = env['GOOGLE_PRIVATE_KEY']?.replace(/\\n/g, '\n');
const spreadsheetId = env['GOOGLE_SPREADSHEET_ID'];

async function run() {
  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'August 2025!A1:E10',
    });
    console.log("AUGUST 2025 DATA:", JSON.stringify(res.data.values, null, 2));
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

run();
