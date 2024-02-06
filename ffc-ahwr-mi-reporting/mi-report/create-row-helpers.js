const agreementStatusIdToString = require('./agreement-status-id-to-string')

const claimRecommendedOn = (recommendedToPayTrue, recommendedToRejectTrue, claimRecommendedToPay, claimRecommendedToReject, claimRecommendationWithInCheckSubStatus) => {
  if (recommendedToPayTrue) {
    const recommendedToPayRaisedOn = claimRecommendedToPay.raisedOn || claimRecommendationWithInCheckSubStatus.raisedOn
    return recommendedToPayRaisedOn
  } else if (recommendedToRejectTrue) {
    const recommendedToRejectRaisedOn = claimRecommendedToReject.raisedOn || claimRecommendationWithInCheckSubStatus.raisedOn
    return recommendedToRejectRaisedOn
  } else {
    return ''
  }
}

const claimRecommendedBy = (recommendedToPayTrue, recommendedToRejectTrue, claimRecommendedToPay, claimRecommendedToReject, claimRecommendationWithInCheckSubStatus) => {
  if (recommendedToPayTrue) {
    const recommendedToPayRaisedBy = (claimRecommendedToPay.raisedBy || claimRecommendationWithInCheckSubStatus.raisedBy).replace(/,/g, '","')
    return recommendedToPayRaisedBy
  } else if (recommendedToRejectTrue) {
    const recommendedToRejectRaisedBy = (claimRecommendedToReject.raisedBy || claimRecommendationWithInCheckSubStatus.raisedBy).replace(/,/g, '","')
    return recommendedToRejectRaisedBy
  } else {
    return ''
  }
}

const currentStatus = (claimApproved, claimRejected, recommendedToPayTrue, recommendedToRejectTrue, agreementCurrentStatusId) => {
  const notApproved = !claimApproved.value
  const notRejected = !claimRejected.value
  const recommendedToPay = notApproved && notRejected && recommendedToPayTrue
  const recommendedToReject = notApproved && notRejected && recommendedToRejectTrue
  if (recommendedToPay) {
    return 'RECOMMENDED TO PAY'
  } else if (recommendedToReject) {
    return 'RECOMMENDED TO REJECT'
  } else {
    return agreementStatusIdToString(agreementCurrentStatusId.value)
  }
}

const groupBy = function (array, key) {
  return array.reduce(function (grouped, x) {
    const currentKey = x[key]
    const group = grouped[currentKey] || []
    group.push(x)
    grouped[currentKey] = group
    return grouped
  }, {})
}

module.exports = { claimRecommendedOn, claimRecommendedBy, currentStatus, groupBy }
