module.exports = {
  toString: () => 'only one "auto-eligibility" event',
  given: {
    events: [
      {
        partitionKey: '105000245',
        rowKey: '105000245_1678279689481',
        timestamp: '2023-03-08T12:48:09.793288Z',
        SessionId: '105000245_1100000255',
        EventType: 'auto-eligibility:no_match',
        EventRaised: '2023-03-08T12:48:09.481Z',
        EventBy: '1100000255@email.com',
        Payload: '{"type":"auto-eligibility:no_match","message":"The customer has been recognised as ineligible","data":{"sbi":"105000245","crn":"1100000255","businessEmail":"1100000255@email.com","interestRegisteredAt":"2023-03-08T12:48:09.479Z","onWaitingList":false,"waitingUpdatedAt":"n/a","eligible":false,"ineligibleReason":"No match against data warehouse","accessGranted":false,"accessGrantedAt":"n/a"},"raisedBy":"1100000255@email.com","raisedOn":"2023-03-08T12:48:09.481Z"}',
        Status: 'success'
      }
    ]
  },
  expect: {
    parsedEvents: []
  }
}
