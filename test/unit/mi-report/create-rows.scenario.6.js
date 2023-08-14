module.exports = {
  toString: () => 'test comma escape character handling',
  given: {
    events: [{
      partitionKey: '105000202',
      rowKey: '105000202_1677079362767',
      timestamp: '2023-02-22T15:22:44.2239407Z',
      SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
      EventType: 'claim-vetName',
      EventRaised: '2023-02-22T15:22:42.767Z',
      EventBy: '1100000212@email.com',
      Payload: `{
          "type":"claim-vetName",
          "message":"Session set for claim and vetName.",
          "data":{"vetName":"something, something"},
          "raisedBy":"1100000212@email.com",
          "raisedOn":"2023-02-22T15:22:42.767Z"
        }`,
      Status: 'success'
    }, {
      partitionKey: '105000202',
      rowKey: '105000202_1677079368560',
      timestamp: '2023-02-22T15:22:49.5269033Z',
      SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
      EventType: 'claim-urnResult',
      EventRaised: '2023-02-22T15:22:48.560Z',
      EventBy: '1100000212@email.com',
      Payload: `{
          "type":"claim-urnResult",
          "message":"Session set for claim and urnResult.",
          "data":{"urnResult":"URNURN, URNURN"},
          "raisedBy":"1100000212@email.com",
          "raisedOn":"2023-02-22T15:22:48.560Z"
        }`,
      Status: 'success'
    }]
  },
  expect: {
    parsedEvents: [
      {
        address: undefined,
        applicationNumber: '',
        claimClaimed: '',
        claimClaimedRaisedOn: '',
        claimDateOfTesting: 'Unknown',
        claimDateOfTestingRaisedOn: '',
        claimDetailsCorrect: '',
        claimDetailsCorrectRaisedOn: '',
        claimUrnResult: 'URNURN URNURN',
        claimUrnResultRaisedOn: '22/02/2023 15:22',
        claimVetName: 'something something',
        claimVetNameRaisedOn: '22/02/2023 15:22',
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
        sbi: undefined,
        whichReview: '',
        whichReviewRaisedOn: '',
        applicationWithdrawn: 'no',
        applicationWithdrawnBy: 'n/a',
        applicationWithdrawnOn: 'n/a',
        claimApproved: 'no',
        claimApprovedBy: 'n/a',
        claimApprovedOn: 'n/a',
        claimRejected: 'no',
        claimRejectedBy: 'n/a',
        claimRejectedOn: 'n/a',
        agreementCurrentStatus: 'n/a',
        recommendedToPay: '',
        recommendedToReject: '',
        recommendedOn: '',
        recommendedBy: ''
      }
    ]
  }
}
