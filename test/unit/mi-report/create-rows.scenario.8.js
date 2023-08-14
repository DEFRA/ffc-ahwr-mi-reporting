module.exports = {
  toString: () => "'farmerApplyData-reference' event not found",
  given: {
    events: [
      {
        partitionKey: '105110010',
        rowKey: '105110010_1678791124665',
        timestamp: '2023-03-14T10:52:05.1071641Z',
        SessionId: '43fbf5a2-f247-4eb1-b062-84fd3cd1dac4',
        EventType: 'application:status-updated:7',
        EventRaised: '2023-03-14T10:52:04.665Z',
        EventBy: 'admin',
        Payload: '{"type":"application:status-updated:7","message":"New application has been created","data":{"reference":"AHWR-43FB-F5A2","statusId":7},"raisedBy":"admin","raisedOn":"2023-03-14T10:52:04.665Z","timestamp":"2023-03-14T10:52:04.695Z"}',
        Status: 'success'
      }
    ]
  },
  expect: {
    parsedEvents: [{
      address: undefined,
      agreementCurrentStatus: 'NOT AGREED',
      applicationNumber: 'AHWR-43FB-F5A2',
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
    }]
  }
}
