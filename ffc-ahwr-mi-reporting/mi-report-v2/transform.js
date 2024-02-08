const agreementStatusIdToString = require('../mi-report/agreement-status-id-to-string')

const transformJsonToCsv = (events) => {
  const csv = events.forEach(event => {
    return transformEventToCsv(event)
  })
  return csv
}

// This function converts a JSON string into CSV format
function transformEventToCsv (jsonString, addColumnName = false) {
  // Parse the JSON string into an object
  const jsonObj = JSON.parse(jsonString)

  // Extract data from the JSON object
  const type = jsonObj.type
  const data = jsonObj.data
  const reference = data.reference
  const organisation = data.organisation
  const raisedBy = jsonObj.raisedBy
  const raisedOn = jsonObj.raisedOn

  // Define the CSV column names
  const columns = ['type', 'reference', 'tempReference', 'sbi', 'farmerName', 'organisationName', 'email', 'address', 'raisedBy', 'raisedOn',
    'journey', 'confirmCheckDetails', 'eligibleSpecies', 'declaration', 'whichReview', 'detailsCorrect', 'visitDate', 'dateOfTesting',
    'vetName', 'vetRcvs', 'urnResult', 'animalsTested', 'claimed', 'statusId', 'statusName']

  // Create the CSV string
  let csvContent = addColumnName ? columns.join(',') + '\n' : ''// Add the column names to the first row
  const row = [
    type,
    reference,
    data.tempReference,
    organisation.sbi,
    organisation.farmerName,
    organisation.name,
    organisation.email,
    organisation.address,
    raisedBy,
    raisedOn,
    data.journey ?? '',
    data.confirmCheckDetails ?? '',
    data.eligibleSpecies ?? '',
    data.declaration ?? '',
    data.whichReview ?? '',
    data.detailsCorrect ?? '',
    data.visitDate ?? '',
    data.dateOfTesting ?? '',
    data.vetName ?? '',
    data.vetRcvs ?? '',
    data.urnResult ?? '',
    data.tempReference ?? '',
    data.animalsTested ?? '',
    data.claimed ?? '',
    data.statusId ?? '',
    agreementStatusIdToString(data.statusId ?? 0)
  ].join(',') // Create a comma-separated string of the data

  // Add the data row to the CSV content
  csvContent += row + '\n'

  // Return the CSV content
  return csvContent
}

module.exports = transformJsonToCsv
