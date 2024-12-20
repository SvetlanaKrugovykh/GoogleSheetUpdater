require('dotenv').config()
const { google } = require('googleapis')
const xlsx = require('xlsx')
const fs = require('fs')
const path = require('path')

module.exports.authorize = async function () {
  const keyFilePath = path.resolve(__dirname, '../../../path/to/serviceAccountKey.json')
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: [process.env.GOOGLE_SHEETS_SCOPE],
  })
  return auth.getClient()
}

module.exports.readXlsxFile = async function (filePath) {
  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })
  return sheetData
}

module.exports.uploadToGoogleSheets = async function (auth, sheetData) {
  try {
    const sheets = google.sheets({ version: 'v4', auth })
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID

    if (!SPREADSHEET_ID) {
      throw new Error('SPREADSHEET_ID is not defined in the environment variables')
    }

    const range = 'Sheet1!A1'

    const resource = {
      values: sheetData,
    }

    const response = sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      resource,
    })

    console.log(`${response.data.updatedCells} cells updated in Google Sheets.`)
  } catch (error) {
    console.error('Error uploading to Google Sheets:', error)
  }
}