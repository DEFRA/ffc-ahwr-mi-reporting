const moment = require('moment')
const {
  formatDate, parseData, parsePayload, arrayToString, getReferenceFromNestedData, getSbiFromPartitionKey,
  replaceCommasWithSpace, getVisitDateFromPossibleSources, getVetNameFromPossibleSources, getVetRcvsFromPossibleSources,
  getTestResultFromPossibleSources, parseSheepTestResults
} = require('../../../ffc-ahwr-mi-reporting/utils/parse-data')

describe('formatDate(date)', () => {
  test.each([
    {
      toString: () => 'given a date it formats it to DD/MM/YYYY HH:mm',
      given: {
        date: new Date('2023-02-23T10:20:18.352Z')
      },
      when: {
        format: undefined
      },
      expect: {
        formattedDate: '23/02/2023 10:20'
      }
    },
    {
      toString: () => 'given an ISO date it formats it to DD/MM/YYYY HH:mm',
      given: {
        date: '2023-02-23T10:20:18.352Z'
      },
      when: {
        format: moment.ISO_8601
      },
      expect: {
        formattedDate: '23/02/2023 10:20'
      }
    }
  ])('%s', async (testCase) => {
    expect(
      formatDate(testCase.given.date, testCase.when.format)
    ).toEqual(testCase.expect.formattedDate)
  })

  test('formatDate called with custom desired format outputs as expected', () => {
    const result = formatDate(new Date('2023-02-23T10:20:18.352Z'), moment.ISO_8601, 'DD-MMM-YYYY')

    expect(result).toEqual('23-Feb-2023')
  })
})
describe('arrayToString', () => {
  const inputData = ['shoes', 'socks', 'coat']
  test('array input concatenated using default separator', () => {
    const result = arrayToString(inputData)

    expect(result).toEqual('shoes socks coat')
  })
  test('array input concatenated using specified separator', () => {
    const result = arrayToString(inputData, '-')

    expect(result).toEqual('shoes-socks-coat')
  })
  test('array input returned as output if not an array', () => {
    const result = arrayToString('I am not an array', '-')

    expect(result).toEqual('I am not an array')
  })
})

describe('getSbiFromPartitionKey', () => {
  test('when inputlonger than 9 character long, return first 9 chars', () => {
    const result = getSbiFromPartitionKey('123456789a')

    expect(result).toEqual('123456789')
  })
  test('when 9 chars long, return input', () => {
    const result = arrayToString('123456789')

    expect(result).toEqual('123456789')
  })
  test('when shorter than 9 chars long, return input', () => {
    const result = arrayToString('12345')

    expect(result).toEqual('12345')
  })
})

describe('getReferenceFromNestedData', () => {
  test('returns reference value when present', () => {
    const result = getReferenceFromNestedData({
      reference: 'ref1'
    })

    expect(result).toEqual('ref1')
  })
  test('returns blank string when not present', () => {
    const result = getReferenceFromNestedData(undefined)

    expect(result).toEqual('')
  })
})

describe('replaceCommasWithSpace', () => {
  test('replaces commas in input string with a single space', () => {
    const result = replaceCommasWithSpace('well, this is awkward, maybe')

    expect(result).toEqual('well  this is awkward  maybe')
  })
  test('returns whatever value was inputted if its not a string', () => {
    const result1 = replaceCommasWithSpace(123)
    const result2 = replaceCommasWithSpace(['things', 123])

    expect(result1).toEqual(123)
    expect(result2).toEqual(['things', 123])
  })

  test('returns an empty string for undefined or null', () => {
    const result1 = replaceCommasWithSpace(undefined)
    const result2 = replaceCommasWithSpace(null)

    expect(result1).toEqual('')
    expect(result2).toEqual('')
  })
})

describe('getVisitDateFromPossibleSources', () => {
  test('returns visitDateValue when present', () => {
    const result = getVisitDateFromPossibleSources('2024-01-01', undefined, undefined)

    expect(result).toEqual('2024-01-01')
  })
  test('returns updatedValue when updatedProperty is visitDate', () => {
    const result = getVisitDateFromPossibleSources(undefined, 'visitDate', '2024-01-02')

    expect(result).toEqual('2024-01-02')
  })
  test('returns updatedValue when updatedProperty is dateOfVisit', () => {
    const result = getVisitDateFromPossibleSources(undefined, 'dateOfVisit', '2024-01-02')

    expect(result).toEqual('2024-01-02')
  })
  test('returns empty string when other updated property', () => {
    const result = getVisitDateFromPossibleSources(undefined, 'vetName', 'Ken')

    expect(result).toEqual('')
  })
})

describe('getVetNameFromPossibleSources', () => {
  test('returns vetNameValue when present', () => {
    const result = getVetNameFromPossibleSources('some vet', undefined, undefined)

    expect(result).toEqual('some vet')
  })
  test('returns updatedValue when updatedProperty is vetName', () => {
    const result = getVetNameFromPossibleSources(undefined, 'vetName', 'Terry')

    expect(result).toEqual('Terry')
  })
  test('returns updatedValue when updatedProperty is vetsName', () => {
    const result = getVetNameFromPossibleSources(undefined, 'vetsName', 'Kerry')

    expect(result).toEqual('Kerry')
  })
  test('returns empty string when other updated property', () => {
    const result = getVetNameFromPossibleSources(undefined, 'vetRcvs', '1111111')

    expect(result).toEqual('')
  })
})

describe('getVetRcvsFromPossibleSources', () => {
  test('returns vetRcvsValue when present', () => {
    const result = getVetRcvsFromPossibleSources('1234567', '7654321', undefined, undefined)

    expect(result).toEqual('1234567')
  })
  test('returns alternateVetRcvsValue when present', () => {
    const result = getVetRcvsFromPossibleSources(undefined, '7654321', undefined, undefined)

    expect(result).toEqual('7654321')
  })
  test('returns updatedValue when updatedProperty is vetRcvs', () => {
    const result = getVetRcvsFromPossibleSources(undefined, undefined, 'vetRcvs', '4444444')

    expect(result).toEqual('4444444')
  })
  test('returns updatedValue when updatedProperty is vetRCVSNumber', () => {
    const result = getVetRcvsFromPossibleSources(undefined, undefined, 'vetRCVSNumber', '5555555')

    expect(result).toEqual('5555555')
  })
  test('returns empty string when other updated property', () => {
    const result = getVetRcvsFromPossibleSources(undefined, undefined, 'vetsName', 'Bill')

    expect(result).toEqual('')
  })
})

describe('getTestResultFromPossibleSources', () => {
  test('returns vetNameValue when present', () => {
    const result = getTestResultFromPossibleSources('positive', undefined, undefined)

    expect(result).toEqual('positive')
  })
  test('returns updatedValue when updatedProperty is testResults', () => {
    const result = getTestResultFromPossibleSources(undefined, 'testResults', 'negative')

    expect(result).toEqual('negative')
  })
  test('returns empty string when other updated property', () => {
    const result = getTestResultFromPossibleSources(undefined, 'vetRcvs', '1111111')

    expect(result).toEqual('')
  })
})

describe('parseData and parsePayload', () => {
  const dateNow = new Date()
  const laterDate = new Date()
  laterDate.setSeconds(laterDate.getSeconds() + 10)
  const events = [{
    partitionKey: '123456',
    SessionId: '789123456',
    EventType: 'farmerApplyData-organisation',
    EventRaised: laterDate.toISOString(),
    Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-1234-ABCD","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
  },
  {
    partitionKey: '123456',
    SessionId: '789123456',
    EventRaised: dateNow.toISOString(),
    EventType: 'claim-organisation',
    Payload: '{"type":"claim-organisation","message":"Session set for claim and organisation.","data":{"reference":"TEMP-1234-ABCD","applicationReference":"IAHW-1234-EFGH","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-03-05T15:57:39.590Z"}'
  },
  {
    partitionKey: '123456',
    SessionId: '789123456',
    EventRaised: dateNow.toISOString(),
    EventType: 'farmerApplyData-declaration',
    Payload: '{"type":"farmerApplyData-declaration","message":"Session set for farmerApplyData and declaration.","data":{"reference":"TEMP-1234-ABCD","declaration":true},"raisedBy":"brown@test.com.test","raisedOn":"2024-01-04T21:27:23.530Z"}'
  }]

  test('parseData returns details of latest event in input list, with parsed values', () => {
    // Note that this inherited test was not clear really what it was trying to prove
    // This is a best guess based on the info at hand
    const result = parseData(events, 'farmerApplyData', 'reference')

    expect(result.value).toEqual('TEMP-1234-ABCD')
    expect(result.raisedOn).toEqual('15/02/2024 13:23')
    expect(result.raisedBy).toEqual('brown@test.com.test')
  })

  test('parsePayload returns latest event from events payload from eventType supplied', () => {
    // Note that this inherited test was not clear really what it was trying to prove
    // This is a best guess based on the info at hand
    const result = parsePayload(events, 'farmerApplyData')

    expect(result.type).toEqual('farmerApplyData-organisation')
    expect(result.message).toEqual('Session set for farmerApplyData and organisation.')
  })
})

describe('parseSheepTestResults', () => {
  test('returns empty string when no sheepTestResults and updatedProperty is not sheepTestResults', () => {
    const result = parseSheepTestResults(undefined, 'testResults', 'negative')

    expect(result).toEqual('')
  })

  test('returns empty string when sheepTestResults is empty', () => {
    const result = parseSheepTestResults([], undefined, undefined)

    expect(result).toEqual('')
  })

  test('returns formatted string from sheepTestResults', () => {
    const sheepTestResults = [
      { diseaseType: 'Bluetongue', result: 'positive' },
      { diseaseType: 'Scrapie', result: 'negative' }
    ]
    const result = parseSheepTestResults(sheepTestResults, undefined, undefined)

    expect(result).toEqual('Bluetongue  result positive  Scrapie  result negative')
  })

  test('returns formatted string from updatedProperty', () => {
    const sheepTestResults = [{ result: 'clinicalSymptomsPresent', diseaseType: 'liverFluke' }]
    const result = parseSheepTestResults(sheepTestResults, undefined, undefined)

    expect(result).toEqual('liverFluke  result clinicalSymptomsPresent')
  })
})
