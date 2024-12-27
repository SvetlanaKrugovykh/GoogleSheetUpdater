const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const TOKEN_PATH = path.join(__dirname, 'token.json');

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

const { client_secret, client_id, redirect_uris } = credentials.installed;
const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

if (fs.existsSync(TOKEN_PATH)) {
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oauth2Client.setCredentials(token);
} else {
  getAccessToken(oauth2Client);
}

function getAccessToken(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  console.log('Authorize this app by visiting this URL:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();

    oauth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);

      oauth2Client.setCredentials(token);

      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('Token stored to', TOKEN_PATH);
    });
  });
}

async function writeDataToSheet(auth) {
  const sheets = google.sheets({ version: 'v4', auth });

  const SPREADSHEET_ID = 'ВАШ_SPREADSHEET_ID';
  const RANGE = 'Sheet1!A1';

  const resource = {
    values: [
      ['Name', 'Age', 'Location'],
      ['Alice', 30, 'New York'],
      ['Bob', 25, 'San Francisco'],
    ],
  };

  try {
    const result = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      resource,
    });

    console.log(`${result.data.updatedCells} cells updated.`);
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
  }
}

