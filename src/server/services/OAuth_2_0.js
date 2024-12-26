const { google } = require('googleapis')
const fs = require('fs')
const TOKEN_PATH = 'token.json'

module.exports.getAuthorizedClient() = async function () {
  const credentials = JSON.parse(fs.readFileSync('credentials.json'))
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH))
  oAuth2Client.setCredentials(token)

  oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens))
    }
    console.log('Tokens updated:', tokens)
  })

  return oAuth2Client
}

