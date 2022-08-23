const moment = require('moment')
const PdfPrinter = require('pdfmake')
const { writeFile } = require('./storage')

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
}

const formatDate = (dateToFormat, currentDateFormat = 'YYYY-MM-DD') => {
  if (dateToFormat) {
    return moment(dateToFormat, currentDateFormat).format('DD/MM/YYYY HH:mm')
  }
  return 'Unknown'
}

const groupByPartitionKey = (events) => {
  return events.reduce((group, event) => {
    const { partitionKey } = event
    group[partitionKey] = group[partitionKey] ?? []
    group[partitionKey].push(event)
    return group
  }, {})
}

const parsePayload = (events, eventType) => {
  const eventData = events.filter(event => event.EventType === eventType)
  const latestEvent = eventData.sort((a, b) => new Date(b.EventRaised) - new Date(a.EventRaised))[0]
  return latestEvent?.Payload ? JSON.parse(latestEvent?.Payload) : {}
}

const parseOrganisationData = (events) => {
  const organisationData = parsePayload(events, 'farmerApplyData-organisation')
  const organisation = organisationData?.data?.organisation

  return [
    { text: 'Annual Health and Welfare Review', style: 'header' },
    '\n\n',
    { text: 'Organisation Details', style: 'subheader' },
    '\n\n',
    { text: 'SBI: ', bold: true },
    `${organisation?.sbi} \n`,
    { text: 'CPH: ', bold: true },
    `${organisation?.cph} \n`,
    { text: 'Name: ', bold: true },
    `${organisation?.farmerName} \n`,
    { text: 'Farm name: ', bold: true },
    `${organisation?.name} \n`,
    { text: 'Adddress: ', bold: true },
    `${organisation?.address} \n`,
    { text: 'Email: ', bold: true },
    `${organisation?.email} \n`,
    '\n\n',
    '\n\n'
  ]
}

const parseData = (events, type, key) => {
  let value = ''
  let raisedOn = ''
  const data = parsePayload(events, type)

  try {
    value = data?.data[key]
    raisedOn = formatDate(data?.raisedOn, moment.ISO_8601)
  } catch (error) {
    console.log(`${key} not found`)
  }

  return {
    value,
    raisedOn
  }
}

const calculateJourneyTime = (events) => {
  const sortEvents = events.sort((a, b) => new Date(a.EventRaised) - new Date(b.EventRaised))
  const firstEvent = sortEvents[0].EventRaised
  const lastEvent = sortEvents[sortEvents.length - 1].EventRaised

  let timeDelta = Math.abs(new Date(firstEvent) - new Date(lastEvent)) / 1000

  const days = Math.floor(timeDelta / 86400)
  timeDelta -= days * 86400

  const hours = Math.floor(timeDelta / 3600) % 24
  timeDelta -= hours * 3600

  const minutes = Math.floor(timeDelta / 60) % 60
  timeDelta -= minutes * 60

  const seconds = timeDelta % 60

  return [
    { text: 'Apply journey time\n\n', style: 'subheader' },
    `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
  ]
}

const parseActionData = (events) => {
  const whichReview = parseData(events, 'farmerApplyData-whichReview', 'whichReview')
  const eligibleSpecies = parseData(events, 'farmerApplyData-eligibleSpecies', 'eligibleSpecies')
  const confirmCheckDetails = parseData(events, 'farmerApplyData-confirmCheckDetails', 'confirmCheckDetails')
  const reference = parseData(events, 'farmerApplyData-reference', 'reference')
  const declaration = parseData(events, 'farmerApplyData-declaration', 'declaration')

  return [
    { text: 'History\n\n', style: 'subheader' },
    'The following table shows the history of the farmer apply journey',
    {
      style: 'history',
      table: {
        body: [
          ['Action', 'Answer', 'Timestamp'],
          ['Confirm check details?', confirmCheckDetails.value, confirmCheckDetails.raisedOn],
          ['Which livestock do you want a review for?', whichReview.value, whichReview.raisedOn],
          ['Will you have 11 or more beef cattle on the date of the review?', eligibleSpecies.value, eligibleSpecies.raisedOn],
          ['Declaration?', declaration.value, declaration.raisedOn],
          ['Reference', reference.value, reference.raisedOn]
        ]
      }
    }
  ]
}

const generateReport = (events) => {
  const content = []
  parseOrganisationData(events).forEach(item => content.push(item))
  parseActionData(events).forEach(item => content.push(item))
  calculateJourneyTime(events).forEach(item => content.push(item))

  return {
    content,
    defaultStyle: {
      font: 'Helvetica'
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true
      },
      subheader: {
        fontSize: 15,
        bold: true
      },
      history: {
        margin: [0, 5, 0, 15]
      }
    },
    footer: {
      columns: [
        function (currentPage, pageCount) { return currentPage.toString() + ' of ' + pageCount },
        { text: `Report generated at ${formatDate(new Date(), moment.ISO_8601)}`, alignment: 'right' }
      ]
    }
  }
}

const saveReport = (docDefinition) => {
  const printer = new PdfPrinter(fonts)

  const pdfDocGenerator = printer.createPdfKitDocument(docDefinition)
  const chunks = []

  pdfDocGenerator.on('data', (chunk) => {
    chunks.push(chunk)
  })

  pdfDocGenerator.on('end', function () {
    writeFile('document.pdf', Buffer.concat(chunks))
  })

  pdfDocGenerator.end()
  console.log('PDF saved')
}

const convertToCSV = (data) => {
  let csv = ''
  csv = data.map(row => Object.values(row))
  csv.unshift(Object.keys(data[0]))
  return `"${csv.join('"\n"').replace(/,/g, '","')}"`
}

const parseCsvData = (events) => {
  const organisationData = parsePayload(events, 'farmerApplyData-organisation')
  const organisation = organisationData?.data?.organisation

  const whichReview = parseData(events, 'farmerApplyData-whichReview', 'whichReview')
  const eligibleSpecies = parseData(events, 'farmerApplyData-eligibleSpecies', 'eligibleSpecies')
  const confirmCheckDetails = parseData(events, 'farmerApplyData-confirmCheckDetails', 'confirmCheckDetails')

  return {
    sbi: organisation?.sbi,
    cph: organisation?.cph,
    name: organisation?.name,
    farmer: organisation?.farmerName,
    address: organisation?.address.replace(/,/g, '","'),
    email: organisation?.email,
    whichReview: whichReview?.value,
    eligibleSpecies: eligibleSpecies?.value,
    confirmCheckDetails: confirmCheckDetails?.value
  }
}

const saveCsv = (miParsedData) => {
  if (miParsedData) {
    const csvData = convertToCSV(miParsedData)
    writeFile('document.csv', csvData)
    console.log('CSV saved')
  } else {
    console.log('No data to create CSV')
  }
}

const buildMiReport = (events) => {
  const miParsedData = []
  const eventByPartitionKey = groupByPartitionKey(events)
  for (const eventGroup in eventByPartitionKey) {
    const eventData = eventByPartitionKey[eventGroup]
    const docDefinition = generateReport(eventData)
    saveReport(docDefinition)
    miParsedData.push(parseCsvData(eventData))
  }
  saveCsv(miParsedData)
}

module.exports = buildMiReport
