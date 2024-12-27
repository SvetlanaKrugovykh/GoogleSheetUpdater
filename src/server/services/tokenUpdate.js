const { google } = require('googleapis')
const fs = require('fs')
const TOKEN_PATH = 'token.json'

module.exports.authorize() = async function () {
  const credentials = JSON.parse(fs.readFileSync('credentials.json'))
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  try {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH))
    oAuth2Client.setCredentials(token)

    oAuth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
      }
      console.log('Access token updated:', tokens.access_token)
    })

    return oAuth2Client
  } catch (error) {
    console.error('Token file missing or invalid. Please authorize the app again.')
  }
}


module.exports.getAuthorizedClient() = async function () {
  const credentials = JSON.parse(fs.readFileSync('credentials.json'))
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  // Загружаем сохранённые токены
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH))
  oAuth2Client.setCredentials(token)

  // Обновляем токены при необходимости
  oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
    }
    console.log('Tokens updated:', tokens)
  })

  return oAuth2Client
}

module.exports.callGoogleAPI() = async function () {
  const auth = await getAuthorizedClient()
  const sheets = google.sheets({ version: 'v4', auth })

  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: 'your_spreadsheet_id',
    })
    console.log('Google Sheets data:', response.data)
  } catch (error) {
    if (error.code === 401) {
      console.log('Access Token expired. Attempting to refresh...')
      const auth = await getAuthorizedClient() // Создаём новый клиент с обновлённым токеном
      const response = await sheets.spreadsheets.get({
        spreadsheetId: 'your_spreadsheet_id',
      })
      console.log('Google Sheets data (retried):', response.data)
    } else {
      console.error('Error accessing Google API:', error)
    }
  }
}

