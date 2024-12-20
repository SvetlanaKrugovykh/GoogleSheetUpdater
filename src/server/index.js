require('dotenv').config()
const gs = require('./services/toGoogleSheets')

module.exports.app = async function () {
  try {
    const authClient = await gs.authorize()
    const catalog = process.env.XLS_FILE_PATH
    if (!catalog) {
      throw new Error('XLS_FILE_PATH is not defined in the environment variables')
    }
    const xlsxFilePath = `${catalog}report.xlsx`

    const sheetData = await gs.readXlsxFile(xlsxFilePath)
    await gs.uploadToGoogleSheets(authClient, sheetData)
  } catch (error) {
    console.error('Error processing Google Sheets:', error)
  }
}

