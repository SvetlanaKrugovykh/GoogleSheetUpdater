require('dotenv').config()
const gs = require('./services/toGoogleSheets')

module.exports.app = async function () {
  try {
    const authClient = await gs.authorize()
    const XLS_FILE_PATH = process.env.XLS_FILE_PATH
    if (!XLS_FILE_PATH) {
      throw new Error('XLS_FILE_PATH is not defined in the environment variables')
    }
    const xlsxFilePath = `${XLS_FILE_PATH}${process.env.XLS_FILE_NAME}`

    const sheetData = await gs.readXlsxFile(xlsxFilePath)
    await gs.uploadToGoogleSheets(authClient, sheetData)
  } catch (error) {
    console.error('Error processing Google Sheets:', error)
  }
}

