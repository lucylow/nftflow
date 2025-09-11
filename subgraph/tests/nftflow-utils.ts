// NFTFlow Test Utilities
// Helper functions for creating test events and data

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

// ============ MOCK DATA GENERATORS ============

export function createMockAddress(seed: i32): Address {
  let addressString = "0x"
  for (let i = 0; i < 40; i++) {
    addressString = addressString + ((seed + i) % 16).toString(16)
  }
  return Address.fromString(addressString)
}

export function createMockBytes(seed: i32, length: i32): Bytes {
  let hexString = "0x"
  for (let i = 0; i < length; i++) {
    hexString = hexString + ((seed + i) % 16).toString(16)
  }
  return Bytes.fromHexString(hexString)
}

export function createMockBigInt(seed: i32): BigInt {
  return BigInt.fromI32(seed * 1000000000000000000) // Convert to wei-like value
}

export function createMockBlock(timestamp: i32): ethereum.Block {
  return new ethereum.Block(
    Bytes.fromHexString("0x1234567890abcdef"),
    Bytes.fromHexString("0xabcdef1234567890"),
    Address.fromString("0x0000000000000000000000000000000000000000"),
    BigInt.fromI32(1000),
    BigInt.fromI32(0),
    BigInt.fromI32(timestamp),
    BigInt.fromI32(100000),
    BigInt.fromI32(20000000000), // 20 gwei
    Bytes.fromHexString("0x"),
    BigInt.fromI32(1)
  )
}

export function createMockTransaction(hash: string): ethereum.Transaction {
  return new ethereum.Transaction(
    Bytes.fromHexString(hash),
    BigInt.fromI32(0),
    Address.fromString("0x0000000000000000000000000000000000000000"),
    Address.fromString("0x0000000000000000000000000000000000000000"),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(20000000000), // 20 gwei
    Bytes.fromHexString("0x"),
    BigInt.fromI32(0)
  )
}

// ============ EVENT CREATORS ============

export function createNFTListedForRentEvent(
  listingId: Bytes,
  nftContract: Address,
  tokenId: BigInt,
  owner: Address,
  pricePerSecond: BigInt,
  minDuration: BigInt,
  maxDuration: BigInt,
  collateralRequired: BigInt,
  verified: boolean
): NFTListedForRent {
  let mockBlock = createMockBlock(1640995200)
  let mockTx = createMockTransaction("0xabcdef1234567890")

  let event = new NFTListedForRent(
    Address.fromString("0x0000000000000000000000000000000000000000"),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    mockBlock,
    mockTx,
    []
  )

  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(
    new ethereum.EventParam("listingId", ethereum.Value.fromBytes(listingId))
  )
  event.parameters.push(
    new ethereum.EventParam("nftContract", ethereum.Value.fromAddress(nftContract))
  )
  event.parameters.push(
    new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId))
  )
  event.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  event.parameters.push(
    new ethereum.EventParam("pricePerSecondSOMI", ethereum.Value.fromUnsignedBigInt(pricePerSecond))
  )
  event.parameters.push(
    new ethereum.EventParam("minDuration", ethereum.Value.fromUnsignedBigInt(minDuration))
  )
  event.parameters.push(
    new ethereum.EventParam("maxDuration", ethereum.Value.fromUnsignedBigInt(maxDuration))
  )
  event.parameters.push(
    new ethereum.EventParam("collateralRequired", ethereum.Value.fromUnsignedBigInt(collateralRequired))
  )
  event.parameters.push(
    new ethereum.EventParam("verified", ethereum.Value.fromBoolean(verified))
  )

  return event
}

export function createNFTRentedEvent(
  rentalId: Bytes,
  nftContract: Address,
  tokenId: BigInt,
  tenant: Address,
  duration: BigInt,
  totalPrice: BigInt,
  collateralAmount: BigInt,
  gasUsed: BigInt
): NFTRented {
  let mockBlock = createMockBlock(1640995200)
  let mockTx = createMockTransaction("0x1234567890abcdef")

  let event = new NFTRented(
    Address.fromString("0x0000000000000000000000000000000000000000"),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    mockBlock,
    mockTx,
    []
  )

  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(
    new ethereum.EventParam("rentalId", ethereum.Value.fromBytes(rentalId))
  )
  event.parameters.push(
    new ethereum.EventParam("nftContract", ethereum.Value.fromAddress(nftContract))
  )
  event.parameters.push(
    new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId))
  )
  event.parameters.push(
    new ethereum.EventParam("tenant", ethereum.Value.fromAddress(tenant))
  )
  event.parameters.push(
    new ethereum.EventParam("duration", ethereum.Value.fromUnsignedBigInt(duration))
  )
  event.parameters.push(
    new ethereum.EventParam("totalPriceSOMI", ethereum.Value.fromUnsignedBigInt(totalPrice))
  )
  event.parameters.push(
    new ethereum.EventParam("collateralAmountSOMI", ethereum.Value.fromUnsignedBigInt(collateralAmount))
  )
  event.parameters.push(
    new ethereum.EventParam("gasUsed", ethereum.Value.fromUnsignedBigInt(gasUsed))
  )

  return event
}

export function createRentalCompletedEvent(
  rentalId: Bytes,
  completionTime: BigInt,
  totalPaid: BigInt,
  successful: boolean,
  gasUsed: BigInt
): RentalCompleted {
  let mockBlock = createMockBlock(1640995200)
  let mockTx = createMockTransaction("0x9876543210fedcba")

  let event = new RentalCompleted(
    Address.fromString("0x0000000000000000000000000000000000000000"),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    mockBlock,
    mockTx,
    []
  )

  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(
    new ethereum.EventParam("rentalId", ethereum.Value.fromBytes(rentalId))
  )
  event.parameters.push(
    new ethereum.EventParam("completionTime", ethereum.Value.fromUnsignedBigInt(completionTime))
  )
  event.parameters.push(
    new ethereum.EventParam("totalPaidSOMI", ethereum.Value.fromUnsignedBigInt(totalPaid))
  )
  event.parameters.push(
    new ethereum.EventParam("successful", ethereum.Value.fromBoolean(successful))
  )
  event.parameters.push(
    new ethereum.EventParam("gasUsed", ethereum.Value.fromUnsignedBigInt(gasUsed))
  )

  return event
}

export function createRentalDisputedEvent(
  rentalId: Bytes,
  disputer: Address,
  reason: string,
  disputeTime: BigInt,
  disputeFee: BigInt
): RentalDisputed {
  let mockBlock = createMockBlock(1640995200)
  let mockTx = createMockTransaction("0x5555555555555555")

  let event = new RentalDisputed(
    Address.fromString("0x0000000000000000000000000000000000000000"),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    mockBlock,
    mockTx,
    []
  )

  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(
    new ethereum.EventParam("rentalId", ethereum.Value.fromBytes(rentalId))
  )
  event.parameters.push(
    new ethereum.EventParam("disputer", ethereum.Value.fromAddress(disputer))
  )
  event.parameters.push(
    new ethereum.EventParam("reason", ethereum.Value.fromString(reason))
  )
  event.parameters.push(
    new ethereum.EventParam("disputeTime", ethereum.Value.fromUnsignedBigInt(disputeTime))
  )
  event.parameters.push(
    new ethereum.EventParam("disputeFeeSOMI", ethereum.Value.fromUnsignedBigInt(disputeFee))
  )

  return event
}

export function createDisputeResolvedEvent(
  rentalId: Bytes,
  resolver: Address,
  resolvedInFavorOfTenant: boolean,
  refundAmount: BigInt,
  gasUsed: BigInt
): DisputeResolved {
  let mockBlock = createMockBlock(1640995200)
  let mockTx = createMockTransaction("0x6666666666666666")

  let event = new DisputeResolved(
    Address.fromString("0x0000000000000000000000000000000000000000"),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    mockBlock,
    mockTx,
    []
  )

  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(
    new ethereum.EventParam("rentalId", ethereum.Value.fromBytes(rentalId))
  )
  event.parameters.push(
    new ethereum.EventParam("resolver", ethereum.Value.fromAddress(resolver))
  )
  event.parameters.push(
    new ethereum.EventParam("resolvedInFavorOfTenant", ethereum.Value.fromBoolean(resolvedInFavorOfTenant))
  )
  event.parameters.push(
    new ethereum.EventParam("refundAmountSOMI", ethereum.Value.fromUnsignedBigInt(refundAmount))
  )
  event.parameters.push(
    new ethereum.EventParam("gasUsed", ethereum.Value.fromUnsignedBigInt(gasUsed))
  )

  return event
}

export function createSOMIPaymentReceivedEvent(
  from: Address,
  to: Address,
  amount: BigInt,
  purpose: string,
  timestamp: BigInt
): SOMIPaymentReceived {
  let mockBlock = createMockBlock(timestamp.toI32())
  let mockTx = createMockTransaction("0x7777777777777777")

  let event = new SOMIPaymentReceived(
    Address.fromString("0x0000000000000000000000000000000000000000"),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    mockBlock,
    mockTx,
    []
  )

  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  event.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  event.parameters.push(
    new ethereum.EventParam("amountSOMI", ethereum.Value.fromUnsignedBigInt(amount))
  )
  event.parameters.push(
    new ethereum.EventParam("purpose", ethereum.Value.fromString(purpose))
  )
  event.parameters.push(
    new ethereum.EventParam("timestamp", ethereum.Value.fromUnsignedBigInt(timestamp))
  )

  return event
}

export function createMicroPaymentProcessedEvent(
  user: Address,
  amount: BigInt,
  gasUsed: BigInt,
  timestamp: BigInt
): MicroPaymentProcessed {
  let mockBlock = createMockBlock(timestamp.toI32())
  let mockTx = createMockTransaction("0x8888888888888888")

  let event = new MicroPaymentProcessed(
    Address.fromString("0x0000000000000000000000000000000000000000"),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    mockBlock,
    mockTx,
    []
  )

  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  event.parameters.push(
    new ethereum.EventParam("amountSOMI", ethereum.Value.fromUnsignedBigInt(amount))
  )
  event.parameters.push(
    new ethereum.EventParam("gasUsed", ethereum.Value.fromUnsignedBigInt(gasUsed))
  )
  event.parameters.push(
    new ethereum.EventParam("timestamp", ethereum.Value.fromUnsignedBigInt(timestamp))
  )

  return event
}

// ============ TEST DATA GENERATORS ============

export function createTestNFTContract(seed: i32): Address {
  return createMockAddress(seed)
}

export function createTestUser(seed: i32): Address {
  return createMockAddress(seed + 1000)
}

export function createTestTokenId(seed: i32): BigInt {
  return BigInt.fromI32(seed)
}

export function createTestPrice(seed: i32): BigInt {
  return BigInt.fromI32(seed * 1000000000000000) // 0.001 * seed SOMI per second
}

export function createTestDuration(seed: i32): BigInt {
  return BigInt.fromI32(seed * 3600) // seed hours in seconds
}

export function createTestCollateral(seed: i32): BigInt {
  return BigInt.fromI32(seed * 1000000000000000000) // seed SOMI
}

// ============ BATCH EVENT CREATORS ============

export function createMultipleListings(count: i32): NFTListedForRent[] {
  let events: NFTListedForRent[] = []
  
  for (let i = 0; i < count; i++) {
    let nftContract = createTestNFTContract(i)
    let tokenId = createTestTokenId(i)
    let owner = createTestUser(i)
    let pricePerSecond = createTestPrice(i + 1)
    let minDuration = createTestDuration(1)
    let maxDuration = createTestDuration(24)
    let collateralRequired = createTestCollateral(i + 1)
    let listingId = createMockBytes(i, 32)
    
    let event = createNFTListedForRentEvent(
      listingId,
      nftContract,
      tokenId,
      owner,
      pricePerSecond,
      minDuration,
      maxDuration,
      collateralRequired,
      true
    )
    
    events.push(event)
  }
  
  return events
}

export function createMultipleRentals(count: i32, nftContract: Address): NFTRented[] {
  let events: NFTRented[] = []
  
  for (let i = 0; i < count; i++) {
    let tokenId = createTestTokenId(i)
    let tenant = createTestUser(i + 100)
    let duration = createTestDuration(i + 1)
    let totalPrice = createTestPrice(i + 1).times(duration)
    let collateralAmount = createTestCollateral(i + 1)
    let rentalId = createMockBytes(i, 32)
    
    let event = createNFTRentedEvent(
      rentalId,
      nftContract,
      tokenId,
      tenant,
      duration,
      totalPrice,
      collateralAmount,
      BigInt.fromI32(100000 + i * 1000)
    )
    
    events.push(event)
  }
  
  return events
}

// ============ ASSERTION HELPERS ============

export function assertEntityCount(entityType: string, expectedCount: i32): void {
  // This would be implemented by the test framework
  // For now, it's a placeholder
}

export function assertFieldEquals(entityType: string, entityId: string, fieldName: string, expectedValue: string): void {
  // This would be implemented by the test framework
  // For now, it's a placeholder
}

// ============ PERFORMANCE TEST HELPERS ============

export function createLargeDataset(rentalCount: i32, listingCount: i32): void {
  // Create multiple listings
  let listings = createMultipleListings(listingCount)
  
  // Create multiple rentals for each listing
  for (let i = 0; i < listingCount; i++) {
    let nftContract = createTestNFTContract(i)
    let rentals = createMultipleRentals(rentalCount, nftContract)
    
    // Process events (would be done in actual test)
    // for (let j = 0; j < listings.length; j++) {
    //   handleNFTListedForRent(listings[j])
    // }
    // for (let j = 0; j < rentals.length; j++) {
    //   handleNFTRented(rentals[j])
    // }
  }
}

export function measurePerformance(testFunction: () => void): i64 {
  let startTime = Date.now()
  testFunction()
  let endTime = Date.now()
  return endTime - startTime
}

