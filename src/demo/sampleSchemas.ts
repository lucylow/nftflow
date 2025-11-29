import { mockSomnia } from './mockSomnia';

export const RENTAL_STARTED_SCHEMA = `
uint256 rentalId,
address nftContract,
uint256 tokenId,
address owner,
address renter,
uint256 startTs,
uint256 expiresTs,
uint256 pricePerSecond,
bytes32 txHash
`;

export const RENTAL_TICK_SCHEMA = `
uint256 rentalId,
uint256 ts,
uint256 deltaWei,
uint256 balanceWei,
uint256 sequence
`;

export const PRICING_SUGGESTION_SCHEMA = `
uint256 nftId,
address nftContract,
uint256 tokenId,
uint256 suggestedPricePerSecond,
uint256 confidenceRay,
string modelVersion,
uint256 ts,
string note
`;

export const AGENT_ACTION_SCHEMA = `
string agentType,
string action,
uint256 listingId,
uint256 newPrice,
uint256 confidence,
uint256 ts
`;

// Computed schema IDs
export const SCHEMA_IDS = {
  RENTAL_STARTED: mockSomnia.computeSchemaId(RENTAL_STARTED_SCHEMA),
  RENTAL_TICK: mockSomnia.computeSchemaId(RENTAL_TICK_SCHEMA),
  PRICING_SUGGESTION: mockSomnia.computeSchemaId(PRICING_SUGGESTION_SCHEMA),
  AGENT_ACTION: mockSomnia.computeSchemaId(AGENT_ACTION_SCHEMA),
};

// Sample NFT names for realistic demos
const NFT_NAMES = [
  'Cyber Punk #4281',
  'Bored Ape #7823',
  'Azuki #1337',
  'Doodle #5892',
  'Moonbird #2941',
  'Clone X #8127',
];

const WALLET_PREFIXES = ['0xDead', '0xBeef', '0xCafe', '0xFace', '0xBabe', '0xFeed'];

export const generateRentalStarted = (rentalId: number) => ({
  rentalId,
  nftName: NFT_NAMES[rentalId % NFT_NAMES.length],
  nftContract: `0x${(rentalId * 1234567).toString(16).padStart(40, '0')}`,
  tokenId: 1000 + rentalId,
  owner: `${WALLET_PREFIXES[rentalId % WALLET_PREFIXES.length]}${'0'.repeat(36)}${rentalId}`,
  renter: `${WALLET_PREFIXES[(rentalId + 1) % WALLET_PREFIXES.length]}${'0'.repeat(36)}${rentalId + 100}`,
  startTs: Math.floor(Date.now() / 1000),
  expiresTs: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  pricePerSecond: (0.0005 + Math.random() * 0.002).toFixed(6),
  status: 'active',
});

export const generateRentalTick = (rentalId: number, sequence: number, pricePerSecond: string) => ({
  rentalId,
  ts: Math.floor(Date.now() / 1000),
  deltaWei: pricePerSecond,
  balanceWei: (parseFloat(pricePerSecond) * sequence).toFixed(6),
  sequence,
});

export const generatePricingSuggestion = (nftId: number) => {
  const currentPrice = 0.001;
  const suggestedChange = (Math.random() - 0.5) * 0.0005;
  const suggestedPrice = Math.max(0.0001, currentPrice + suggestedChange);
  const confidence = 0.75 + Math.random() * 0.2;
  
  return {
    nftId,
    nftName: NFT_NAMES[nftId % NFT_NAMES.length],
    nftContract: `0x${(nftId * 1234567).toString(16).padStart(40, '0')}`,
    tokenId: 1000 + nftId,
    currentPrice: currentPrice.toFixed(6),
    suggestedPricePerSecond: suggestedPrice.toFixed(6),
    confidence: confidence.toFixed(2),
    modelVersion: 'somnia-ai-v2.1',
    ts: Math.floor(Date.now() / 1000),
    note: suggestedChange > 0 
      ? 'Increase price due to high demand' 
      : 'Lower price to increase utilization',
    trend: suggestedChange > 0 ? 'up' : 'down',
  };
};

export const generateAgentAction = () => {
  const actions = [
    { action: 'price_adjustment', note: 'AI adjusted rental price based on market conditions' },
    { action: 'risk_alert', note: 'Flagged rental for potential risk review' },
    { action: 'market_update', note: 'Updated market insights for collection' },
    { action: 'recommendation', note: 'Generated new listing recommendation' },
  ];
  const agentTypes = ['intelligent_rental', 'discovery', 'trust_assessment', 'pricing'];
  const selected = actions[Math.floor(Math.random() * actions.length)];
  
  return {
    agentType: agentTypes[Math.floor(Math.random() * agentTypes.length)],
    action: selected.action,
    listingId: Math.floor(Math.random() * 1000),
    newPrice: (0.0005 + Math.random() * 0.002).toFixed(6),
    confidence: (0.7 + Math.random() * 0.25).toFixed(2),
    ts: Math.floor(Date.now() / 1000),
    note: selected.note,
  };
};
