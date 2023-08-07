module.exports = {
  toString: () => "'claim-reference' event not found",
  given: {
    events: [
      {
        partitionKey: '105110010',
        rowKey: '105110010_1678791125697',
        timestamp: '2023-03-14T10:52:06.2364788Z',
        SessionId: 'b628722e-f7dd-42b7-98a3-a29479ad2cdb',
        EventType: 'farmerApplyData-reference',
        EventRaised: '2023-03-14T10:52:05.697Z',
        EventBy: '1105110020@email.com',
        Payload: '{"type":"farmerApplyData-reference","message":"Session set for farmerApplyData and reference.","data":{"reference":"AHWR-43FB-F5A2"},"raisedBy":"1105110020@email.com","raisedOn":"2023-03-14T10:52:05.697Z"}',
        Status: 'success'
      },
      {
        partitionKey: '105110010',
        rowKey: '105110010_1678791124665',
        timestamp: '2023-03-14T10:52:05.1071641Z',
        SessionId: '43fbf5a2-f247-4eb1-b062-84fd3cd1dac4',
        EventType: 'application:status-updated:9',
        EventRaised: '2023-03-14T10:52:04.665Z',
        EventBy: 'admin',
        Payload: '{"type":"application:status-updated:9","message":"New application has been updated","data":{"reference":"AHWR-43FB-F5A2","statusId":9},"raisedBy":"admin","raisedOn":"2023-03-14T10:52:04.665Z","timestamp":"2023-03-14T10:52:04.695Z"}',
        Status: 'success'
      }
    ]
  },
  expect: {
    parsedEvents: [{
      address: undefined,
      agreementCurrentStatus: 'READY TO PAY',
      applicationNumber: 'AHWR-43FB-F5A2',
      applicationWithdrawn: 'no',
      applicationWithdrawnBy: 'n/a',
      applicationWithdrawnOn: 'n/a',
      claimApproved: 'yes',
      claimApprovedBy: 'admin',
      claimApprovedOn: '14/03/2023 10:52',
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
