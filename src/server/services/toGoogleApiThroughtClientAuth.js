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
      const auth = await getAuthorizedClient()
      const response = await sheets.spreadsheets.get({
        spreadsheetId: 'your_spreadsheet_id',
      })
      console.log('Google Sheets data (retried):', response.data)
    } else {
      console.error('Error accessing Google API:', error)
    }
  }
}
