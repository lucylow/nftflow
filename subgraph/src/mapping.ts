// NFTFlow Subgraph Mappings for Somnia Network
// Comprehensive event handling for NFT rental marketplace

import {
  NFTListedForRent,
  NFTRented,
  RentalCompleted,
  RentalDisputed,
  DisputeResolved,
  SOMIPaymentReceived,
  MicroPaymentProcessed,
} from "../generated/NFTFlowSOMI/NFTFlowSOMI"

import {
  StreamCreated,
  StreamWithdrawn,
  StreamFinalized,
  StreamCancelled,
  MilestoneReached,
  AutoReleaseExecuted,
  StreamDisputed,
  DisputeResolved as StreamDisputeResolved,
} from "../generated/PaymentStreamSOMI/PaymentStreamSOMI"

import {
  ReputationUpdated,
  UserVerified,
  AchievementUnlocked,
  UserWhitelisted,
  UserBlacklisted,
} from "../generated/ReputationSystemEnhanced/ReputationSystemEnhanced"

import {
  AnalyticsProcessed,
  PlatformAnalyticsUpdated,
  MarketInsightsUpdated,
  UserRankingUpdated,
  CollectionRankingUpdated,
} from "../generated/OnChainAnalytics/OnChainAnalytics"

import {
  ProposalCreated,
  VoteCast,
  ProposalExecuted,
  ProposalCancelled,
  DelegationChanged,
} from "../generated/GovernanceToken/GovernanceToken"

import {
  Transfer as ERC721Transfer,
} from "../generated/ERC721Template/IERC721"

import {
  UpdateUser,
} from "../generated/ERC4907Template/IERC4907"

import {
  Token,
  NFT,
  NFTListing,
  ListingFeatures,
  Rental,
  User,
  ReputationEvent,
  Achievement,
  Dispute,
  PlatformMetrics,
  DailyMetrics,
  Collection,
  PriceHistory,
  Transfer,
  PaymentStream,
  MilestoneEvent,
  GovernanceProposal,
  Vote,
  AnalyticsSnapshot,
} from "../generated/schema"

import {
  BigInt,
  Bytes,
  Address,
  ethereum,
  log,
  store,
} from "@graphprotocol/graph-ts"

// ============ HELPER FUNCTIONS ============

function getTokenId(address: Bytes): string {
  return address.toHexString()
}

function getNFTId(contract: Bytes, tokenId: BigInt): string {
  return contract.toHexString() + "-" + tokenId.toString()
}

function getListingId(listingId: Bytes): string {
  return listingId.toHexString()
}

function getRentalId(rentalId: Bytes): string {
  return rentalId.toHexString()
}

function getUserId(address: Bytes): string {
  return address.toHexString()
}

function getCollectionId(contract: Bytes): string {
  return contract.toHexString()
}

function getDailyMetricsId(timestamp: BigInt): string {
  let day = timestamp.toI32() / 86400
  return day.toString()
}

function getPriceHistoryId(nftId: string, timestamp: BigInt): string {
  return nftId + "-" + timestamp.toString()
}

function getMilestoneEventId(streamId: BigInt, milestoneIndex: Int): string {
  return streamId.toString() + "-" + milestoneIndex.toString()
}

function getDisputeId(rentalId: Bytes): string {
  return rentalId.toHexString()
}

function getProposalId(proposalId: BigInt): string {
  return proposalId.toString()
}

function getVoteId(proposalId: BigInt, voter: Bytes): string {
  return proposalId.toString() + "-" + voter.toHexString()
}

function getReputationEventId(txHash: Bytes, logIndex: BigInt): string {
  return txHash.toHexString() + "-" + logIndex.toString()
}

function getAchievementId(user: Bytes, achievementType: string): string {
  return user.toHexString() + "-" + achievementType
}

// ============ USER MANAGEMENT ============

function getOrCreateUser(address: Bytes): User {
  let userId = getUserId(address)
  let user = User.load(userId)
  
  if (user == null) {
    user = new User(userId)
    user.address = address
    user.totalRentals = 0
    user.totalListings = 0
    user.totalEarned = BigInt.fromI32(0)
    user.totalSpent = BigInt.fromI32(0)
    user.totalVolume = BigInt.fromI32(0)
    user.averageRentalDuration = BigInt.fromI32(0)
    user.reputationScore = 500 // Start with neutral score
    user.reputationTier = 1
    user.collateralMultiplier = 100
    user.isVerified = false
    user.isWhitelisted = false
    user.isBlacklisted = false
    user.lastActivity = BigInt.fromI32(0)
    user.createdAt = BigInt.fromI32(0)
    user.lastUpdated = BigInt.fromI32(0)
    user.save()
  }
  
  return user
}

function updateUserActivity(user: User, timestamp: BigInt): void {
  user.lastActivity = timestamp
  user.lastUpdated = timestamp
  user.save()
}

// ============ NFT MANAGEMENT ============

function getOrCreateNFT(contract: Bytes, tokenId: BigInt): NFT {
  let nftId = getNFTId(contract, tokenId)
  let nft = NFT.load(nftId)
  
  if (nft == null) {
    nft = new NFT(nftId)
    nft.contract = contract
    nft.tokenId = tokenId
    nft.name = ""
    nft.description = ""
    nft.image = ""
    nft.metadata = ""
    nft.owner = Address.zero()
    nft.currentRenter = null
    nft.isListed = false
    nft.isRented = false
    nft.totalRentals = 0
    nft.totalEarnings = BigInt.fromI32(0)
    nft.averageRentalDuration = BigInt.fromI32(0)
    nft.lastRentalTime = null
    nft.createdAt = BigInt.fromI32(0)
    nft.lastUpdated = BigInt.fromI32(0)
    nft.save()
  }
  
  return nft
}

function updateNFTRentalStats(nft: NFT, rentalValue: BigInt, duration: BigInt, timestamp: BigInt): void {
  nft.totalRentals += 1
  nft.totalEarnings = nft.totalEarnings.plus(rentalValue)
  nft.lastRentalTime = timestamp
  
  // Update average rental duration
  if (nft.totalRentals > 0) {
    let totalDuration = nft.averageRentalDuration.times(BigInt.fromI32(nft.totalRentals - 1)).plus(duration)
    nft.averageRentalDuration = totalDuration.div(BigInt.fromI32(nft.totalRentals))
  }
  
  nft.lastUpdated = timestamp
  nft.save()
}

// ============ COLLECTION MANAGEMENT ============

function getOrCreateCollection(contract: Bytes): Collection {
  let collectionId = getCollectionId(contract)
  let collection = Collection.load(collectionId)
  
  if (collection == null) {
    collection = new Collection(collectionId)
    collection.contract = contract
    collection.name = ""
    collection.symbol = ""
    collection.totalSupply = BigInt.fromI32(0)
    collection.totalListings = 0
    collection.totalRentals = 0
    collection.totalVolume = BigInt.fromI32(0)
    collection.averagePrice = BigInt.fromI32(0)
    collection.floorPrice = BigInt.fromI32(0)
    collection.ceilingPrice = BigInt.fromI32(0)
    collection.averageRentalDuration = BigInt.fromI32(0)
    collection.activeListings = 0
    collection.activeRentals = 0
    collection.verified = false
    collection.creator = null
    collection.royaltyPercentage = 0
    collection.createdAt = BigInt.fromI32(0)
    collection.lastUpdated = BigInt.fromI32(0)
    collection.save()
  }
  
  return collection
}

// ============ PLATFORM METRICS ============

function getOrCreatePlatformMetrics(): PlatformMetrics {
  let platformId = "platform"
  let platform = PlatformMetrics.load(platformId)
  
  if (platform == null) {
    platform = new PlatformMetrics(platformId)
    platform.totalUsers = 0
    platform.totalNFTs = 0
    platform.totalListings = 0
    platform.totalRentals = 0
    platform.totalVolume = BigInt.fromI32(0)
    platform.totalFees = BigInt.fromI32(0)
    platform.totalRoyalties = BigInt.fromI32(0)
    platform.totalGasUsed = BigInt.fromI32(0)
    platform.averageRentalDuration = BigInt.fromI32(0)
    platform.averageRentalValue = BigInt.fromI32(0)
    platform.disputeResolutionRate = BigInt.fromI32(0)
    platform.userRetentionRate = BigInt.fromI32(0)
    platform.lastUpdated = BigInt.fromI32(0)
    platform.save()
  }
  
  return platform
}

function updatePlatformMetrics(rentalValue: BigInt, duration: BigInt, gasUsed: BigInt, timestamp: BigInt): void {
  let platform = getOrCreatePlatformMetrics()
  
  platform.totalRentals += 1
  platform.totalVolume = platform.totalVolume.plus(rentalValue)
  platform.totalGasUsed = platform.totalGasUsed.plus(gasUsed)
  
  // Update average rental duration
  if (platform.totalRentals > 0) {
    let totalDuration = platform.averageRentalDuration.times(BigInt.fromI32(platform.totalRentals - 1)).plus(duration)
    platform.averageRentalDuration = totalDuration.div(BigInt.fromI32(platform.totalRentals))
  }
  
  // Update average rental value
  if (platform.totalRentals > 0) {
    let totalValue = platform.averageRentalValue.times(BigInt.fromI32(platform.totalRentals - 1)).plus(rentalValue)
    platform.averageRentalValue = totalValue.div(BigInt.fromI32(platform.totalRentals))
  }
  
  platform.lastUpdated = timestamp
  platform.save()
}

// ============ DAILY METRICS ============

function updateDailyMetrics(rentalValue: BigInt, gasUsed: BigInt, timestamp: BigInt): void {
  let dailyId = getDailyMetricsId(timestamp)
  let daily = DailyMetrics.load(dailyId)
  
  if (daily == null) {
    daily = new DailyMetrics(dailyId)
    daily.date = (timestamp.toI32() / 86400).toString()
    daily.newUsers = 0
    daily.newListings = 0
    daily.newRentals = 0
    daily.completedRentals = 0
    daily.volume = BigInt.fromI32(0)
    daily.fees = BigInt.fromI32(0)
    daily.royalties = BigInt.fromI32(0)
    daily.gasUsed = BigInt.fromI32(0)
    daily.averageRentalDuration = BigInt.fromI32(0)
    daily.averageRentalValue = BigInt.fromI32(0)
    daily.activeUsers = 0
    daily.activeListings = 0
    daily.activeRentals = 0
    daily.disputeCount = 0
    daily.resolvedDisputes = 0
  }
  
  daily.newRentals += 1
  daily.volume = daily.volume.plus(rentalValue)
  daily.gasUsed = daily.gasUsed.plus(gasUsed)
  
  daily.save()
}

// ============ TRANSFER RECORDING ============

function recordTransfer(
  from: Bytes,
  to: Bytes,
  value: BigInt,
  block: ethereum.Block,
  tx: ethereum.Transaction,
  purpose: string,
  nft: NFT | null,
  rental: Rental | null,
  stream: PaymentStream | null
): void {
  let transferId = tx.hash.toHexString() + "-" + block.number.toString()
  let transfer = new Transfer(transferId)
  
  transfer.from = from
  transfer.to = to
  transfer.value = value
  transfer.blockNumber = block.number
  transfer.blockTimestamp = block.timestamp
  transfer.transactionHash = tx.hash
  transfer.gasUsed = block.gasUsed
  transfer.gasPrice = tx.gasPrice
  transfer.purpose = purpose
  transfer.nft = nft ? nft.id : null
  transfer.rental = rental ? rental.id : null
  transfer.stream = stream ? stream.id : null
  
  transfer.save()
}

// ============ EVENT HANDLERS ============

export function handleNFTListedForRent(event: NFTListedForRent): void {
  let nft = getOrCreateNFT(event.params.nftContract, event.params.tokenId)
  let user = getOrCreateUser(event.params.owner)
  let collection = getOrCreateCollection(event.params.nftContract)
  
  // Update NFT
  nft.owner = event.params.owner
  nft.isListed = true
  nft.lastUpdated = event.block.timestamp
  nft.save()
  
  // Create listing
  let listingId = getListingId(event.params.listingId)
  let listing = new NFTListing(listingId)
  listing.nft = nft.id
  listing.owner = event.params.owner
  listing.pricePerSecond = event.params.pricePerSecondSOMI
  listing.minDuration = event.params.minDuration
  listing.maxDuration = event.params.maxDuration
  listing.collateralRequired = event.params.collateralRequired
  listing.active = true
  listing.verified = event.params.verified
  listing.totalRentals = 0
  listing.totalEarnings = BigInt.fromI32(0)
  listing.createdAt = event.block.timestamp
  listing.lastRentalTime = null
  listing.expiresAt = null
  listing.metadata = ""
  listing.save()
  
  // Create listing features
  let features = new ListingFeatures(listingId)
  features.supportsERC4907 = true // Assume true for now
  features.supportsMetadata = true
  features.supportsRoyalties = true
  features.supportsGovernance = true
  features.verificationLevel = 3
  features.save()
  
  // Update user
  user.totalListings += 1
  updateUserActivity(user, event.block.timestamp)
  
  // Update collection
  collection.totalListings += 1
  collection.activeListings += 1
  collection.lastUpdated = event.block.timestamp
  collection.save()
  
  // Update platform metrics
  let platform = getOrCreatePlatformMetrics()
  platform.totalListings += 1
  platform.lastUpdated = event.block.timestamp
  platform.save()
}

export function handleNFTRented(event: NFTRented): void {
  let nft = getOrCreateNFT(event.params.nftContract, event.params.tokenId)
  let tenant = getOrCreateUser(event.params.tenant)
  let lender = getOrCreateUser(nft.owner)
  
  // Update NFT
  nft.currentRenter = event.params.tenant
  nft.isRented = true
  nft.lastUpdated = event.block.timestamp
  nft.save()
  
  // Create rental
  let rentalId = getRentalId(event.params.rentalId)
  let rental = new Rental(rentalId)
  rental.nft = nft.id
  rental.lender = nft.owner
  rental.tenant = event.params.tenant
  rental.listing = "" // Will be linked later
  rental.startTime = event.block.timestamp
  rental.endTime = event.block.timestamp.plus(event.params.duration)
  rental.duration = event.params.duration
  rental.totalPrice = event.params.totalPriceSOMI
  rental.pricePerSecond = event.params.totalPriceSOMI.div(event.params.duration)
  rental.collateralAmount = event.params.collateralAmountSOMI
  rental.active = true
  rental.completed = false
  rental.disputed = false
  rental.disputeResolutionTime = null
  rental.paymentStreamId = BigInt.fromI32(0) // Will be updated by stream event
  rental.milestones = []
  rental.currentMilestone = 0
  rental.gasUsed = event.params.gasUsed
  rental.transactionFee = BigInt.fromI32(0)
  rental.createdAt = event.block.timestamp
  rental.completedAt = null
  rental.disputeStartedAt = null
  rental.disputeResolvedAt = null
  rental.save()
  
  // Update users
  tenant.totalRentals += 1
  tenant.totalSpent = tenant.totalSpent.plus(event.params.totalPriceSOMI)
  tenant.totalVolume = tenant.totalVolume.plus(event.params.totalPriceSOMI)
  updateUserActivity(tenant, event.block.timestamp)
  
  lender.totalEarned = lender.totalEarned.plus(event.params.totalPriceSOMI)
  lender.totalVolume = lender.totalVolume.plus(event.params.totalPriceSOMI)
  updateUserActivity(lender, event.block.timestamp)
  
  // Update NFT rental stats
  updateNFTRentalStats(nft, event.params.totalPriceSOMI, event.params.duration, event.block.timestamp)
  
  // Update platform metrics
  updatePlatformMetrics(event.params.totalPriceSOMI, event.params.duration, event.params.gasUsed, event.block.timestamp)
  
  // Update daily metrics
  updateDailyMetrics(event.params.totalPriceSOMI, event.params.gasUsed, event.block.timestamp)
  
  // Record transfer
  recordTransfer(
    event.params.tenant,
    nft.owner,
    event.params.totalPriceSOMI,
    event.block,
    event.transaction,
    "Rental Payment",
    nft,
    rental,
    null
  )
}

export function handleRentalCompleted(event: RentalCompleted): void {
  let rentalId = getRentalId(event.params.rentalId)
  let rental = Rental.load(rentalId)
  
  if (rental != null) {
    rental.active = false
    rental.completed = true
    rental.completedAt = event.block.timestamp
    rental.save()
    
    // Update NFT
    let nft = NFT.load(rental.nft)
    if (nft != null) {
      nft.currentRenter = null
      nft.isRented = false
      nft.lastUpdated = event.block.timestamp
      nft.save()
    }
    
    // Update daily metrics
    let daily = DailyMetrics.load(getDailyMetricsId(event.block.timestamp))
    if (daily != null) {
      daily.completedRentals += 1
      daily.save()
    }
  }
}

export function handleRentalDisputed(event: RentalDisputed): void {
  let rentalId = getRentalId(event.params.rentalId)
  let rental = Rental.load(rentalId)
  
  if (rental != null) {
    rental.disputed = true
    rental.disputeStartedAt = event.block.timestamp
    rental.save()
    
    // Create dispute
    let disputeId = getDisputeId(event.params.rentalId)
    let dispute = new Dispute(disputeId)
    dispute.rental = rentalId
    dispute.disputer = event.params.disputer
    dispute.reason = event.params.reason
    dispute.disputeFee = event.params.disputeFeeSOMI
    dispute.status = "PENDING"
    dispute.resolver = null
    dispute.resolutionTime = null
    dispute.resolvedInFavorOfTenant = false
    dispute.refundAmount = BigInt.fromI32(0)
    dispute.resolutionReason = ""
    dispute.gasUsed = BigInt.fromI32(0)
    dispute.resolutionFee = BigInt.fromI32(0)
    dispute.createdAt = event.block.timestamp
    dispute.resolvedAt = null
    dispute.save()
    
    // Update daily metrics
    let daily = DailyMetrics.load(getDailyMetricsId(event.block.timestamp))
    if (daily != null) {
      daily.disputeCount += 1
      daily.save()
    }
  }
}

export function handleDisputeResolved(event: DisputeResolved): void {
  let rentalId = getRentalId(event.params.rentalId)
  let rental = Rental.load(rentalId)
  
  if (rental != null) {
    rental.disputed = false
    rental.disputeResolvedAt = event.block.timestamp
    rental.save()
    
    // Update dispute
    let disputeId = getDisputeId(event.params.rentalId)
    let dispute = Dispute.load(disputeId)
    if (dispute != null) {
      dispute.status = "RESOLVED"
      dispute.resolver = event.params.resolver
      dispute.resolutionTime = event.block.timestamp
      dispute.resolvedInFavorOfTenant = event.params.resolvedInFavorOfTenant
      dispute.refundAmount = event.params.refundAmountSOMI
      dispute.resolutionReason = ""
      dispute.gasUsed = event.params.gasUsed
      dispute.resolutionFee = BigInt.fromI32(0)
      dispute.resolvedAt = event.block.timestamp
      dispute.save()
    }
    
    // Update daily metrics
    let daily = DailyMetrics.load(getDailyMetricsId(event.block.timestamp))
    if (daily != null) {
      daily.resolvedDisputes += 1
      daily.save()
    }
  }
}

export function handleSOMIPaymentReceived(event: SOMIPaymentReceived): void {
  // Record transfer
  recordTransfer(
    event.params.from,
    event.params.to,
    event.params.amountSOMI,
    event.block,
    event.transaction,
    event.params.purpose,
    null,
    null,
    null
  )
}

export function handleMicroPaymentProcessed(event: MicroPaymentProcessed): void {
  let user = getOrCreateUser(event.params.user)
  user.totalVolume = user.totalVolume.plus(event.params.amountSOMI)
  updateUserActivity(user, event.block.timestamp)
}

// ============ PAYMENT STREAM HANDLERS ============

export function handleStreamCreated(event: StreamCreated): void {
  let streamId = event.params.streamId.toString()
  let stream = new PaymentStream(streamId)
  
  stream.sender = event.params.sender
  stream.recipient = event.params.recipient
  stream.deposit = event.params.depositSOMI
  stream.ratePerSecond = event.params.ratePerSecondSOMI
  stream.startTime = event.params.startTime
  stream.stopTime = event.params.stopTime
  stream.remainingBalance = event.params.depositSOMI
  stream.totalWithdrawn = BigInt.fromI32(0)
  stream.active = true
  stream.finalized = false
  stream.disputed = false
  stream.platformFeeAmount = BigInt.fromI32(0)
  stream.creatorRoyaltyAmount = BigInt.fromI32(0)
  stream.creatorAddress = null
  stream.milestones = event.params.milestones
  stream.currentMilestone = 0
  stream.streamType = "RENTAL"
  stream.totalReleases = 0
  stream.lastReleaseTime = event.params.startTime
  stream.gasUsed = event.params.gasUsed
  stream.transactionFee = BigInt.fromI32(0)
  stream.createdAt = event.block.timestamp
  stream.finalizedAt = null
  
  stream.save()
  
  // Update users
  let sender = getOrCreateUser(event.params.sender)
  let recipient = getOrCreateUser(event.params.recipient)
  
  sender.totalVolume = sender.totalVolume.plus(event.params.depositSOMI)
  updateUserActivity(sender, event.block.timestamp)
  
  recipient.totalVolume = recipient.totalVolume.plus(event.params.depositSOMI)
  updateUserActivity(recipient, event.block.timestamp)
}

export function handleStreamWithdrawn(event: StreamWithdrawn): void {
  let streamId = event.params.streamId.toString()
  let stream = PaymentStream.load(streamId)
  
  if (stream != null) {
    stream.totalWithdrawn = event.params.totalWithdrawnSOMI
    stream.remainingBalance = stream.deposit.minus(event.params.totalWithdrawnSOMI)
    stream.totalReleases += 1
    stream.lastReleaseTime = event.params.timestamp
    stream.save()
    
    // Record transfer
    recordTransfer(
      Address.zero(), // Stream contract
      event.params.recipient,
      event.params.amountSOMI,
      event.block,
      event.transaction,
      "Stream Withdrawal",
      null,
      null,
      stream
    )
  }
}

export function handleStreamFinalized(event: StreamFinalized): void {
  let streamId = event.params.streamId.toString()
  let stream = PaymentStream.load(streamId)
  
  if (stream != null) {
    stream.active = false
    stream.finalized = true
    stream.finalizedAt = event.block.timestamp
    stream.save()
  }
}

export function handleMilestoneReached(event: MilestoneReached): void {
  let streamId = event.params.streamId.toString()
  let stream = PaymentStream.load(streamId)
  
  if (stream != null) {
    stream.currentMilestone = event.params.milestoneIndex.toI32()
    stream.save()
    
    // Create milestone event
    let milestoneId = getMilestoneEventId(event.params.streamId, event.params.milestoneIndex.toI32())
    let milestone = new MilestoneEvent(milestoneId)
    milestone.stream = streamId
    milestone.milestoneIndex = event.params.milestoneIndex.toI32()
    milestone.amount = event.params.amountSOMI
    milestone.timestamp = event.params.timestamp
    milestone.blockNumber = event.block.number
    milestone.transactionHash = event.transaction.hash
    milestone.save()
  }
}

// ============ REPUTATION HANDLERS ============

export function handleReputationUpdated(event: ReputationUpdated): void {
  let user = getOrCreateUser(event.params.user)
  user.reputationScore = event.params.score.toI32()
  user.isVerified = event.params.score.toI32() >= 800
  updateUserActivity(user, event.block.timestamp)
  
  // Create reputation event
  let eventId = getReputationEventId(event.transaction.hash, event.logIndex)
  let repEvent = new ReputationEvent(eventId)
  repEvent.user = user.id
  repEvent.eventType = "REPUTATION_UPDATE"
  repEvent.scoreChange = event.params.score.toI32() - user.reputationScore
  repEvent.reason = event.params.reason
  repEvent.blockNumber = event.block.number
  repEvent.blockTimestamp = event.block.timestamp
  repEvent.transactionHash = event.transaction.hash
  repEvent.createdAt = event.block.timestamp
  repEvent.save()
}

export function handleUserVerified(event: UserVerified): void {
  let user = getOrCreateUser(event.params.user)
  user.isVerified = true
  updateUserActivity(user, event.block.timestamp)
}

export function handleAchievementUnlocked(event: AchievementUnlocked): void {
  let user = getOrCreateUser(event.params.user)
  
  // Create achievement
  let achievementId = getAchievementId(event.params.user, event.params.achievementType)
  let achievement = new Achievement(achievementId)
  achievement.user = user.id
  achievement.achievementType = event.params.achievementType
  achievement.title = event.params.title
  achievement.description = event.params.description
  achievement.points = event.params.points.toI32()
  achievement.unlockedAt = event.params.timestamp
  achievement.metadata = ""
  achievement.save()
  
  updateUserActivity(user, event.block.timestamp)
}

// ============ ANALYTICS HANDLERS ============

export function handleAnalyticsProcessed(event: AnalyticsProcessed): void {
  // Update platform metrics based on analytics processing
  let platform = getOrCreatePlatformMetrics()
  platform.lastUpdated = event.block.timestamp
  platform.save()
}

export function handlePlatformAnalyticsUpdated(event: PlatformAnalyticsUpdated): void {
  let platform = getOrCreatePlatformMetrics()
  platform.totalUsers = event.params.totalUsers.toI32()
  platform.totalRentals = event.params.totalRentals.toI32()
  platform.totalVolume = event.params.totalVolume
  platform.lastUpdated = event.block.timestamp
  platform.save()
}

export function handleMarketInsightsUpdated(event: MarketInsightsUpdated): void {
  // Create analytics snapshot
  let snapshotId = event.block.timestamp.toString()
  let snapshot = new AnalyticsSnapshot(snapshotId)
  snapshot.timestamp = event.block.timestamp
  snapshot.totalUsers = 0
  snapshot.totalNFTs = 0
  snapshot.totalListings = 0
  snapshot.totalRentals = 0
  snapshot.totalVolume = event.params.totalMarketCap
  snapshot.totalFees = BigInt.fromI32(0)
  snapshot.totalRoyalties = BigInt.fromI32(0)
  snapshot.totalGasUsed = BigInt.fromI32(0)
  snapshot.averageRentalDuration = BigInt.fromI32(0)
  snapshot.averageRentalValue = BigInt.fromI32(0)
  snapshot.disputeResolutionRate = BigInt.fromI32(0)
  snapshot.userRetentionRate = BigInt.fromI32(0)
  snapshot.topCollections = []
  snapshot.topUsers = []
  snapshot.marketTrend = event.params.marketTrend
  snapshot.priceVolatility = event.params.priceVolatility
  snapshot.liquidityScore = BigInt.fromI32(0)
  snapshot.adoptionRate = BigInt.fromI32(0)
  snapshot.save()
}

// ============ GOVERNANCE HANDLERS ============

export function handleProposalCreated(event: ProposalCreated): void {
  let proposalId = getProposalId(event.params.proposalId)
  let proposal = new GovernanceProposal(proposalId)
  
  proposal.proposer = event.params.proposer
  proposal.title = event.params.title
  proposal.description = event.params.description
  proposal.startTime = event.params.startTime
  proposal.endTime = event.params.endTime
  proposal.forVotes = BigInt.fromI32(0)
  proposal.againstVotes = BigInt.fromI32(0)
  proposal.abstainVotes = BigInt.fromI32(0)
  proposal.executed = false
  proposal.cancelled = false
  proposal.proposalType = ""
  proposal.calldata = event.params.calldata
  proposal.quorumRequired = BigInt.fromI32(0)
  proposal.thresholdRequired = BigInt.fromI32(0)
  proposal.createdAt = event.block.timestamp
  proposal.executedAt = null
  
  proposal.save()
}

export function handleVoteCast(event: VoteCast): void {
  let proposalId = getProposalId(event.params.proposalId)
  let proposal = GovernanceProposal.load(proposalId)
  
  if (proposal != null) {
    // Update proposal votes
    if (event.params.support == 1) {
      proposal.forVotes = proposal.forVotes.plus(event.params.votes)
    } else if (event.params.support == 0) {
      proposal.againstVotes = proposal.againstVotes.plus(event.params.votes)
    } else if (event.params.support == 2) {
      proposal.abstainVotes = proposal.abstainVotes.plus(event.params.votes)
    }
    proposal.save()
    
    // Create vote record
    let voteId = getVoteId(event.params.proposalId, event.params.voter)
    let vote = new Vote(voteId)
    vote.proposal = proposalId
    vote.voter = event.params.voter
    vote.support = event.params.support
    vote.votes = event.params.votes
    vote.reason = event.params.reason
    vote.blockNumber = event.block.number
    vote.blockTimestamp = event.block.timestamp
    vote.transactionHash = event.transaction.hash
    vote.createdAt = event.block.timestamp
    vote.save()
  }
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  let proposalId = getProposalId(event.params.proposalId)
  let proposal = GovernanceProposal.load(proposalId)
  
  if (proposal != null) {
    proposal.executed = event.params.success
    proposal.executedAt = event.block.timestamp
    proposal.save()
  }
}

// ============ ERC721 HANDLERS ============

export function handleERC721Transfer(event: ERC721Transfer): void {
  let nft = getOrCreateNFT(event.address, event.params.tokenId)
  nft.owner = event.params.to
  nft.lastUpdated = event.block.timestamp
  nft.save()
  
  // Update collection
  let collection = getOrCreateCollection(event.address)
  collection.lastUpdated = event.block.timestamp
  collection.save()
  
  // Record transfer
  recordTransfer(
    event.params.from,
    event.params.to,
    BigInt.fromI32(1), // NFT transfer value is 1
    event.block,
    event.transaction,
    "NFT Transfer",
    nft,
    null,
    null
  )
}

// ============ ERC4907 HANDLERS ============

export function handleUpdateUser(event: UpdateUser): void {
  let nft = getOrCreateNFT(event.address, event.params.tokenId)
  nft.currentRenter = event.params.user
  nft.isRented = event.params.user != Address.zero()
  nft.lastUpdated = event.block.timestamp
  nft.save()
}



