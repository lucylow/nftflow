// NFTFlow Subgraph Utilities
// Helper functions for data processing and analytics

import {
  BigInt,
  Bytes,
  Address,
  ethereum,
  log,
} from "@graphprotocol/graph-ts"

import {
  Token,
  NFT,
  User,
  Collection,
  PlatformMetrics,
  DailyMetrics,
  PriceHistory,
  AnalyticsSnapshot,
} from "../generated/schema"

// ============ ADDRESS UTILITIES ============

export function isZeroAddress(address: Bytes): boolean {
  return address.equals(Address.zero())
}

export function formatAddress(address: Bytes): string {
  return address.toHexString()
}

export function getAddressFromBytes(bytes: Bytes): Address {
  return Address.fromBytes(bytes)
}

// ============ BIGINT UTILITIES ============

export function formatEther(value: BigInt): string {
  let divisor = BigInt.fromI32(10).pow(18)
  let whole = value.div(divisor)
  let fractional = value.mod(divisor)
  return whole.toString() + "." + fractional.toString()
}

export function formatUnits(value: BigInt, decimals: i32): string {
  let divisor = BigInt.fromI32(10).pow(decimals as u8)
  let whole = value.div(divisor)
  let fractional = value.mod(divisor)
  return whole.toString() + "." + fractional.toString()
}

export function parseEther(value: string): BigInt {
  // Simplified implementation - in production, use proper decimal parsing
  return BigInt.fromString(value)
}

export function calculatePercentage(part: BigInt, total: BigInt): BigInt {
  if (total.equals(BigInt.fromI32(0))) {
    return BigInt.fromI32(0)
  }
  return part.times(BigInt.fromI32(100)).div(total)
}

export function calculateAverage(values: BigInt[]): BigInt {
  if (values.length == 0) {
    return BigInt.fromI32(0)
  }
  
  let sum = BigInt.fromI32(0)
  for (let i = 0; i < values.length; i++) {
    sum = sum.plus(values[i])
  }
  
  return sum.div(BigInt.fromI32(values.length))
}

// ============ TIME UTILITIES ============

export function getDayTimestamp(timestamp: BigInt): BigInt {
  return BigInt.fromI32(timestamp.toI32() / 86400)
}

export function getHourTimestamp(timestamp: BigInt): BigInt {
  return BigInt.fromI32(timestamp.toI32() / 3600)
}

export function getWeekTimestamp(timestamp: BigInt): BigInt {
  return BigInt.fromI32(timestamp.toI32() / (86400 * 7))
}

export function getMonthTimestamp(timestamp: BigInt): BigInt {
  // Simplified - assumes 30 days per month
  return BigInt.fromI32(timestamp.toI32() / (86400 * 30))
}

export function isSameDay(timestamp1: BigInt, timestamp2: BigInt): boolean {
  return getDayTimestamp(timestamp1).equals(getDayTimestamp(timestamp2))
}

export function isSameHour(timestamp1: BigInt, timestamp2: BigInt): boolean {
  return getHourTimestamp(timestamp1).equals(getHourTimestamp(timestamp2))
}

// ============ PRICE UTILITIES ============

export function calculatePricePerSecond(totalPrice: BigInt, duration: BigInt): BigInt {
  if (duration.equals(BigInt.fromI32(0))) {
    return BigInt.fromI32(0)
  }
  return totalPrice.div(duration)
}

export function calculateTotalPrice(pricePerSecond: BigInt, duration: BigInt): BigInt {
  return pricePerSecond.times(duration)
}

export function calculateCollateralMultiplier(reputationScore: i32): i32 {
  if (reputationScore >= 800) {
    return 0 // No collateral required
  } else if (reputationScore >= 600) {
    return 25 // 25% collateral
  } else if (reputationScore >= 400) {
    return 50 // 50% collateral
  } else if (reputationScore >= 200) {
    return 75 // 75% collateral
  } else {
    return 100 // 100% collateral required
  }
}

export function calculateReputationTier(score: i32): i32 {
  if (score >= 900) {
    return 5 // Diamond
  } else if (score >= 800) {
    return 4 // Platinum
  } else if (score >= 600) {
    return 3 // Gold
  } else if (score >= 400) {
    return 2 // Silver
  } else if (score >= 200) {
    return 1 // Bronze
  } else {
    return 0 // Unranked
  }
}

// ============ ANALYTICS UTILITIES ============

export function calculateGrowthRate(current: BigInt, previous: BigInt): BigInt {
  if (previous.equals(BigInt.fromI32(0))) {
    return BigInt.fromI32(0)
  }
  
  let difference = current.minus(previous)
  return difference.times(BigInt.fromI32(100)).div(previous)
}

export function calculateVolatility(prices: BigInt[]): BigInt {
  if (prices.length < 2) {
    return BigInt.fromI32(0)
  }
  
  let average = calculateAverage(prices)
  let variance = BigInt.fromI32(0)
  
  for (let i = 0; i < prices.length; i++) {
    let difference = prices[i].minus(average)
    variance = variance.plus(difference.times(difference))
  }
  
  return variance.div(BigInt.fromI32(prices.length))
}

export function calculateLiquidityScore(volume: BigInt, listings: i32, activeRentals: i32): BigInt {
  if (listings == 0) {
    return BigInt.fromI32(0)
  }
  
  let volumePerListing = volume.div(BigInt.fromI32(listings))
  let utilizationRate = BigInt.fromI32(activeRentals).times(BigInt.fromI32(100)).div(BigInt.fromI32(listings))
  
  return volumePerListing.times(utilizationRate).div(BigInt.fromI32(100))
}

export function calculateAdoptionRate(newUsers: i32, totalUsers: i32): BigInt {
  if (totalUsers == 0) {
    return BigInt.fromI32(0)
  }
  
  return BigInt.fromI32(newUsers).times(BigInt.fromI32(100)).div(BigInt.fromI32(totalUsers))
}

// ============ RANKING UTILITIES ============

export function calculateUserRanking(user: User): i32 {
  let score = BigInt.fromI32(0)
  
  // Volume weight: 40%
  score = score.plus(user.totalVolume.times(BigInt.fromI32(40)).div(BigInt.fromI32(100)))
  
  // Reputation weight: 30%
  score = score.plus(BigInt.fromI32(user.reputationScore).times(BigInt.fromI32(30)).div(BigInt.fromI32(100)))
  
  // Activity weight: 20%
  let activityScore = BigInt.fromI32(user.totalRentals + user.totalListings)
  score = score.plus(activityScore.times(BigInt.fromI32(20)).div(BigInt.fromI32(100)))
  
  // Verification weight: 10%
  if (user.isVerified) {
    score = score.plus(BigInt.fromI32(100).times(BigInt.fromI32(10)).div(BigInt.fromI32(100)))
  }
  
  return score.toI32()
}

export function calculateCollectionRanking(collection: Collection): i32 {
  let score = BigInt.fromI32(0)
  
  // Volume weight: 50%
  score = score.plus(collection.totalVolume.times(BigInt.fromI32(50)).div(BigInt.fromI32(100)))
  
  // Activity weight: 30%
  let activityScore = BigInt.fromI32(collection.totalRentals + collection.totalListings)
  score = score.plus(activityScore.times(BigInt.fromI32(30)).div(BigInt.fromI32(100)))
  
  // Price performance weight: 20%
  if (collection.ceilingPrice.gt(BigInt.fromI32(0))) {
    let priceScore = collection.averagePrice.times(BigInt.fromI32(100)).div(collection.ceilingPrice)
    score = score.plus(priceScore.times(BigInt.fromI32(20)).div(BigInt.fromI32(100)))
  }
  
  return score.toI32()
}

// ============ MARKET UTILITIES ============

export function calculateMarketTrend(prices: BigInt[]): string {
  if (prices.length < 2) {
    return "STABLE"
  }
  
  let firstPrice = prices[0]
  let lastPrice = prices[prices.length - 1]
  
  if (lastPrice.gt(firstPrice)) {
    return "BULLISH"
  } else if (lastPrice.lt(firstPrice)) {
    return "BEARISH"
  } else {
    return "STABLE"
  }
}

export function calculatePriceRange(prices: BigInt[]): BigInt[] {
  if (prices.length == 0) {
    return [BigInt.fromI32(0), BigInt.fromI32(0)]
  }
  
  let min = prices[0]
  let max = prices[0]
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i].lt(min)) {
      min = prices[i]
    }
    if (prices[i].gt(max)) {
      max = prices[i]
    }
  }
  
  return [min, max]
}

export function calculatePricePercentile(prices: BigInt[], targetPrice: BigInt): i32 {
  if (prices.length == 0) {
    return 0
  }
  
  let count = 0
  for (let i = 0; i < prices.length; i++) {
    if (prices[i].le(targetPrice)) {
      count++
    }
  }
  
  return (count * 100) / prices.length
}

// ============ VALIDATION UTILITIES ============

export function isValidAddress(address: Bytes): boolean {
  return !isZeroAddress(address) && address.length == 20
}

export function isValidTokenId(tokenId: BigInt): boolean {
  return tokenId.ge(BigInt.fromI32(0))
}

export function isValidPrice(price: BigInt): boolean {
  return price.ge(BigInt.fromI32(0))
}

export function isValidDuration(duration: BigInt): boolean {
  return duration.gt(BigInt.fromI32(0)) && duration.le(BigInt.fromI32(31536000)) // Max 1 year
}

// ============ FORMATTING UTILITIES ============

export function formatDuration(seconds: BigInt): string {
  let days = seconds.div(BigInt.fromI32(86400))
  let hours = seconds.mod(BigInt.fromI32(86400)).div(BigInt.fromI32(3600))
  let minutes = seconds.mod(BigInt.fromI32(3600)).div(BigInt.fromI32(60))
  let secs = seconds.mod(BigInt.fromI32(60))
  
  if (days.gt(BigInt.fromI32(0))) {
    return days.toString() + "d " + hours.toString() + "h " + minutes.toString() + "m"
  } else if (hours.gt(BigInt.fromI32(0))) {
    return hours.toString() + "h " + minutes.toString() + "m " + secs.toString() + "s"
  } else if (minutes.gt(BigInt.fromI32(0))) {
    return minutes.toString() + "m " + secs.toString() + "s"
  } else {
    return secs.toString() + "s"
  }
}

export function formatReputationTier(tier: i32): string {
  switch (tier) {
    case 5:
      return "Diamond"
    case 4:
      return "Platinum"
    case 3:
      return "Gold"
    case 2:
      return "Silver"
    case 1:
      return "Bronze"
    default:
      return "Unranked"
  }
}

export function formatStreamType(streamType: string): string {
  switch (streamType) {
    case "RENTAL":
      return "Rental Payment"
    case "SUBSCRIPTION":
      return "Subscription"
    case "SALARY":
      return "Salary"
    case "ROYALTY":
      return "Royalty"
    case "CUSTOM":
      return "Custom"
    default:
      return "Unknown"
  }
}

// ============ LOGGING UTILITIES ============

export function logEvent(eventName: string, data: string): void {
  log.info("Event: {} - Data: {}", [eventName, data])
}

export function logError(error: string, context: string): void {
  log.error("Error in {}: {}", [context, error])
}

export function logWarning(warning: string, context: string): void {
  log.warning("Warning in {}: {}", [context, warning])
}

export function logInfo(info: string, context: string): void {
  log.info("Info in {}: {}", [context, info])
}

// ============ DATA VALIDATION ============

export function validateRentalData(
  totalPrice: BigInt,
  duration: BigInt,
  collateralAmount: BigInt
): boolean {
  return isValidPrice(totalPrice) && 
         isValidDuration(duration) && 
         isValidPrice(collateralAmount)
}

export function validateListingData(
  pricePerSecond: BigInt,
  minDuration: BigInt,
  maxDuration: BigInt
): boolean {
  return isValidPrice(pricePerSecond) && 
         isValidDuration(minDuration) && 
         isValidDuration(maxDuration) && 
         minDuration.le(maxDuration)
}

export function validateUserData(
  address: Bytes,
  reputationScore: i32
): boolean {
  return isValidAddress(address) && 
         reputationScore >= 0 && 
         reputationScore <= 1000
}

// ============ PERFORMANCE UTILITIES ============

export function calculateGasEfficiency(gasUsed: BigInt, value: BigInt): BigInt {
  if (value.equals(BigInt.fromI32(0))) {
    return BigInt.fromI32(0)
  }
  
  return value.div(gasUsed)
}

export function calculateTransactionCost(gasUsed: BigInt, gasPrice: BigInt): BigInt {
  return gasUsed.times(gasPrice)
}

export function calculateROI(investment: BigInt, returnValue: BigInt): BigInt {
  if (investment.equals(BigInt.fromI32(0))) {
    return BigInt.fromI32(0)
  }
  
  let profit = returnValue.minus(investment)
  return profit.times(BigInt.fromI32(100)).div(investment)
}


