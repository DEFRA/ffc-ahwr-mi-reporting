const config = require('../../../ffc-ahwr-mi-reporting/feature-toggle/config')
const { transformEventToCsvV3, buildColumns, defaultColumns, flagColumns, multiHerdsColumns, pigUpdatesColumns, pigsAndPaymentsColumns } = require('../../../ffc-ahwr-mi-reporting/mi-report-v3/transformJsonToCsvV3')
const mockContext = require('../../mock/mock-context')
const { randomUUID } = require('node:crypto')

jest.mock('@azure/storage-blob')
jest.mock('fs')

const consoleSpy = jest
  .spyOn(mockContext.log, 'error')

describe('transformEventToCsvV3', () => {
  beforeEach(() => {
    config.pigUpdates.enabled = false
    config.pigsAndPaymentsReleaseDate = '2026-01-22' // tests will fail after this date but will serve as prompt to remove.
  })

  afterEach(() => {
    consoleSpy.mockReset()
  })

  test('returns undefined when no event provided', async () => {
    const result = transformEventToCsvV3(undefined, mockContext)

    expect(consoleSpy).toHaveBeenCalledWith('No event provided')
    expect(result).toBe(undefined)
  })

  test('returns csv row when event provided', async () => {
    const event = {
      partitionKey: '123456',
      SessionId: '789123456',
      EventType: 'farmerApplyData-organisation',
      EventRaised: new Date().toISOString(),
      Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-1234-ABCD","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
    }

    const result = transformEventToCsvV3(event, mockContext)

    expect(result).toBe('123456,789123456,farmerApplyData-organisation,Session set for farmerApplyData and organisation.,TEMP-1234-ABCD,,,,,123456,0123456789,9876543210,Farmer Brown,Brown Cow Farm,brown@test.com.test,brownorg@test.com.test,Yorkshire Moors AB1 1AB United Kingdom,brown@test.com.test,2024-02-15T13:23:57.287Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,')
  })

  test('returns csv row with empty flag data when event provided', async () => {
    const uuid = randomUUID()
    const event = {
      partitionKey: '123456',
      SessionId: uuid,
      EventType: 'farmerApplyData-organisation',
      EventRaised: new Date().toISOString(),
      Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"reference":"TEMP-1234-ABCD","organisation":{"sbi":"123456","farmerName":"Farmer Brown","name":"Brown Cow Farm","email":"brown@test.com.test","orgEmail":"brownorg@test.com.test","address":"Yorkshire Moors,AB1 1AB,United Kingdom","crn":"0123456789","frn":"9876543210"}},"raisedBy":"brown@test.com.test","raisedOn":"2024-02-15T13:23:57.287Z"}'
    }

    const result = transformEventToCsvV3(event, mockContext)

    expect(result).toBe(`123456,${uuid},farmerApplyData-organisation,Session set for farmerApplyData and organisation.,TEMP-1234-ABCD,,,,,123456,0123456789,9876543210,Farmer Brown,Brown Cow Farm,brown@test.com.test,brownorg@test.com.test,Yorkshire Moors AB1 1AB United Kingdom,brown@test.com.test,2024-02-15T13:23:57.287Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`)
  })

  test('returns undefined when event contains invalid JSON in Payload field', async () => {
    const event = {
      partitionKey: '123456',
      SessionId: '789123456',
      EventType: 'farmerApplyData-organisation',
      EventRaised: new Date().toISOString(),
      Payload: ''
    }

    const result = transformEventToCsvV3(event, mockContext)

    expect(consoleSpy).toHaveBeenCalledWith('Parse event error', expect.anything(), expect.anything())
    expect(result).toBe(undefined)
  })

  test('returns csv row when event isInCheckWithSubStatus', async () => {
    const event = {
      partitionKey: '123456',
      SessionId: '789123456',
      EventRaised: new Date().toISOString(),
      EventType: 'application:status-updated:5',
      Payload: '{"type":"application:status-updated:5","message":"New stage execution has been created","data":{"reference":"AHWR-04DC-5073","statusId":5,"subStatus":"Recommend to pay"},"raisedBy":"someuser@email.com","raisedOn":"2024-01-19T15:32:07.574Z","timestamp":"2024-01-19T15:32:07.616Z"}'
    }

    const result = transformEventToCsvV3(event, mockContext)

    expect(result).toBe('123456,789123456,application:status-updated:12,New stage execution has been created,AHWR-04DC-5073,,,,,,,,,,,,,someuser@email.com,2024-01-19T15:32:07.574Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,12,RECOMMENDED TO PAY,,,,,,,,,,,,,,,,,,')
  })

  describe('sheepTestResults', () => {
    test('sheepTestResults populated from manual override', async () => {
      const uuid = '3af96f82-a93c-40a5-a6b8-5c8daf8a556a'
      const event = {
        partitionKey: '123456',
        SessionId: uuid,
        EventType: 'claim-sheepTestResults',
        EventRaised: new Date().toISOString(),
        Payload: JSON.stringify({
          type: 'claim-sheepTestResults',
          message: 'Claim data updated',
          raisedBy: 'Admin2',
          raisedOn: '2025-03-28T12:06:37.489Z',
          data: JSON.parse('{ "applicationReference": "IAHW-414E-A563", "reference": "FUSH-847A-8D52", "updatedProperty": "sheepTestResults", "newValue": [{"result": "clinicalSymptomsPresent", "diseaseType": "liverFluke"}], "oldValue": [{"result": "clinicalSymptomsNotPresent", "diseaseType": "liverFluke"}], "note": "Test result manually amended from Liverfluke (symptoms not present) to Liverfluke (symptoms present)"}')
        })
      }
      const resultAsColVals = (transformEventToCsvV3(event, mockContext)).split(',')

      const sheepResultValue = resultAsColVals[44]
      expect(sheepResultValue).toBe('liverFluke  result clinicalSymptomsPresent')
    })
  })

  describe('temp reference events', () => {
    test('Csv row does not contain temp reference when malformed key present', async () => {
      const event = {
        partitionKey: '123456',
        SessionId: '789123456',
        EventRaised: new Date().toISOString(),
        EventType: 'tempReference-[object Object]',
        Payload: '{"type":"tempReference-[object Object]","message":"Session set for tempReference and [object Object].","data":{"reference":"IAHW-K9XY-SGYI","[object Object]":"TEMP-K9XY-SGYI","ip":"40.81.156.55"},"raisedBy":"nobody@noone.com.test","raisedOn":"2025-02-11T11:44:41.319Z"}'
      }

      const resultAsColVals = (transformEventToCsvV3(event, mockContext)).split(',')

      const eventTypeValue = resultAsColVals[2]
      const messageValue = resultAsColVals[3]
      const concreteRefValue = resultAsColVals[4]
      const tempRefValue = resultAsColVals[6]

      expect(eventTypeValue).toBe('tempReference-[object Object]')
      expect(messageValue).toBe('Session set for tempReference and [object Object].')
      expect(concreteRefValue).toBe('IAHW-K9XY-SGYI')
      expect(tempRefValue).toBe('')
    })

    test('Csv row contains temp reference when correct key present', async () => {
      const event = {
        partitionKey: '123456',
        SessionId: '789123456',
        EventRaised: new Date().toISOString(),
        EventType: 'tempReference-tempReference',
        Payload: '{"type":"tempReference-tempReference","message":"Session set for tempReference and tempReference.","data":{"reference":"IAHW-K9XY-SGYI","tempReference":"TEMP-K9XY-SGYI","ip":"40.81.156.55"},"raisedBy":"nobody@noone.com.test","raisedOn":"2025-02-11T11:44:41.319Z"}'
      }

      const resultAsColVals = (transformEventToCsvV3(event, mockContext)).split(',')

      const eventTypeValue = resultAsColVals[2]
      const messageValue = resultAsColVals[3]
      const concreteRefValue = resultAsColVals[4]
      const tempRefValue = resultAsColVals[6]

      expect(eventTypeValue).toBe('tempReference-tempReference')
      expect(messageValue).toBe('Session set for tempReference and tempReference.')
      expect(concreteRefValue).toBe('IAHW-K9XY-SGYI')
      expect(tempRefValue).toBe('TEMP-K9XY-SGYI')
    })
  })

  test('returns csv row with flag reporting data', async () => {
    const uuid = randomUUID()
    const event = {
      partitionKey: '123456',
      SessionId: uuid,
      EventType: 'application-flagged',
      EventRaised: new Date().toISOString(),
      Payload: JSON.stringify({
        type: 'application-flagged',
        message: 'Application flagged',
        data: {
          flagId: 'b6b76548-bd6e-45b3-b137-05d930004c9b',
          flagDetail: 'Declined multi herds agreement',
          flagAppliesToMh: true
        },
        raisedBy: 'Jane Doe',
        raisedOn: '2025-03-28T12:06:37.489Z'
      })
    }

    const result = transformEventToCsvV3(event, mockContext)

    expect(result).toBe(`123456,${uuid},application-flagged,Application flagged,,,,,,,,,,,,,,Jane Doe,2025-03-28T12:06:37.489Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,b6b76548-bd6e-45b3-b137-05d930004c9b,Declined multi herds agreement,true,,,,,,,,,,,,,,`)
  })

  test('returns csv row with multi herds data', async () => {
    const uuid = randomUUID()
    const tempHerdId = randomUUID()
    const herdId = randomUUID()
    const event = {
      partitionKey: '123456',
      SessionId: uuid,
      EventType: 'herd-created',
      EventRaised: new Date().toISOString(),
      Payload: JSON.stringify({
        type: 'herd-created',
        message: 'Herd created',
        data: {
          tempHerdId,
          herdId,
          herdVersion: 1,
          herdName: 'Porkers',
          herdSpecies: 'pigs',
          herdCph: '123456789',
          herdReasonManagementNeeds: true,
          herdReasonUniqueHealth: true,
          herdReasonDifferentBreed: true,
          herdReasonOtherPurpose: true,
          herdReasonKeptSeparate: true,
          herdReasonOnlyHerd: true,
          herdReasonOther: true
        },
        raisedBy: 'Admin',
        raisedOn: '2025-03-28T12:06:37.489Z'
      })
    }

    const result = transformEventToCsvV3(event, mockContext)

    expect(result).toBe(`123456,${uuid},herd-created,Herd created,,,,,,,,,,,,,,Admin,2025-03-28T12:06:37.489Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,${tempHerdId},${herdId},1,Porkers,pigs,123456789,true,true,true,true,true,true,true`)
  })

  test('returns some base information from the event when no data object is found in the payload', async () => {
    const uuid = randomUUID()
    const event = {
      partitionKey: '123456',
      SessionId: uuid,
      EventType: 'application-created',
      EventRaised: new Date().toISOString(),
      Payload: JSON.stringify({
        type: 'application-created',
        message: 'Application created',
        raisedBy: 'Admin',
        raisedOn: '2025-03-28T12:06:37.489Z'
      })
    }

    const result = transformEventToCsvV3(event, mockContext)

    expect(result).toBe(`123456,${uuid},application-created,Application created,,,,,,,,,,,,,,Admin,2025-03-28T12:06:37.489Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`)
  })

  test('returns csv row with pig updates data when pig updates is enabled', async () => {
    config.pigUpdates.enabled = true
    const uuid = randomUUID()
    const event = {
      partitionKey: '123456',
      SessionId: uuid,
      EventType: 'herd-created',
      EventRaised: new Date().toISOString(),
      Payload: JSON.stringify({
        type: 'claim-pigsGeneticSequencing',
        message: 'Session set for claim and pigsGeneticSequencing.',
        data: {
          reference: 'TEMP-CLAIM-HTPH-6CKK',
          applicationReference: 'IAHW-8UZM-S5CE',
          pigsGeneticSequencing: 'mlv'
        },
        raisedBy: 'peterevansu@snavereteps.com.test',
        raisedOn: '2025-07-16T14:39:06.571Z'
      })
    }

    const result = transformEventToCsvV3(event, mockContext)

    expect(result).toBe(`123456,${uuid},claim-pigsGeneticSequencing,Session set for claim and pigsGeneticSequencing.,TEMP-CLAIM-HTPH-6CKK,IAHW-8UZM-S5CE,,,,,,,,,,,,peterevansu@snavereteps.com.test,2025-07-16T14:39:06.571Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,Modified Live virus (MLV) only`)
  })

  test('returns csv row with pigs and payments data when current date after pigs and payments release date', async () => {
    config.pigUpdates.enabled = true
    config.pigsAndPaymentsReleaseDate = '2025-12-01' // fake release date, real date is 2026-01-22

    const uuid = randomUUID()
    const event = {
      partitionKey: '123456',
      SessionId: uuid,
      EventType: 'claim-typeOfSamplesTaken',
      EventRaised: new Date().toISOString(),
      Payload: JSON.stringify({
        type: 'claim-typeOfSamplesTaken',
        message: 'Session set for claim and typeOfSamplesTaken.',
        data: {
          reference: 'TEMP-CLAIM-HTPH-6CKK',
          applicationReference: 'IAHW-8UZM-S5CE',
          typeOfSamplesTaken: 'blood'
        },
        raisedBy: 'peterevansu@snavereteps.com.test',
        raisedOn: '2025-07-16T14:39:06.571Z'
      })
    }

    const result = transformEventToCsvV3(event, mockContext)

    expect(result).toBe(`123456,${uuid},claim-typeOfSamplesTaken,Session set for claim and typeOfSamplesTaken.,TEMP-CLAIM-HTPH-6CKK,IAHW-8UZM-S5CE,,,,,,,,,,,,peterevansu@snavereteps.com.test,2025-07-16T14:39:06.571Z,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,blood,`)
  })
})

describe('buildColumns', () => {
  beforeEach(() => {
    config.pigUpdates.enabled = false
    config.pigsAndPaymentsReleaseDate = '2026-01-22' // tests will fail after this date but will serve as prompt to remove.
  })

  test('it returns the default columns, flag columns, and multiHerds columns when pig updates is disabled', () => {
    expect(buildColumns()).toEqual([...defaultColumns, ...flagColumns, ...multiHerdsColumns])
  })

  test('it returns the default columns, flag columns, multiHerds columns, and pig updates columns when pig updates is enabled', () => {
    config.pigUpdates.enabled = true
    expect(buildColumns()).toEqual([...defaultColumns, ...flagColumns, ...multiHerdsColumns, ...pigUpdatesColumns])
  })

  test('returns all columns when current date after pigs and payments release date', () => {
    config.pigUpdates.enabled = true
    config.pigsAndPaymentsReleaseDate = '2025-12-01' // fake release date, real date is 2026-01-22

    expect(buildColumns()).toEqual([...defaultColumns, ...flagColumns, ...multiHerdsColumns, ...pigUpdatesColumns, ...pigsAndPaymentsColumns])
  })
})
