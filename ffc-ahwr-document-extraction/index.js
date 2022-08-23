const { writeFile } = require('../ffc-ahwr-mi-reporting/storage')
const mammoth = require('mammoth')

module.exports = async (context, document) => {
  const source = context.bindings.document
  const inputBuffer = Buffer.from(source)

  mammoth.convertToHtml({ buffer: inputBuffer })
    .then((result) => {
      const html = `<!DOCTYPE html><html><body>${result.value}</body></html>`
      console.log(html)
      writeFile('output/index.html', Buffer.from(html, 'utf-8'))
    })
    .done()

  context.log('JavaScript blob trigger function processed blob \n Blob:', context.bindingData.blobTrigger, '\n Blob Size:', document.length, 'Bytes')
}
