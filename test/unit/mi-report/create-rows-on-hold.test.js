
const parseEvents = require('../../../ffc-ahwr-mi-reporting/mi-report/create-rows')
const data = require('../../data/on-hold-events.json')
describe('createRows', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test.each([
    {
      toString: () => 'same sbi - not agreed; withdrawn; ready-to-pay',
      given: {
        events: data
      },
      expect: {
        parsedEvents: [
          {
            address: undefined,
            agreementCurrentStatus: 'AGREED',
            applicationNumber: '',
            applicationWithdrawn: 'no',
            applicationWithdrawnBy: 'n/a',
            applicationWithdrawnOn: 'n/a',
            claimApproved: 'no',
            claimApprovedBy: 'n/a',
            claimApprovedOn: 'n/a',
            claimClaimed: '',
            claimClaimedRaisedOn: '',
            claimDateOfTesting: 'Unknown',
            claimDateOfTestingRaisedOn: '',
            claimDetailsCorrect: '',
            claimDetailsCorrectRaisedOn: '',
            claimRejected: 'no',
            claimRejectedBy: 'n/a',
            claimRejectedOn: 'n/a',
            claimUrnResult: '',
            claimUrnResultRaisedOn: '',
            claimVetName: '',
            claimVetNameRaisedOn: '',
            claimVetRcvs: '',
            claimVetRcvsRaisedOn: '',
            claimVisitDate: 'Unknown',
            claimVisitDateRaisedOn: '',
            confirmCheckDetails: '',
            confirmCheckDetailsRaisedOn: '',
            cph: undefined,
            declaration: 'no',
            declarationRaisedOn: '',
            eligibleSpecies: '',
            eligibleSpeciesRaisedOn: '',
            email: undefined,
            farmer: undefined,
            name: undefined,
            recommendedBy: '',
            recommendedOn: '',
            recommendedToPay: '',
            recommendedToReject: '',
            sbi: undefined,
            whichReview: '',
            whichReviewRaisedOn: ''
          },
          {
            address: undefined,
            agreementCurrentStatus: 'ON HOLD',
            applicationNumber: 'AHWR-1396-8DAF',
            applicationWithdrawn: 'no',
            applicationWithdrawnBy: 'n/a',
            applicationWithdrawnOn: 'n/a',
            claimApproved: 'no',
            claimApprovedBy: 'n/a',
            claimApprovedOn: 'n/a',
            claimClaimed: 'success',
            claimClaimedRaisedOn: '08/11/2023 15:16',
            claimDateOfTesting: '08/11/2023',
            claimDateOfTestingRaisedOn: '08/11/2023 15:16',
            claimDetailsCorrect: 'yes',
            claimDetailsCorrectRaisedOn: '08/11/2023 15:16',
            claimRejected: 'no',
            claimRejectedBy: 'n/a',
            claimRejectedOn: 'n/a',
            claimUrnResult: '7654321',
            claimUrnResultRaisedOn: '08/11/2023 15:16',
            claimVetName: 'Iain James Stanley',
            claimVetNameRaisedOn: '08/11/2023 15:16',
            claimVetRcvs: '1234567',
            claimVetRcvsRaisedOn: '08/11/2023 15:16',
            claimVisitDate: '08/11/2023',
            claimVisitDateRaisedOn: '08/11/2023 15:16',
            confirmCheckDetails: '',
            confirmCheckDetailsRaisedOn: '',
            cph: undefined,
            declaration: 'no',
            declarationRaisedOn: '',
            eligibleSpecies: '',
            eligibleSpeciesRaisedOn: '',
            email: undefined,
            farmer: undefined,
            name: undefined,
            recommendedBy: '',
            recommendedOn: '',
            recommendedToPay: '',
            recommendedToReject: '',
            sbi: undefined,
            whichReview: '',
            whichReviewRaisedOn: ''
          }
        ]
      }
    }

  ])('%s', async (testCase) => {
    const parsedEvents = parseEvents(testCase.given.events)
    expect(parsedEvents).toEqual(testCase.expect.parsedEvents)
  })
})
