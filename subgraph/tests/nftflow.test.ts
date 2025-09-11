// NFTFlow Subgraph Tests
// Comprehensive test suite for NFTFlow subgraph functionality

import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  log,
} from "matchstick-as/assembly/index"

import {
  Address,
  BigInt,
  Bytes,
  ethereum,
} from "@graphprotocol/graph-ts"

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
  handleNFTListedForRent,
  handleNFTRented,
  handleRentalCompleted,
  handleRentalDisputed,
  handleDisputeResolved,
  handleSOMIPaymentReceived,
  handleMicroPaymentProcessed,
} from "../src/mapping"

import {
  createNFTListedForRentEvent,
  createNFTRentedEvent,
  createRentalCompletedEvent,
  createRentalDisputedEvent,
  createDisputeResolvedEvent,
  createSOMIPaymentReceivedEvent,
  createMicroPaymentProcessedEvent,
} from "./nftflow-utils"

// ============ TEST SETUP ============

describe("NFTFlow Subgraph", () => {
  beforeAll(() => {
    log.info("Starting NFTFlow subgraph tests", [])
  })

  afterAll(() => {
    log.info("Completed NFTFlow subgraph tests", [])
  })

  beforeEach(() => {
    clearStore()
  })

  afterEach(() => {
    // Clean up after each test
  })

  // ============ NFT LISTING TESTS ============

  test("Can handle NFTListedForRent event", () => {
    // Create test data
    let nftContract = Address.fromString("0x1234567890123456789012345678901234567890")
    let tokenId = BigInt.fromI32(1)
    let owner = Address.fromString("0x1111111111111111111111111111111111111111")
    let pricePerSecond = BigInt.fromI32(1000000000000000) // 0.001 SOMI per second
    let minDuration = BigInt.fromI32(3600) // 1 hour
    let maxDuration = BigInt.fromI32(86400) // 1 day
    let collateralRequired = BigInt.fromI32(1000000000000000000) // 1 SOMI
    let verified = true

    // Create event
    let event = createNFTListedForRentEvent(
      Bytes.fromHexString("0xabcdef"),
      nftContract,
      tokenId,
      owner,
      pricePerSecond,
      minDuration,
      maxDuration,
      collateralRequired,
      verified
    )

    // Handle event
    handleNFTListedForRent(event)

    // Assertions
    assert.entityCount("NFT", 1)
    assert.entityCount("NFTListing", 1)
    assert.entityCount("User", 1)
    assert.entityCount("Collection", 1)
    assert.entityCount("ListingFeatures", 1)

    // Check NFT entity
    let nftId = nftContract.toHexString() + "-" + tokenId.toString()
    assert.fieldEquals("NFT", nftId, "contract", nftContract.toHexString())
    assert.fieldEquals("NFT", nftId, "tokenId", tokenId.toString())
    assert.fieldEquals("NFT", nftId, "owner", owner.toHexString())
    assert.fieldEquals("NFT", nftId, "isListed", "true")

    // Check listing entity
    let listingId = "0xabcdef"
    assert.fieldEquals("NFTListing", listingId, "nft", nftId)
    assert.fieldEquals("NFTListing", listingId, "owner", owner.toHexString())
    assert.fieldEquals("NFTListing", listingId, "pricePerSecond", pricePerSecond.toString())
    assert.fieldEquals("NFTListing", listingId, "minDuration", minDuration.toString())
    assert.fieldEquals("NFTListing", listingId, "maxDuration", maxDuration.toString())
    assert.fieldEquals("NFTListing", listingId, "active", "true")
    assert.fieldEquals("NFTListing", listingId, "verified", "true")

    // Check user entity
    let userId = owner.toHexString()
    assert.fieldEquals("User", userId, "address", owner.toHexString())
    assert.fieldEquals("User", userId, "totalListings", "1")

    // Check collection entity
    let collectionId = nftContract.toHexString()
    assert.fieldEquals("Collection", collectionId, "contract", nftContract.toHexString())
    assert.fieldEquals("Collection", collectionId, "totalListings", "1")
    assert.fieldEquals("Collection", collectionId, "activeListings", "1")
  })

  test("Can handle multiple NFTListedForRent events", () => {
    let nftContract = Address.fromString("0x1234567890123456789012345678901234567890")
    let owner = Address.fromString("0x1111111111111111111111111111111111111111")

    // Create first listing
    let event1 = createNFTListedForRentEvent(
      Bytes.fromHexString("0xabcdef"),
      nftContract,
      BigInt.fromI32(1),
      owner,
      BigInt.fromI32(1000000000000000),
      BigInt.fromI32(3600),
      BigInt.fromI32(86400),
      BigInt.fromI32(1000000000000000000),
      true
    )

    // Create second listing
    let event2 = createNFTListedForRentEvent(
      Bytes.fromHexString("0xfedcba"),
      nftContract,
      BigInt.fromI32(2),
      owner,
      BigInt.fromI32(2000000000000000),
      BigInt.fromI32(7200),
      BigInt.fromI32(172800),
      BigInt.fromI32(2000000000000000000),
      true
    )

    // Handle events
    handleNFTListedForRent(event1)
    handleNFTListedForRent(event2)

    // Assertions
    assert.entityCount("NFT", 2)
    assert.entityCount("NFTListing", 2)
    assert.entityCount("User", 1)
    assert.entityCount("Collection", 1)

    // Check user has 2 listings
    let userId = owner.toHexString()
    assert.fieldEquals("User", userId, "totalListings", "2")

    // Check collection has 2 listings
    let collectionId = nftContract.toHexString()
    assert.fieldEquals("Collection", collectionId, "totalListings", "2")
    assert.fieldEquals("Collection", collectionId, "activeListings", "2")
  })

  // ============ RENTAL TESTS ============

  test("Can handle NFTRented event", () => {
    // First create a listing
    let nftContract = Address.fromString("0x1234567890123456789012345678901234567890")
    let tokenId = BigInt.fromI32(1)
    let owner = Address.fromString("0x1111111111111111111111111111111111111111")
    let tenant = Address.fromString("0x2222222222222222222222222222222222222222")

    let listingEvent = createNFTListedForRentEvent(
      Bytes.fromHexString("0xabcdef"),
      nftContract,
      tokenId,
      owner,
      BigInt.fromI32(1000000000000000),
      BigInt.fromI32(3600),
      BigInt.fromI32(86400),
      BigInt.fromI32(1000000000000000000),
      true
    )

    handleNFTListedForRent(listingEvent)

    // Now create rental event
    let rentalEvent = createNFTRentedEvent(
      Bytes.fromHexString("0x123456"),
      nftContract,
      tokenId,
      tenant,
      BigInt.fromI32(7200), // 2 hours
      BigInt.fromI32(2000000000000000000), // 2 SOMI total
      BigInt.fromI32(1000000000000000000), // 1 SOMI collateral
      BigInt.fromI32(100000) // gas used
    )

    handleNFTRented(rentalEvent)

    // Assertions
    assert.entityCount("Rental", 1)
    assert.entityCount("Transfer", 1)

    // Check rental entity
    let rentalId = "0x123456"
    assert.fieldEquals("Rental", rentalId, "nft", nftContract.toHexString() + "-" + tokenId.toString())
    assert.fieldEquals("Rental", rentalId, "lender", owner.toHexString())
    assert.fieldEquals("Rental", rentalId, "tenant", tenant.toHexString())
    assert.fieldEquals("Rental", rentalId, "duration", "7200")
    assert.fieldEquals("Rental", rentalId, "totalPrice", "2000000000000000000")
    assert.fieldEquals("Rental", rentalId, "collateralAmount", "1000000000000000000")
    assert.fieldEquals("Rental", rentalId, "active", "true")
    assert.fieldEquals("Rental", rentalId, "completed", "false")

    // Check NFT is marked as rented
    let nftId = nftContract.toHexString() + "-" + tokenId.toString()
    assert.fieldEquals("NFT", nftId, "currentRenter", tenant.toHexString())
    assert.fieldEquals("NFT", nftId, "isRented", "true")
    assert.fieldEquals("NFT", nftId, "totalRentals", "1")
    assert.fieldEquals("NFT", nftId, "totalEarnings", "2000000000000000000")

    // Check users
    let ownerId = owner.toHexString()
    let tenantId = tenant.toHexString()
    assert.fieldEquals("User", ownerId, "totalEarned", "2000000000000000000")
    assert.fieldEquals("User", tenantId, "totalRentals", "1")
    assert.fieldEquals("User", tenantId, "totalSpent", "2000000000000000000")

    // Check transfer
    let transferId = rentalEvent.transaction.hash.toHexString() + "-" + rentalEvent.block.number.toString()
    assert.fieldEquals("Transfer", transferId, "from", tenant.toHexString())
    assert.fieldEquals("Transfer", transferId, "to", owner.toHexString())
    assert.fieldEquals("Transfer", transferId, "value", "2000000000000000000")
    assert.fieldEquals("Transfer", transferId, "purpose", "Rental Payment")
  })

  test("Can handle RentalCompleted event", () => {
    // First create listing and rental
    let nftContract = Address.fromString("0x1234567890123456789012345678901234567890")
    let tokenId = BigInt.fromI32(1)
    let owner = Address.fromString("0x1111111111111111111111111111111111111111")
    let tenant = Address.fromString("0x2222222222222222222222222222222222222222")

    let listingEvent = createNFTListedForRentEvent(
      Bytes.fromHexString("0xabcdef"),
      nftContract,
      tokenId,
      owner,
      BigInt.fromI32(1000000000000000),
      BigInt.fromI32(3600),
      BigInt.fromI32(86400),
      BigInt.fromI32(1000000000000000000),
      true
    )

    let rentalEvent = createNFTRentedEvent(
      Bytes.fromHexString("0x123456"),
      nftContract,
      tokenId,
      tenant,
      BigInt.fromI32(7200),
      BigInt.fromI32(2000000000000000000),
      BigInt.fromI32(1000000000000000000),
      BigInt.fromI32(100000)
    )

    handleNFTListedForRent(listingEvent)
    handleNFTRented(rentalEvent)

    // Now complete the rental
    let completionEvent = createRentalCompletedEvent(
      Bytes.fromHexString("0x123456"),
      BigInt.fromI32(1640995200), // completion time
      BigInt.fromI32(2000000000000000000), // total paid
      true, // successful
      BigInt.fromI32(50000) // gas used
    )

    handleRentalCompleted(completionEvent)

    // Assertions
    let rentalId = "0x123456"
    assert.fieldEquals("Rental", rentalId, "active", "false")
    assert.fieldEquals("Rental", rentalId, "completed", "true")
    assert.fieldEquals("Rental", rentalId, "completedAt", "1640995200")

    // Check NFT is no longer rented
    let nftId = nftContract.toHexString() + "-" + tokenId.toString()
    assert.fieldEquals("NFT", nftId, "currentRenter", "null")
    assert.fieldEquals("NFT", nftId, "isRented", "false")
  })

  // ============ DISPUTE TESTS ============

  test("Can handle RentalDisputed event", () => {
    // First create listing and rental
    let nftContract = Address.fromString("0x1234567890123456789012345678901234567890")
    let tokenId = BigInt.fromI32(1)
    let owner = Address.fromString("0x1111111111111111111111111111111111111111")
    let tenant = Address.fromString("0x2222222222222222222222222222222222222222")

    let listingEvent = createNFTListedForRentEvent(
      Bytes.fromHexString("0xabcdef"),
      nftContract,
      tokenId,
      owner,
      BigInt.fromI32(1000000000000000),
      BigInt.fromI32(3600),
      BigInt.fromI32(86400),
      BigInt.fromI32(1000000000000000000),
      true
    )

    let rentalEvent = createNFTRentedEvent(
      Bytes.fromHexString("0x123456"),
      nftContract,
      tokenId,
      tenant,
      BigInt.fromI32(7200),
      BigInt.fromI32(2000000000000000000),
      BigInt.fromI32(1000000000000000000),
      BigInt.fromI32(100000)
    )

    handleNFTListedForRent(listingEvent)
    handleNFTRented(rentalEvent)

    // Create dispute
    let disputeEvent = createRentalDisputedEvent(
      Bytes.fromHexString("0x123456"),
      tenant,
      "NFT not as described",
      BigInt.fromI32(1640995200),
      BigInt.fromI32(100000000000000000) // 0.1 SOMI dispute fee
    )

    handleRentalDisputed(disputeEvent)

    // Assertions
    assert.entityCount("Dispute", 1)

    let disputeId = "0x123456"
    assert.fieldEquals("Dispute", disputeId, "rental", "0x123456")
    assert.fieldEquals("Dispute", disputeId, "disputer", tenant.toHexString())
    assert.fieldEquals("Dispute", disputeId, "reason", "NFT not as described")
    assert.fieldEquals("Dispute", disputeId, "disputeFee", "100000000000000000")
    assert.fieldEquals("Dispute", disputeId, "status", "PENDING")

    // Check rental is marked as disputed
    let rentalId = "0x123456"
    assert.fieldEquals("Rental", rentalId, "disputed", "true")
  })

  test("Can handle DisputeResolved event", () => {
    // First create listing, rental, and dispute
    let nftContract = Address.fromString("0x1234567890123456789012345678901234567890")
    let tokenId = BigInt.fromI32(1)
    let owner = Address.fromString("0x1111111111111111111111111111111111111111")
    let tenant = Address.fromString("0x2222222222222222222222222222222222222222")
    let resolver = Address.fromString("0x3333333333333333333333333333333333333333")

    let listingEvent = createNFTListedForRentEvent(
      Bytes.fromHexString("0xabcdef"),
      nftContract,
      tokenId,
      owner,
      BigInt.fromI32(1000000000000000),
      BigInt.fromI32(3600),
      BigInt.fromI32(86400),
      BigInt.fromI32(1000000000000000000),
      true
    )

    let rentalEvent = createNFTRentedEvent(
      Bytes.fromHexString("0x123456"),
      nftContract,
      tokenId,
      tenant,
      BigInt.fromI32(7200),
      BigInt.fromI32(2000000000000000000),
      BigInt.fromI32(1000000000000000000),
      BigInt.fromI32(100000)
    )

    let disputeEvent = createRentalDisputedEvent(
      Bytes.fromHexString("0x123456"),
      tenant,
      "NFT not as described",
      BigInt.fromI32(1640995200),
      BigInt.fromI32(100000000000000000)
    )

    handleNFTListedForRent(listingEvent)
    handleNFTRented(rentalEvent)
    handleRentalDisputed(disputeEvent)

    // Resolve dispute
    let resolutionEvent = createDisputeResolvedEvent(
      Bytes.fromHexString("0x123456"),
      resolver,
      true, // resolved in favor of tenant
      BigInt.fromI32(500000000000000000), // 0.5 SOMI refund
      BigInt.fromI32(75000) // gas used
    )

    handleDisputeResolved(resolutionEvent)

    // Assertions
    let disputeId = "0x123456"
    assert.fieldEquals("Dispute", disputeId, "status", "RESOLVED")
    assert.fieldEquals("Dispute", disputeId, "resolver", resolver.toHexString())
    assert.fieldEquals("Dispute", disputeId, "resolvedInFavorOfTenant", "true")
    assert.fieldEquals("Dispute", disputeId, "refundAmount", "500000000000000000")

    // Check rental is no longer disputed
    let rentalId = "0x123456"
    assert.fieldEquals("Rental", rentalId, "disputed", "false")
  })

  // ============ PAYMENT TESTS ============

  test("Can handle SOMIPaymentReceived event", () => {
    let from = Address.fromString("0x1111111111111111111111111111111111111111")
    let to = Address.fromString("0x2222222222222222222222222222222222222222")
    let amount = BigInt.fromI32(1000000000000000000) // 1 SOMI
    let purpose = "Rental Payment"
    let timestamp = BigInt.fromI32(1640995200)

    let event = createSOMIPaymentReceivedEvent(
      from,
      to,
      amount,
      purpose,
      timestamp
    )

    handleSOMIPaymentReceived(event)

    // Assertions
    assert.entityCount("Transfer", 1)

    let transferId = event.transaction.hash.toHexString() + "-" + event.block.number.toString()
    assert.fieldEquals("Transfer", transferId, "from", from.toHexString())
    assert.fieldEquals("Transfer", transferId, "to", to.toHexString())
    assert.fieldEquals("Transfer", transferId, "value", amount.toString())
    assert.fieldEquals("Transfer", transferId, "purpose", purpose)
  })

  test("Can handle MicroPaymentProcessed event", () => {
    let user = Address.fromString("0x1111111111111111111111111111111111111111")
    let amount = BigInt.fromI32(1000000000000000) // 0.001 SOMI
    let gasUsed = BigInt.fromI32(50000)
    let timestamp = BigInt.fromI32(1640995200)

    let event = createMicroPaymentProcessedEvent(
      user,
      amount,
      gasUsed,
      timestamp
    )

    handleMicroPaymentProcessed(event)

    // Assertions
    let userId = user.toHexString()
    assert.fieldEquals("User", userId, "totalVolume", amount.toString())
  })

  // ============ INTEGRATION TESTS ============

  test("Can handle complete rental lifecycle", () => {
    let nftContract = Address.fromString("0x1234567890123456789012345678901234567890")
    let tokenId = BigInt.fromI32(1)
    let owner = Address.fromString("0x1111111111111111111111111111111111111111")
    let tenant = Address.fromString("0x2222222222222222222222222222222222222222")

    // 1. List NFT for rent
    let listingEvent = createNFTListedForRentEvent(
      Bytes.fromHexString("0xabcdef"),
      nftContract,
      tokenId,
      owner,
      BigInt.fromI32(1000000000000000),
      BigInt.fromI32(3600),
      BigInt.fromI32(86400),
      BigInt.fromI32(1000000000000000000),
      true
    )

    handleNFTListedForRent(listingEvent)

    // 2. Rent NFT
    let rentalEvent = createNFTRentedEvent(
      Bytes.fromHexString("0x123456"),
      nftContract,
      tokenId,
      tenant,
      BigInt.fromI32(7200),
      BigInt.fromI32(2000000000000000000),
      BigInt.fromI32(1000000000000000000),
      BigInt.fromI32(100000)
    )

    handleNFTRented(rentalEvent)

    // 3. Complete rental
    let completionEvent = createRentalCompletedEvent(
      Bytes.fromHexString("0x123456"),
      BigInt.fromI32(1640995200),
      BigInt.fromI32(2000000000000000000),
      true,
      BigInt.fromI32(50000)
    )

    handleRentalCompleted(completionEvent)

    // Assertions
    assert.entityCount("NFT", 1)
    assert.entityCount("NFTListing", 1)
    assert.entityCount("Rental", 1)
    assert.entityCount("Transfer", 1)
    assert.entityCount("User", 2)

    // Check final state
    let nftId = nftContract.toHexString() + "-" + tokenId.toString()
    assert.fieldEquals("NFT", nftId, "totalRentals", "1")
    assert.fieldEquals("NFT", nftId, "totalEarnings", "2000000000000000000")
    assert.fieldEquals("NFT", nftId, "isRented", "false")

    let rentalId = "0x123456"
    assert.fieldEquals("Rental", rentalId, "active", "false")
    assert.fieldEquals("Rental", rentalId, "completed", "true")

    let ownerId = owner.toHexString()
    let tenantId = tenant.toHexString()
    assert.fieldEquals("User", ownerId, "totalEarned", "2000000000000000000")
    assert.fieldEquals("User", tenantId, "totalSpent", "2000000000000000000")
  })

  test("Can handle multiple users and collections", () => {
    let nftContract1 = Address.fromString("0x1234567890123456789012345678901234567890")
    let nftContract2 = Address.fromString("0x0987654321098765432109876543210987654321")
    let owner1 = Address.fromString("0x1111111111111111111111111111111111111111")
    let owner2 = Address.fromString("0x2222222222222222222222222222222222222222")
    let tenant = Address.fromString("0x3333333333333333333333333333333333333333")

    // Create listings for different collections
    let listing1 = createNFTListedForRentEvent(
      Bytes.fromHexString("0xabcdef"),
      nftContract1,
      BigInt.fromI32(1),
      owner1,
      BigInt.fromI32(1000000000000000),
      BigInt.fromI32(3600),
      BigInt.fromI32(86400),
      BigInt.fromI32(1000000000000000000),
      true
    )

    let listing2 = createNFTListedForRentEvent(
      Bytes.fromHexString("0xfedcba"),
      nftContract2,
      BigInt.fromI32(1),
      owner2,
      BigInt.fromI32(2000000000000000),
      BigInt.fromI32(7200),
      BigInt.fromI32(172800),
      BigInt.fromI32(2000000000000000000),
      true
    )

    handleNFTListedForRent(listing1)
    handleNFTListedForRent(listing2)

    // Rent from both collections
    let rental1 = createNFTRentedEvent(
      Bytes.fromHexString("0x111111"),
      nftContract1,
      BigInt.fromI32(1),
      tenant,
      BigInt.fromI32(3600),
      BigInt.fromI32(1000000000000000000),
      BigInt.fromI32(500000000000000000),
      BigInt.fromI32(100000)
    )

    let rental2 = createNFTRentedEvent(
      Bytes.fromHexString("0x222222"),
      nftContract2,
      BigInt.fromI32(1),
      tenant,
      BigInt.fromI32(7200),
      BigInt.fromI32(2000000000000000000),
      BigInt.fromI32(1000000000000000000),
      BigInt.fromI32(120000)
    )

    handleNFTRented(rental1)
    handleNFTRented(rental2)

    // Assertions
    assert.entityCount("NFT", 2)
    assert.entityCount("NFTListing", 2)
    assert.entityCount("Rental", 2)
    assert.entityCount("User", 3)
    assert.entityCount("Collection", 2)

    // Check tenant has 2 rentals
    let tenantId = tenant.toHexString()
    assert.fieldEquals("User", tenantId, "totalRentals", "2")
    assert.fieldEquals("User", tenantId, "totalSpent", "3000000000000000000")

    // Check collections
    let collection1Id = nftContract1.toHexString()
    let collection2Id = nftContract2.toHexString()
    assert.fieldEquals("Collection", collection1Id, "totalRentals", "1")
    assert.fieldEquals("Collection", collection2Id, "totalRentals", "1")
  })
})

