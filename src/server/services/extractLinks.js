function extractLinks() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const range = sheet.getDataRange()
  const values = range.getValues()
  const links = []

  const urlRegex = /https:\/\/drive\.google\.com\/file\/d\/([^\/]+)\/view/

  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      const cell = range.getCell(i + 1, j + 1)
      const formula = cell.getFormula()
      const richText = cell.getRichTextValue()

      if (formula && urlRegex.test(formula)) {
        links.push(formula.match(urlRegex)[0])
      } else if (richText) {
        const link = richText.getLinkUrl()
        if (link && urlRegex.test(link)) {
          links.push(link)
        }
      }
    }
  }

  if (links.length > 0) {
    const outputSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Extracted Links")
    links.forEach((link, index) => {
      outputSheet.getRange(index + 1, 1).setValue(link)
    });
    SpreadsheetApp.getUi().alert(`Found ${links.length} URLs. They saved on new list "Extracted Links".`)
  } else {
    SpreadsheetApp.getUi().alert("URLs not found.")
  }
}
