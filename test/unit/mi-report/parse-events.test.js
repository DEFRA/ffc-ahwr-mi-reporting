const parseEvents = require('../../../ffc-ahwr-mi-reporting/mi-report/parse-events')

describe('Parse Events', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  test.each([
    {
      toString: () => 'farmer apply journey + farmer apply and claim journey',
      given: {
        events: [
          {
            partitionKey: '105000200',
            rowKey: '105000200_1677078980670',
            timestamp: '2023-02-22T15:16:21.99797Z',
            SessionId: '1573b19c-3d4f-4fe4-b46c-3a252a21a5ac',
            EventType: 'farmerApplyData-organisation',
            EventRaised: '2023-02-22T15:16:20.670Z',
            EventBy: '1100000210@email.com',
            Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"organisation":{"farmerName":"Mr Farmer 210","name":"My Farm Batch 7 Ltd","sbi":"105000200","crn":"1100000210","address":"123 Main Road, Covenham St. Bartholomew, Louth, LN11 0PF, United Kingdom","email":"1100000210@email.com"}},"raisedBy":"1100000210@email.com","raisedOn":"2023-02-22T15:16:20.670Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000200',
            rowKey: '105000200_1677078982407',
            timestamp: '2023-02-22T15:16:23.2292654Z',
            SessionId: '1573b19c-3d4f-4fe4-b46c-3a252a21a5ac',
            EventType: 'farmerApplyData-confirmCheckDetails',
            EventRaised: '2023-02-22T15:16:22.407Z',
            EventBy: '1100000210@email.com',
            Payload: '{"type":"farmerApplyData-confirmCheckDetails","message":"Session set for farmerApplyData and confirmCheckDetails.","data":{"confirmCheckDetails":"yes"},"raisedBy":"1100000210@email.com","raisedOn":"2023-02-22T15:16:22.407Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000200',
            rowKey: '105000200_1677078983862',
            timestamp: '2023-02-22T15:16:25.3430526Z',
            SessionId: '1573b19c-3d4f-4fe4-b46c-3a252a21a5ac',
            EventType: 'farmerApplyData-whichReview',
            EventRaised: '2023-02-22T15:16:23.862Z',
            EventBy: '1100000210@email.com',
            Payload: '{"type":"farmerApplyData-whichReview","message":"Session set for farmerApplyData and whichReview.","data":{"whichReview":"dairy"},"raisedBy":"1100000210@email.com","raisedOn":"2023-02-22T15:16:23.862Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000200',
            rowKey: '105000200_1677078986305',
            timestamp: '2023-02-22T15:16:27.247962Z',
            SessionId: '1573b19c-3d4f-4fe4-b46c-3a252a21a5ac',
            EventType: 'farmerApplyData-eligibleSpecies',
            EventRaised: '2023-02-22T15:16:26.305Z',
            EventBy: '1100000210@email.com',
            Payload: '{"type":"farmerApplyData-eligibleSpecies","message":"Session set for farmerApplyData and eligibleSpecies.","data":{"eligibleSpecies":"yes"},"raisedBy":"1100000210@email.com","raisedOn":"2023-02-22T15:16:26.305Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000200',
            rowKey: '105000200_1677078987488',
            timestamp: '2023-02-22T15:16:28.4402785Z',
            SessionId: '1573b19c-3d4f-4fe4-b46c-3a252a21a5ac',
            EventType: 'farmerApplyData-reference',
            EventRaised: '2023-02-22T15:16:27.488Z',
            EventBy: '1100000210@email.com',
            Payload: '{"type":"farmerApplyData-reference","message":"Session set for farmerApplyData and reference.","data":{"reference":null},"raisedBy":"1100000210@email.com","raisedOn":"2023-02-22T15:16:27.488Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000200',
            rowKey: '105000200_1677078989725',
            timestamp: '2023-02-22T15:16:30.4581233Z',
            SessionId: '1573b19c-3d4f-4fe4-b46c-3a252a21a5ac',
            EventType: 'farmerApplyData-declaration',
            EventRaised: '2023-02-22T15:16:29.725Z',
            EventBy: '1100000210@email.com',
            Payload: '{"type":"farmerApplyData-declaration","message":"Session set for farmerApplyData and declaration.","data":{"declaration":true},"raisedBy":"1100000210@email.com","raisedOn":"2023-02-22T15:16:29.725Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000200',
            rowKey: '105000200_1677078989732',
            timestamp: '2023-02-22T15:16:30.5550674Z',
            SessionId: '1573b19c-3d4f-4fe4-b46c-3a252a21a5ac',
            EventType: 'farmerApplyData-offerStatus',
            EventRaised: '2023-02-22T15:16:29.732Z',
            EventBy: '1100000210@email.com',
            Payload: '{"type":"farmerApplyData-offerStatus","message":"Session set for farmerApplyData and offerStatus.","data":{"offerStatus":"accepted"},"raisedBy":"1100000210@email.com","raisedOn":"2023-02-22T15:16:29.732Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000200',
            rowKey: '105000200_1677078994174',
            timestamp: '2023-02-22T15:16:35.1744216Z',
            SessionId: '1573b19c-3d4f-4fe4-b46c-3a252a21a5ac',
            EventType: 'farmerApplyData-reference',
            EventRaised: '2023-02-22T15:16:34.174Z',
            EventBy: '1100000210@email.com',
            Payload: '{"type":"farmerApplyData-reference","message":"Session set for farmerApplyData and reference.","data":{"reference":"AHWR-FF86-2C53"},"raisedBy":"1100000210@email.com","raisedOn":"2023-02-22T15:16:34.174Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079319571',
            timestamp: '2023-02-22T15:22:00.3549918Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'farmerApplyData-organisation',
            EventRaised: '2023-02-22T15:21:59.571Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"organisation":{"farmerName":"Mr Farmer 212","name":"My Farm Batch 7 Ltd","sbi":"105000202","crn":"1100000212","address":"125 Main Road, Covenham St. Bartholomew, Louth, LN11 0PF, United Kingdom","email":"1100000212@email.com"}},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:21:59.571Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079321331',
            timestamp: '2023-02-22T15:22:02.195937Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'farmerApplyData-confirmCheckDetails',
            EventRaised: '2023-02-22T15:22:01.331Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"farmerApplyData-confirmCheckDetails","message":"Session set for farmerApplyData and confirmCheckDetails.","data":{"confirmCheckDetails":"yes"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:01.331Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079322603',
            timestamp: '2023-02-22T15:22:03.2393397Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'farmerApplyData-whichReview',
            EventRaised: '2023-02-22T15:22:02.603Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"farmerApplyData-whichReview","message":"Session set for farmerApplyData and whichReview.","data":{"whichReview":"pigs"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:02.603Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079324757',
            timestamp: '2023-02-22T15:22:05.3651216Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'farmerApplyData-eligibleSpecies',
            EventRaised: '2023-02-22T15:22:04.757Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"farmerApplyData-eligibleSpecies","message":"Session set for farmerApplyData and eligibleSpecies.","data":{"eligibleSpecies":"yes"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:04.757Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079325928',
            timestamp: '2023-02-22T15:22:06.5314566Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'farmerApplyData-reference',
            EventRaised: '2023-02-22T15:22:05.928Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"farmerApplyData-reference","message":"Session set for farmerApplyData and reference.","data":{"reference":null},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:05.928Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079328506',
            timestamp: '2023-02-22T15:22:09.215917Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'farmerApplyData-declaration',
            EventRaised: '2023-02-22T15:22:08.506Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"farmerApplyData-declaration","message":"Session set for farmerApplyData and declaration.","data":{"declaration":true},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:08.506Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079328513',
            timestamp: '2023-02-22T15:22:09.1689447Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'farmerApplyData-offerStatus',
            EventRaised: '2023-02-22T15:22:08.513Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"farmerApplyData-offerStatus","message":"Session set for farmerApplyData and offerStatus.","data":{"offerStatus":"accepted"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:08.513Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079331638',
            timestamp: '2023-02-22T15:22:12.3691125Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'farmerApplyData-reference',
            EventRaised: '2023-02-22T15:22:11.638Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"farmerApplyData-reference","message":"Session set for farmerApplyData and reference.","data":{"reference":"AHWR-9D11-0EAA"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:11.638Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079349346',
            timestamp: '2023-02-22T15:22:30.4897363Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-organisation',
            EventRaised: '2023-02-22T15:22:29.346Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-organisation","message":"Session set for claim and organisation.","data":{"organisation":{"farmerName":"Mr Farmer 212","name":"My Farm Batch 7 Ltd","sbi":"105000202","crn":"1100000212","address":"125 Main Road, Covenham St. Bartholomew, Louth, LN11 0PF, United Kingdom","email":"1100000212@email.com"}},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:29.346Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079349432',
            timestamp: '2023-02-22T15:22:30.5117237Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'selectYourBusiness-eligibleBusinesses',
            EventRaised: '2023-02-22T15:22:29.432Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"selectYourBusiness-eligibleBusinesses","message":"Session set for selectYourBusiness and eligibleBusinesses.","data":{"eligibleBusinesses":[{"id":"9d110eaa-9c89-4e66-8f7c-69eadea71216","reference":"AHWR-9D11-0EAA","data":{"reference":null,"declaration":true,"offerStatus":"accepted","whichReview":"pigs","organisation":{"crn":"1100000212","sbi":"105000202","name":"My Farm Batch 7 Ltd","email":"1100000212@email.com","address":"125 Main Road, Covenham St. Bartholomew, Louth, LN11 0PF, United Kingdom","farmerName":"Mr Farmer 212"},"eligibleSpecies":"yes","confirmCheckDetails":"yes"},"claimed":false,"createdAt":"2023-02-22T15:22:09.192Z","updatedAt":"2023-02-22T15:22:09.211Z","createdBy":"admin","updatedBy":null,"statusId":1}]},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:29.432Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079352144',
            timestamp: '2023-02-22T15:22:33.7488708Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'selectYourBusiness-whichBusiness',
            EventRaised: '2023-02-22T15:22:32.144Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"selectYourBusiness-whichBusiness","message":"Session set for selectYourBusiness and whichBusiness.","data":{"whichBusiness":"105000202"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:32.144Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079352150',
            timestamp: '2023-02-22T15:22:33.7898466Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-id',
            EventRaised: '2023-02-22T15:22:32.150Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-id","message":"Session set for claim and id.","data":{"id":"9d110eaa-9c89-4e66-8f7c-69eadea71216"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:32.150Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079352154',
            timestamp: '2023-02-22T15:22:33.6539248Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-reference',
            EventRaised: '2023-02-22T15:22:32.154Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-reference","message":"Session set for claim and reference.","data":{"reference":"AHWR-9D11-0EAA"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:32.154Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079352158',
            timestamp: '2023-02-22T15:22:33.8028393Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-data',
            EventRaised: '2023-02-22T15:22:32.158Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-data","message":"Session set for claim and data.","data":{"data":{"reference":null,"declaration":true,"offerStatus":"accepted","whichReview":"pigs","organisation":{"crn":"1100000212","sbi":"105000202","name":"My Farm Batch 7 Ltd","email":"1100000212@email.com","address":"125 Main Road, Covenham St. Bartholomew, Louth, LN11 0PF, United Kingdom","farmerName":"Mr Farmer 212"},"eligibleSpecies":"yes","confirmCheckDetails":"yes"}},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:32.158Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079352161',
            timestamp: '2023-02-22T15:22:33.8069084Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-claimed',
            EventRaised: '2023-02-22T15:22:32.161Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-claimed","message":"Session set for claim and claimed.","data":{"claimed":false},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:32.161Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079352163',
            timestamp: '2023-02-22T15:22:33.8030894Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-createdAt',
            EventRaised: '2023-02-22T15:22:32.163Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-createdAt","message":"Session set for claim and createdAt.","data":{"createdAt":"2023-02-22T15:22:09.192Z"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:32.163Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079352167',
            timestamp: '2023-02-22T15:22:33.7638615Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-updatedAt',
            EventRaised: '2023-02-22T15:22:32.167Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-updatedAt","message":"Session set for claim and updatedAt.","data":{"updatedAt":"2023-02-22T15:22:09.211Z"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:32.167Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079352173',
            timestamp: '2023-02-22T15:22:33.8028691Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-createdBy',
            EventRaised: '2023-02-22T15:22:32.173Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-createdBy","message":"Session set for claim and createdBy.","data":{"createdBy":"admin"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:32.173Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079352179',
            timestamp: '2023-02-22T15:22:33.7937456Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-updatedBy',
            EventRaised: '2023-02-22T15:22:32.179Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-updatedBy","message":"Session set for claim and updatedBy.","data":{"updatedBy":null},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:32.179Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079352187',
            timestamp: '2023-02-22T15:22:33.7932963Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-statusId',
            EventRaised: '2023-02-22T15:22:32.187Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-statusId","message":"Session set for claim and statusId.","data":{"statusId":1},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:32.187Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079355048',
            timestamp: '2023-02-22T15:22:36.5303481Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-detailsCorrect',
            EventRaised: '2023-02-22T15:22:35.048Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-detailsCorrect","message":"Session set for claim and detailsCorrect.","data":{"detailsCorrect":"yes"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:35.048Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079360463',
            timestamp: '2023-02-22T15:22:41.4935051Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-visitDate',
            EventRaised: '2023-02-22T15:22:40.463Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-visitDate","message":"Session set for claim and visitDate.","data":{"visitDate":"2023-02-22T00:00:00.000Z"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:40.463Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079362767',
            timestamp: '2023-02-22T15:22:44.2239407Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-vetName',
            EventRaised: '2023-02-22T15:22:42.767Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-vetName","message":"Session set for claim and vetName.","data":{"vetName":"ssdaje"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:42.767Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079366556',
            timestamp: '2023-02-22T15:22:47.4920695Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-vetRcvs',
            EventRaised: '2023-02-22T15:22:46.556Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-vetRcvs","message":"Session set for claim and vetRcvs.","data":{"vetRcvs":"1111112"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:46.556Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079368560',
            timestamp: '2023-02-22T15:22:49.5269033Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-urnResult',
            EventRaised: '2023-02-22T15:22:48.560Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-urnResult","message":"Session set for claim and urnResult.","data":{"urnResult":"URNURN"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:48.560Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1677079374873',
            timestamp: '2023-02-22T15:22:55.6344047Z',
            SessionId: 'a59f7225-24f2-498c-be2e-2de408c15d03',
            EventType: 'claim-claimed',
            EventRaised: '2023-02-22T15:22:54.873Z',
            EventBy: '1100000212@email.com',
            Payload: '{"type":"claim-claimed","message":"Session set for claim and claimed.","data":{"claimed":"success"},"raisedBy":"1100000212@email.com","raisedOn":"2023-02-22T15:22:54.873Z"}',
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1678177224031',
            timestamp: '2023-03-07T08:20:24.8923912Z',
            SessionId: 'fb6518a0-c6bf-4f21-93c1-9de5ad7a5f93',
            EventType: 'application:status-updated:2',
            EventRaised: '2023-03-07T08:20:24.031Z',
            EventBy: 'Christopher',
            Payload: `{
              "type":"application:status-updated",
              "message":"Application has been updated",
              "data":{"reference":"AHWR-9D11-0EAA","statusId":2},
              "raisedBy":"Christopher",
              "raisedOn":"2023-03-07T08:20:24.031Z"
            }`,
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1678177224031',
            timestamp: '2023-03-07T08:20:24.8923912Z',
            SessionId: 'fb6518a0-c6bf-4f21-93c1-9de5ad7a5f93',
            EventType: 'application:status-updated:9',
            EventRaised: '2023-03-07T08:21:24.031Z',
            EventBy: 'Christopher',
            Payload: `{
              "type":"application:status-updated",
              "message":"Application has been updated",
              "data":{"reference":"AHWR-9D11-0EAA","statusId":9},
              "raisedBy":"Christopher",
              "raisedOn":"2023-03-07T08:21:24.031Z"
            }`,
            Status: 'success'
          },
          {
            partitionKey: '105000202',
            rowKey: '105000202_1678177224031',
            timestamp: '2023-03-07T08:20:24.8923912Z',
            SessionId: 'fb6518a0-c6bf-4f21-93c1-9de5ad7a5f93',
            EventType: 'application:status-updated:10',
            EventRaised: '2023-03-07T08:22:24.031Z',
            EventBy: 'Marcin',
            Payload: `{
              "type":"application:status-updated",
              "message":"Application has been updated",
              "data":{"reference":"AHWR-9D11-0EAA","statusId":10},
              "raisedBy":"Marcin",
              "raisedOn":"2023-03-07T08:22:24.031Z"
            }`,
            Status: 'success'
          }
        ]
      },
      expect: {
        parsedEvents: [
          {
            address: '123 Main Road"," Covenham St. Bartholomew"," Louth"," LN11 0PF"," United Kingdom',
            applicationNumber: 'AHWR-FF86-2C53',
            claimClaimed: '',
            claimClaimedRaisedOn: '',
            claimDetailsCorrect: '',
            claimDetailsCorrectRaisedOn: '',
            claimUrnResult: '',
            claimUrnResultRaisedOn: '',
            claimVetName: '',
            claimVetNameRaisedOn: '',
            claimVetRcvs: '',
            claimVetRcvsRaisedOn: '',
            claimVisitDate: 'Unknown',
            claimVisitDateRaisedOn: '',
            confirmCheckDetails: 'yes',
            confirmCheckDetailsRaisedOn: '22/02/2023 15:16',
            cph: undefined,
            declaration: 'yes',
            declarationRaisedOn: '22/02/2023 15:16',
            eligibleSpecies: 'yes',
            eligibleSpeciesRaisedOn: '22/02/2023 15:16',
            email: '1100000210@email.com',
            farmer: 'Mr Farmer 210',
            name: 'My Farm Batch 7 Ltd',
            sbi: '105000200',
            whichReview: 'dairy',
            whichReviewRaisedOn: '22/02/2023 15:16',
            applicationWithdrawn: 'no',
            applicationWithdrawnBy: 'n/a',
            applicationWithdrawnOn: 'n/a',
            claimApproved: 'no',
            claimApprovedBy: 'n/a',
            claimApprovedOn: 'n/a',
            claimRejected: 'no',
            claimRejectedBy: 'n/a',
            claimRejectedOn: 'n/a',
            agreementCurrentStatus: 'n/a'
          },
          {
            address: '125 Main Road"," Covenham St. Bartholomew"," Louth"," LN11 0PF"," United Kingdom',
            applicationNumber: 'AHWR-9D11-0EAA',
            claimClaimed: 'success',
            claimClaimedRaisedOn: '22/02/2023 15:22',
            claimDetailsCorrect: 'yes',
            claimDetailsCorrectRaisedOn: '22/02/2023 15:22',
            claimUrnResult: 'URNURN',
            claimUrnResultRaisedOn: '22/02/2023 15:22',
            claimVetName: 'ssdaje',
            claimVetNameRaisedOn: '22/02/2023 15:22',
            claimVetRcvs: '1111112',
            claimVetRcvsRaisedOn: '22/02/2023 15:22',
            claimVisitDate: '22/02/2023',
            claimVisitDateRaisedOn: '22/02/2023 15:22',
            confirmCheckDetails: 'yes',
            confirmCheckDetailsRaisedOn: '22/02/2023 15:22',
            cph: undefined,
            declaration: 'yes',
            declarationRaisedOn: '22/02/2023 15:22',
            eligibleSpecies: 'yes',
            eligibleSpeciesRaisedOn: '22/02/2023 15:22',
            email: '1100000212@email.com',
            farmer: 'Mr Farmer 212',
            name: 'My Farm Batch 7 Ltd',
            sbi: '105000202',
            whichReview: 'pigs',
            whichReviewRaisedOn: '22/02/2023 15:22',
            applicationWithdrawn: 'yes',
            applicationWithdrawnBy: 'Christopher',
            applicationWithdrawnOn: '07/03/2023 08:20',
            claimApproved: 'yes',
            claimApprovedBy: 'Christopher',
            claimApprovedOn: '07/03/2023 08:21',
            claimRejected: 'yes',
            claimRejectedBy: 'Marcin',
            claimRejectedOn: '07/03/2023 08:22',
            agreementCurrentStatus: 'REJECTED'
          }
        ]
      }
    },
    {
      toString: () => 'no events',
      given: {
        events: []
      },
      expect: {
        parsedEvents: []
      }
    },
    {
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
    },
    {
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
            declaration: '',
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
            agreementCurrentStatus: 'n/a'
          }
        ]
      }
    },
    {
      toString: () => 'apply then withdrawn then re-apply',
      given: {
        events: [
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678374039862',
            timestamp: '2023-03-09T15:00:42.3280273Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-organisation',
            EventRaised: '2023-03-09T15:00:39.862Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"organisation":{"farmerName":"Chris Smith","name":"Chris Farm","sbi":"100000216","crn":"1000000216","address":"Some Road, London, MK45 9ES","email":"business@email.com"}},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:00:39.862Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678374044646',
            timestamp: '2023-03-09T15:00:45.8588615Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-confirmCheckDetails',
            EventRaised: '2023-03-09T15:00:44.646Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-confirmCheckDetails","message":"Session set for farmerApplyData and confirmCheckDetails.","data":{"confirmCheckDetails":"yes"},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:00:44.646Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678374049390',
            timestamp: '2023-03-09T15:00:50.8927734Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-whichReview',
            EventRaised: '2023-03-09T15:00:49.390Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-whichReview","message":"Session set for farmerApplyData and whichReview.","data":{"whichReview":"pigs"},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:00:49.390Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678374052710',
            timestamp: '2023-03-09T15:00:53.5071695Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-eligibleSpecies',
            EventRaised: '2023-03-09T15:00:52.710Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-eligibleSpecies","message":"Session set for farmerApplyData and eligibleSpecies.","data":{"eligibleSpecies":"yes"},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:00:52.710Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678374054951',
            timestamp: '2023-03-09T15:00:56.6172616Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-reference',
            EventRaised: '2023-03-09T15:00:54.951Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-reference","message":"Session set for farmerApplyData and reference.","data":{"reference":null},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:00:54.951Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678374059280',
            timestamp: '2023-03-09T15:00:59.9282305Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-declaration',
            EventRaised: '2023-03-09T15:00:59.280Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-declaration","message":"Session set for farmerApplyData and declaration.","data":{"declaration":true},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:00:59.280Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678374059281',
            timestamp: '2023-03-09T15:00:59.8832585Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-offerStatus',
            EventRaised: '2023-03-09T15:00:59.281Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-offerStatus","message":"Session set for farmerApplyData and offerStatus.","data":{"offerStatus":"accepted"},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:00:59.281Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678374061126',
            timestamp: '2023-03-09T15:01:02.2358151Z',
            SessionId: 'f8c2dd6b-f7e1-4ac6-b485-bb6e37c8c67c',
            EventType: 'application:status-updated:1',
            EventRaised: '2023-03-09T15:01:01.126Z',
            EventBy: 'admin',
            Payload: '{"type":"application:status-updated:1","message":"New application has been created","data":{"reference":"AHWR-F8C2-DD6B","statusId":1},"raisedBy":"admin","raisedOn":"2023-03-09T15:01:01.126Z","timestamp":"2023-03-09T15:01:01.478Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678374063563',
            timestamp: '2023-03-09T15:01:04.2605736Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-reference',
            EventRaised: '2023-03-09T15:01:03.563Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-reference","message":"Session set for farmerApplyData and reference.","data":{"reference":"AHWR-F8C2-DD6B"},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:01:03.563Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678374142009',
            timestamp: '2023-03-09T15:02:22.9728995Z',
            SessionId: 'f8c2dd6b-f7e1-4ac6-b485-bb6e37c8c67c',
            EventType: 'application:status-updated:2',
            EventRaised: '2023-03-09T15:02:22.009Z',
            EventBy: 'Christopher Smith (Kainos)',
            Payload: '{"type":"application:status-updated:2","message":"Application has been updated","data":{"reference":"AHWR-F8C2-DD6B","statusId":2},"raisedBy":"Christopher Smith (Kainos)","raisedOn":"2023-03-09T15:02:22.009Z","timestamp":"2023-03-09T15:02:22.184Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678375406431',
            timestamp: '2023-03-09T15:23:27.0551118Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-organisation',
            EventRaised: '2023-03-09T15:23:26.431Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-organisation","message":"Session set for farmerApplyData and organisation.","data":{"organisation":{"farmerName":"Chris Smith","name":"Chris Farm","sbi":"100000216","crn":"1000000216","address":"Some Road, London, MK45 9ES","email":"business@email.com"}},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:23:26.431Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678375410060',
            timestamp: '2023-03-09T15:23:30.5841157Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-confirmCheckDetails',
            EventRaised: '2023-03-09T15:23:30.060Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-confirmCheckDetails","message":"Session set for farmerApplyData and confirmCheckDetails.","data":{"confirmCheckDetails":"yes"},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:23:30.060Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678375412453',
            timestamp: '2023-03-09T15:23:32.9167963Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-whichReview',
            EventRaised: '2023-03-09T15:23:32.453Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-whichReview","message":"Session set for farmerApplyData and whichReview.","data":{"whichReview":"pigs"},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:23:32.453Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678375414251',
            timestamp: '2023-03-09T15:23:34.7597531Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-eligibleSpecies',
            EventRaised: '2023-03-09T15:23:34.251Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-eligibleSpecies","message":"Session set for farmerApplyData and eligibleSpecies.","data":{"eligibleSpecies":"yes"},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:23:34.251Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678375418483',
            timestamp: '2023-03-09T15:23:38.9623756Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-reference',
            EventRaised: '2023-03-09T15:23:38.483Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-reference","message":"Session set for farmerApplyData and reference.","data":{"reference":null},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:23:38.483Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678375421039',
            timestamp: '2023-03-09T15:23:41.739803Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-declaration',
            EventRaised: '2023-03-09T15:23:41.039Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-declaration","message":"Session set for farmerApplyData and declaration.","data":{"declaration":true},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:23:41.039Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678375421040',
            timestamp: '2023-03-09T15:23:41.4659578Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-offerStatus',
            EventRaised: '2023-03-09T15:23:41.040Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-offerStatus","message":"Session set for farmerApplyData and offerStatus.","data":{"offerStatus":"accepted"},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:23:41.040Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678375422820',
            timestamp: '2023-03-09T15:23:43.5018057Z',
            SessionId: '8332f439-eb1b-4b3e-89e8-f75962705ee3',
            EventType: 'application:status-updated:1',
            EventRaised: '2023-03-09T15:23:42.820Z',
            EventBy: 'admin',
            Payload: '{"type":"application:status-updated:1","message":"New application has been created","data":{"reference":"AHWR-8332-F439","statusId":1},"raisedBy":"admin","raisedOn":"2023-03-09T15:23:42.820Z","timestamp":"2023-03-09T15:23:42.975Z"}',
            Status: 'success'
          },
          {
            partitionKey: '100000216',
            rowKey: '100000216_1678375424299',
            timestamp: '2023-03-09T15:23:44.6671467Z',
            SessionId: '047e3efc-a41a-4205-8f6e-696fd71c4ae6',
            EventType: 'farmerApplyData-reference',
            EventRaised: '2023-03-09T15:23:44.299Z',
            EventBy: 'business@email.com',
            Payload: '{"type":"farmerApplyData-reference","message":"Session set for farmerApplyData and reference.","data":{"reference":"AHWR-8332-F439"},"raisedBy":"business@email.com","raisedOn":"2023-03-09T15:23:44.299Z"}',
            Status: 'success'
          }
        ]
      },
      expect: {
        parsedEvents: [
          {
            address: 'Some Road"," London"," MK45 9ES',
            applicationNumber: 'AHWR-F8C2-DD6B',
            claimClaimed: '',
            claimClaimedRaisedOn: '',
            claimDetailsCorrect: '',
            claimDetailsCorrectRaisedOn: '',
            claimUrnResult: '',
            claimUrnResultRaisedOn: '',
            claimVetName: '',
            claimVetNameRaisedOn: '',
            claimVetRcvs: '',
            claimVetRcvsRaisedOn: '',
            claimVisitDate: 'Unknown',
            claimVisitDateRaisedOn: '',
            confirmCheckDetails: 'yes',
            confirmCheckDetailsRaisedOn: '09/03/2023 15:00',
            cph: undefined,
            declaration: 'yes',
            declarationRaisedOn: '09/03/2023 15:00',
            eligibleSpecies: 'yes',
            eligibleSpeciesRaisedOn: '09/03/2023 15:00',
            email: 'business@email.com',
            farmer: 'Chris Smith',
            name: 'Chris Farm',
            sbi: '100000216',
            whichReview: 'pigs',
            whichReviewRaisedOn: '09/03/2023 15:00',
            claimRejected: 'no',
            claimRejectedBy: 'n/a',
            claimRejectedOn: 'n/a',
            claimApproved: 'no',
            claimApprovedBy: 'n/a',
            claimApprovedOn: 'n/a',
            applicationWithdrawn: 'yes',
            applicationWithdrawnBy: 'Christopher Smith (Kainos)',
            applicationWithdrawnOn: '09/03/2023 15:02',
            agreementCurrentStatus: 'WITHDRAWN'
          },
          {
            address: 'Some Road"," London"," MK45 9ES',
            applicationNumber: 'AHWR-8332-F439',
            claimClaimed: '',
            claimClaimedRaisedOn: '',
            claimDetailsCorrect: '',
            claimDetailsCorrectRaisedOn: '',
            claimUrnResult: '',
            claimUrnResultRaisedOn: '',
            claimVetName: '',
            claimVetNameRaisedOn: '',
            claimVetRcvs: '',
            claimVetRcvsRaisedOn: '',
            claimVisitDate: 'Unknown',
            claimVisitDateRaisedOn: '',
            confirmCheckDetails: 'yes',
            confirmCheckDetailsRaisedOn: '09/03/2023 15:23',
            cph: undefined,
            declaration: 'yes',
            declarationRaisedOn: '09/03/2023 15:23',
            eligibleSpecies: 'yes',
            eligibleSpeciesRaisedOn: '09/03/2023 15:23',
            email: 'business@email.com',
            farmer: 'Chris Smith',
            name: 'Chris Farm',
            sbi: '100000216',
            whichReview: 'pigs',
            whichReviewRaisedOn: '09/03/2023 15:23',
            claimRejected: 'no',
            claimRejectedBy: 'n/a',
            claimRejectedOn: 'n/a',
            claimApproved: 'no',
            claimApprovedBy: 'n/a',
            claimApprovedOn: 'n/a',
            applicationWithdrawn: 'no',
            applicationWithdrawnBy: 'n/a',
            applicationWithdrawnOn: 'n/a',
            agreementCurrentStatus: 'AGREED'
          }
        ]
      }
    }
  ])('%s', async (testCase) => {
    const parsedEvents = parseEvents(testCase.given.events)
    expect(parsedEvents).toEqual(testCase.expect.parsedEvents)
  })
})
