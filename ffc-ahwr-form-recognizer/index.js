const { FormRecognizerClient, AzureKeyCredential } = require('@azure/ai-form-recognizer')

const endpoint = 'https://ffcahwrformreq.cognitiveservices.azure.com/'
const apiKey = '3fd9e40b654a442f8d3b4f96b9a58598'

module.exports = async (context, document) => {
  const source = context.bindings.document
  const inputBuffer = Buffer.from(source)

  const client = new FormRecognizerClient(endpoint, new AzureKeyCredential(apiKey))
  const poller = await client.beginRecognizeContent(inputBuffer)
  const pages = await poller.pollUntilDone()

  if (!pages || pages.length === 0) {
    throw new Error('Expecting non-empty list of pages!')
  }

  for (const page of pages) {
    console.log(
      `Page ${page.pageNumber}: width ${page.width} and height ${page.height} with unit ${page.unit}`
    )
    for (const table of page.tables) {
      for (const cell of table.cells) {
        console.log(`cell [${cell.rowIndex},${cell.columnIndex}] has text ${cell.text}`)
      }
    }
  }

  context.log('JavaScript blob trigger function processed blob \n Blob:', context.bindingData.blobTrigger, '\n Blob Size:', document.length, 'Bytes')
}
