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

module.exports.grantAccess = async function (auth, spreadsheetId, userEmail) {
  const drive = google.drive({ version: 'v3', auth })

  try {
    const permissions = {
      type: 'user',
      role: 'writer',
      emailAddress: userEmail,
    }

    await drive.permissions.create({
      auth,
      fileId: spreadsheetId,
      requestBody: permissions,
      fields: 'id',
    })

    console.log(`Shared file ${fileId} with ${userEmail}`)
  } catch (error) {
    console.error('Error granting access:', error.message)
  }
}

module.exports.syncToGoogleSheets = async function (auth, sheetData) {
  try {
    const sheets = google.sheets({ version: 'v4', auth })
    let SPREADSHEET_ID = process.env.SPREADSHEET_ID
    let spreadsheetExists = false

    if (SPREADSHEET_ID) {
      try {
        await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
        spreadsheetExists = true
        console.log(`Spreadsheet with ID ${SPREADSHEET_ID} exists.`)
      } catch (error) {
        console.warn(`Spreadsheet with ID ${SPREADSHEET_ID} does not exist or is inaccessible. A new one will be created.`)
      }
    }

    if (!spreadsheetExists) {
      console.log('Creating a new Google Sheet.')

      const createResponse = await sheets.spreadsheets.create({
        resource: {
          properties: {
            title: 'New Google Sheet',
          },
        },
      })

      SPREADSHEET_ID = createResponse.data.spreadsheetId
      console.log(`New spreadsheet created with ID: ${SPREADSHEET_ID}`)

      process.env.SPREADSHEET_ID = SPREADSHEET_ID
    }

    const range = 'Sheet1!A1'
    const resource = { values: sheetData }

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'RAW',
      resource,
    })

    await module.exports.grantAccess(auth, SPREADSHEET_ID, process.env.GOOGLE_SHEETS_EMAIL)

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`
    console.log(`Access your Google Sheet here: ${spreadsheetUrl}`)
    console.log(`${response.data.updatedCells} cells updated in Google Sheets.`)
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error.response?.data || error.message)
  }
}

