const { statusToString, statusToId } = require('../utils/statusHelpers')
const {
  arrayToString,
  getReferenceFromNestedData,
  getSbiFromPartitionKey,
  invalidClaimDataToString,
  isInCheckWithSubStatus,
  isInvalidDataEvent,
  parseSheepTestResults,
  replaceCommasWithSpace
} = require('../utils/parse-data')
const { BlobServiceClient } = require('@azure/storage-blob')
const fs = require('fs')

// Define the CSV column names
const columns = [
  'sbiFromPartitionKey',
  'sessionId',
  'eventType', // type
  'message',
  'reference',
  'applicationReference',
  'tempApplicationReference',
  'tempClaimReference',
  'typeOfClaim', // typeOfReview
  'sbiFromPayload',
  'crn',
  'frn',
  'farmerName',
  'organisationName',
  'userEmail',
  'orgEmail',
  'address',
  'raisedBy',
  'raisedOn',
  'journey',
  'confirmCheckDetails',
  'eligibleSpecies', // old application journey
  'agreeSameSpecies',
  'agreeSpeciesNumbers',
  'agreeVisitTimings',
  'declaration',
  'offerStatus',
  'species', // whichReview
  'detailsCorrect',
  'typeOfLivestock',
  'visitDate',
  'dateOfSampling',
  'vetName',
  'vetRcvs',
  'urnReference', // urnResult
  'herdVaccinationStatus',
  'numberOfOralFluidSamples',
  'numberOfSamplesTested',
  'numberAnimalsTested',
  'testResults',
  'vetVisitsReviewTestResults',
  'sheepEndemicsPackage',
  'sheepTests',
  'sheepTestResults',
  'piHunt',
  'piHuntRecommended',
  'piHuntAllAnimals',
  'biosecurity',
  'biosecurityAssessmentPercentage',
  'diseaseStatus',
  'claimPaymentAmount',
  'latestEndemicsApplication',
  'latestVetVisitApplication',
  'relevantReviewForEndemics',
  'claimed',
  'exception',
  'invalidClaimData',
  'statusId',
  'statusName',
  'eventStatus'
]

// Stream CSV data row by row to reduce memory footprint
const streamJsonToCsv = async (events, csvFilePath) => {
  if (!events || events.length === 0) {
    console.error('No events found')
    return
  }

  const writableStream = fs.createWriteStream(csvFilePath)
  writableStream.write(columns.join(',') + '\n') // Write CSV headers

  for (const event of events) {
    const csvRow = transformEventToCsvV3(event)
    writableStream.write(csvRow + '\n') // Write each row
  }

  writableStream.end()
  return csvFilePath // Return the path of the written CSV file
}

// Function to upload file to Azure Blob Storage
const uploadFileToAzureBlob = async (filePath, blobContainerName, blobName, connectionString) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  const containerClient = blobServiceClient.getContainerClient(blobContainerName)

  // Create container if it does not exist
  await containerClient.createIfNotExists()

  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  // Upload large files in chunks
  // Define block size (4MB) and variables to track block IDs and buffers
  const blockSize = 4 * 1024 * 1024 // 4MB block size
  const blocks = []
  let blockId = 0
  let buffer = Buffer.alloc(0)

  const fileStream = fs.createReadStream(filePath, { highWaterMark: blockSize })

  // Process the file stream chunk by chunk
  for await (const chunk of fileStream) {
    // Append the new chunk to the buffer
    buffer = Buffer.concat([buffer, chunk])

    // If the buffer is greater than or equal to blockSize, upload a block
    while (buffer.length >= blockSize) {
      const blockIdString = blockId.toString().padStart(6, '0')
      const blockIdEncoded = Buffer.from(blockIdString).toString('base64')
      blocks.push(blockIdEncoded)

      // Upload the first blockSize chunk of the buffer
      const blockBuffer = buffer.slice(0, blockSize)
      await blockBlobClient.stageBlock(blockIdEncoded, blockBuffer, blockBuffer.length)
      console.log(`Uploaded block ${blockId + 1} (${blockBuffer.length} bytes)`)

      blockId++

      // Remove the uploaded chunk from the buffer
      buffer = buffer.slice(blockSize)
    }
  }

  // After reading the stream, upload any remaining data as the final block
  if (buffer.length > 0) {
    const blockIdString = blockId.toString().padStart(6, '0')
    const blockIdEncoded = Buffer.from(blockIdString).toString('base64')
    blocks.push(blockIdEncoded)

    await blockBlobClient.stageBlock(blockIdEncoded, buffer, buffer.length)
    console.log(`Uploaded final block ${blockId + 1} (${buffer.length} bytes)`)
  }

  // Commit the blocks to finalize the blob
  await blockBlobClient.commitBlockList(blocks)

  console.log(`File ${blobName} uploaded successfully to Azure Blob Storage.`)
}

// Function to transform event data to CSV row format
function transformEventToCsvV3 (event) {
  const { partitionKey, SessionId: sessionId, Status: eventStatus } = event
  const sbiFromPartitionKey = getSbiFromPartitionKey(partitionKey)
  let parsePayload = ''
  try {
    parsePayload = JSON.parse(event.Payload)
  } catch (error) {
    console.error('Parse event error', event, error)
  }

  const { type, data, raisedBy, raisedOn, message } = parsePayload
  const {
    organisation,
    reference,
    applicationReference,
    tempReference,
    tempClaimReference,
    typeOfReview,
    journey,
    confirmCheckDetails,
    eligibleSpecies,
    agreeSameSpecies,
    agreeSpeciesNumbers,
    agreeVisitTimings,
    declaration,
    offerStatus,
    whichReview,
    detailsCorrect,
    typeOfLivestock,
    visitDate,
    dateOfTesting,
    vetName,
    vetRcvs,
    vetRCVSNumber,
    urnResult,
    herdVaccinationStatus,
    numberOfOralFluidSamples,
    numberOfSamplesTested,
    animalsTested,
    testResults,
    vetVisitsReviewTestResults,
    sheepEndemicsPackage,
    sheepTests,
    sheepTestResults,
    piHunt,
    biosecurity,
    diseaseStatus,
    amount,
    latestEndemicsApplication,
    latestVetVisitApplication,
    relevantReviewForEndemics,
    claimed,
    exception,
    statusId,
    subStatus
  } = data ?? {}
  const { sbi, farmerName, name, email, orgEmail, address, crn, frn } = organisation ?? {}
  const { biosecurity: biosecurityConfirmation, assessmentPercentage } = biosecurity ?? {}
  const relevantReviewForEndemicsReference = getReferenceFromNestedData(relevantReviewForEndemics)
  const latestEndemicsApplicationReference = getReferenceFromNestedData(latestEndemicsApplication)
  const latestVetVisitApplicationReference = getReferenceFromNestedData(latestVetVisitApplication)
  const invalidClaimData = isInvalidDataEvent(type) ? invalidClaimDataToString(data) : ''
  const sheepTestsString = sheepTests ? arrayToString(sheepTests) : ''
  const sheepTestResultsString = sheepTestResults ? parseSheepTestResults(sheepTestResults) : ''
  const isSubStatus = isInCheckWithSubStatus(subStatus, statusId)

  let rowStatusId
  let rowType
  if (isSubStatus) {
    rowStatusId = statusToId(subStatus)
    rowType = type.replace(/.$/, statusToId(subStatus))
  } else {
    rowStatusId = statusId
    rowType = type
  }

  const row = [
    sbiFromPartitionKey,
    sessionId,
    rowType,
    replaceCommasWithSpace(message),
    reference,
    applicationReference,
    tempReference,
    tempClaimReference,
    typeOfReview,
    sbi,
    crn,
    frn,
    replaceCommasWithSpace(farmerName),
    replaceCommasWithSpace(name),
    email,
    orgEmail,
    replaceCommasWithSpace(address),
    replaceCommasWithSpace(raisedBy),
    raisedOn,
    journey,
    confirmCheckDetails,
    eligibleSpecies,
    agreeSameSpecies,
    agreeSpeciesNumbers,
    agreeVisitTimings,
    declaration,
    offerStatus,
    whichReview,
    detailsCorrect,
    typeOfLivestock,
    visitDate,
    dateOfTesting,
    replaceCommasWithSpace(vetName),
    vetRcvs ?? vetRCVSNumber,
    urnResult,
    herdVaccinationStatus,
    numberOfOralFluidSamples,
    numberOfSamplesTested,
    animalsTested,
    testResults,
    vetVisitsReviewTestResults,
    sheepEndemicsPackage,
    sheepTestsString,
    sheepTestResultsString,
    piHunt,
    biosecurityConfirmation,
    assessmentPercentage,
    diseaseStatus,
    amount,
    latestEndemicsApplicationReference,
    latestVetVisitApplicationReference,
    relevantReviewForEndemicsReference,
    claimed,
    replaceCommasWithSpace(exception),
    replaceCommasWithSpace(invalidClaimData),
    rowStatusId,
    statusToString(rowStatusId ?? 0),
    eventStatus
  ].join(',')

  return row
}

module.exports = { streamJsonToCsv, uploadFileToAzureBlob, transformEventToCsvV3 }
