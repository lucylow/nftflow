#!/bin/bash
set -e

NETWORK=$1
CONTRACT=$2
ADDRESS=$3

echo "🔍 Verifying $CONTRACT on $NETWORK at $ADDRESS"

# Load deployment artifacts
DEPLOYMENT_ARTIFACTS="deployments/$NETWORK"
CONSTRUCTOR_ARGS_FILE="$DEPLOYMENT_ARTIFACTS/${CONTRACT}.constructor-args"
LIBRARIES_FILE="$DEPLOYMENT_ARTIFACTS/${CONTRACT}.libraries"

# Check if contract address file exists
if [ ! -f "$DEPLOYMENT_ARTIFACTS/${CONTRACT}.address" ]; then
    echo "❌ Contract address file not found: $DEPLOYMENT_ARTIFACTS/${CONTRACT}.address"
    exit 1
fi

# Read contract address
CONTRACT_ADDRESS=$(cat "$DEPLOYMENT_ARTIFACTS/${CONTRACT}.address")
echo "📍 Contract address: $CONTRACT_ADDRESS"

# Build verification command
VERIFY_CMD="npx hardhat verify --network $NETWORK $CONTRACT_ADDRESS"

# Add constructor args if available
if [ -f "$CONSTRUCTOR_ARGS_FILE" ]; then
    CONSTRUCTOR_ARGS=$(cat "$CONSTRUCTOR_ARGS_FILE")
    echo "📋 Constructor args found: $CONSTRUCTOR_ARGS"
    VERIFY_CMD="$VERIFY_CMD --constructor-args $CONSTRUCTOR_ARGS"
else
    echo "ℹ️  No constructor args file found"
fi

# Add libraries if available
if [ -f "$LIBRARIES_FILE" ]; then
    LIBRARIES=$(cat "$LIBRARIES_FILE")
    echo "📚 Libraries found: $LIBRARIES"
    VERIFY_CMD="$VERIFY_CMD --libraries $LIBRARIES"
else
    echo "ℹ️  No libraries file found"
fi

# Execute verification
echo "🚀 Running: $VERIFY_CMD"
eval $VERIFY_CMD

# Record verification status
VERIFICATION_STATUS_FILE="$DEPLOYMENT_ARTIFACTS/${CONTRACT}.verification-status"
echo "{\"verified\": true, \"timestamp\": \"$(date -Iseconds)\", \"network\": \"$NETWORK\", \"address\": \"$CONTRACT_ADDRESS\"}" > "$VERIFICATION_STATUS_FILE"

echo "✅ Verification completed successfully!"
echo "📄 Status saved to: $VERIFICATION_STATUS_FILE"

# Verify the contract is actually verified by checking explorer
echo "🔍 Confirming verification on explorer..."
sleep 5

# Get explorer URL from network config
case $NETWORK in
    "somnia"|"testnet")
        EXPLORER_URL="https://shannon-explorer.somnia.network"
        ;;
    "mainnet")
        EXPLORER_URL="https://explorer.somnia.network"
        ;;
    *)
        echo "⚠️  Unknown network: $NETWORK, skipping explorer confirmation"
        exit 0
        ;;
esac

CONTRACT_URL="$EXPLORER_URL/address/$CONTRACT_ADDRESS"
echo "🔗 Contract URL: $CONTRACT_URL"

# Try to check if contract is verified (this is a simple check)
if curl -s "$CONTRACT_URL" | grep -q "Contract Source Code"; then
    echo "✅ Contract is verified on explorer!"
else
    echo "⚠️  Contract verification status unclear on explorer"
    echo "   Please check manually: $CONTRACT_URL"
fi
