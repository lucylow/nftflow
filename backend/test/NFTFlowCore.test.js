const { expect } = require("chai");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("NFTFlowCore", function () {
  async function listNFTForRent(nftFlowCore, mockERC721, lender, tokenId, pricePerSecond, minDuration, maxDuration, collateralRequired) {
    await mockERC721.connect(lender).approve(await nftFlowCore.getAddress(), tokenId);
    const tx = await nftFlowCore.connect(lender).listNFTForRent(
      await mockERC721.getAddress(),
      tokenId,
      pricePerSecond,
      minDuration,
      maxDuration,
      collateralRequired
    );
    
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => {
      try {
        const parsed = nftFlowCore.interface.parseLog(log);
        return parsed.name === 'NFTListedForRent';
      } catch {
        return false;
      }
    });
    return event.args.listingId;
  }

  async function deployFixture() {
    const [owner, lender, tenant, thirdParty] = await ethers.getSigners();
    
    // Deploy MockERC721
    const MockERC721 = await ethers.getContractFactory("MockERC721");
    const mockERC721 = await MockERC721.deploy("Test NFT Collection", "TNC");
    
    // Deploy PaymentStream
    const PaymentStream = await ethers.getContractFactory("PaymentStream");
    const paymentStream = await PaymentStream.deploy(owner.address);
    
    // Deploy ReputationSystem
    const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
    const reputationSystem = await ReputationSystem.deploy();
    
    // Deploy MockPriceOracle
    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    const mockPriceOracle = await MockPriceOracle.deploy();
    
    // Deploy NFTFlowCore
    const NFTFlowCore = await ethers.getContractFactory("NFTFlowCore");
    const nftFlowCore = await NFTFlowCore.deploy(
      await paymentStream.getAddress(),
      await reputationSystem.getAddress(),
      await mockPriceOracle.getAddress()
    );
    
    // Set the rental contract in ReputationSystem
    await reputationSystem.setRentalContract(await nftFlowCore.getAddress());
    
    // Mint NFTs to lender
    await mockERC721.safeMint(lender.address);
    await mockERC721.safeMint(lender.address);
    
    // Set prices in oracle
    await mockPriceOracle.updatePrice(await mockERC721.getAddress(), 0, ethers.parseEther("0.000001"));
    await mockPriceOracle.updatePrice(await mockERC721.getAddress(), 1, ethers.parseEther("0.000002"));
    
    return { 
      mockERC721, 
      paymentStream, 
      reputationSystem, 
      mockPriceOracle, 
      nftFlowCore, 
      owner, 
      lender, 
      tenant, 
      thirdParty 
    };
  }

  describe("NFT Listing", function () {
    it("Should allow NFT owner to list NFT for rent", async function () {
      const { mockERC721, nftFlowCore, lender } = await loadFixture(deployFixture);
      
      const tokenId = 0;
      const pricePerSecond = ethers.parseEther("0.000001");
      const minDuration = 3600; // 1 hour
      const maxDuration = 86400; // 1 day
      const collateralRequired = ethers.parseEther("1.0");
      
      // Approve NFTFlow to manage the NFT
      await mockERC721.connect(lender).approve(await nftFlowCore.getAddress(), tokenId);
      
      // List NFT for rent
      await expect(
        nftFlowCore.connect(lender).listNFTForRent(
          await mockERC721.getAddress(),
          tokenId,
          pricePerSecond,
          minDuration,
          maxDuration,
          collateralRequired
        )
      ).to.emit(nftFlowCore, "NFTListedForRent");
    });

    it("Should not allow non-owner to list NFT", async function () {
      const { mockERC721, nftFlowCore, tenant } = await loadFixture(deployFixture);
      
      const tokenId = 0;
      const pricePerSecond = ethers.parseEther("0.000001");
      const minDuration = 3600;
      const maxDuration = 86400;
      const collateralRequired = ethers.parseEther("1.0");
      
      await expect(
        nftFlowCore.connect(tenant).listNFTForRent(
          await mockERC721.getAddress(),
          tokenId,
          pricePerSecond,
          minDuration,
          maxDuration,
          collateralRequired
        )
      ).to.be.revertedWith("Not NFT owner");
    });

    it("Should validate duration constraints", async function () {
      const { mockERC721, nftFlowCore, lender } = await loadFixture(deployFixture);
      
      const tokenId = 0;
      const pricePerSecond = ethers.parseEther("0.000001");
      const collateralRequired = ethers.parseEther("1.0");
      
      await mockERC721.connect(lender).approve(await nftFlowCore.getAddress(), tokenId);
      
      // Test minimum duration too short
      await expect(
        nftFlowCore.connect(lender).listNFTForRent(
          await mockERC721.getAddress(),
          tokenId,
          pricePerSecond,
          30, // Too short
          86400,
          collateralRequired
        )
      ).to.be.revertedWith("Min duration too short");
      
      // Test maximum duration too long
      await expect(
        nftFlowCore.connect(lender).listNFTForRent(
          await mockERC721.getAddress(),
          tokenId,
          pricePerSecond,
          3600,
          2592001, // Too long
          collateralRequired
        )
      ).to.be.revertedWith("Max duration too long");
    });
  });

  describe("NFT Rental", function () {
    it("Should allow user to rent NFT", async function () {
      const { mockERC721, nftFlowCore, lender, tenant } = await loadFixture(deployFixture);
      
      const tokenId = 0;
      const pricePerSecond = ethers.parseEther("0.000001");
      const minDuration = 3600;
      const maxDuration = 86400;
      const collateralRequired = ethers.parseEther("1.0");
      const rentalDuration = 3600; // 1 hour
      const totalPrice = pricePerSecond * BigInt(rentalDuration);
      
      // Setup: List NFT for rent
      const listingId = await listNFTForRent(
        nftFlowCore, mockERC721, lender, tokenId, 
        pricePerSecond, minDuration, maxDuration, collateralRequired
      );
      
      // Rent NFT
      await expect(
        nftFlowCore.connect(tenant).rentNFT(
          listingId,
          rentalDuration,
          { value: totalPrice + collateralRequired }
        )
      ).to.emit(nftFlowCore, "NFTRented");
    });

    it("Should require sufficient payment", async function () {
      const { mockERC721, nftFlowCore, lender, tenant } = await loadFixture(deployFixture);
      
      const tokenId = 0;
      const pricePerSecond = ethers.parseEther("0.000001");
      const minDuration = 3600;
      const maxDuration = 86400;
      const collateralRequired = ethers.parseEther("1.0");
      const rentalDuration = 3600;
      const totalPrice = pricePerSecond * BigInt(rentalDuration);
      
      // Setup: List NFT for rent
      const listingId = await listNFTForRent(
        nftFlowCore, mockERC721, lender, tokenId, 
        pricePerSecond, minDuration, maxDuration, collateralRequired
      );
      
      // Try to rent with insufficient payment
      await expect(
        nftFlowCore.connect(tenant).rentNFT(
          listingId,
          rentalDuration,
          { value: totalPrice / 2n } // Insufficient payment
        )
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should not allow owner to rent own NFT", async function () {
      const { mockERC721, nftFlowCore, lender } = await loadFixture(deployFixture);
      
      const tokenId = 0;
      const pricePerSecond = ethers.parseEther("0.000001");
      const minDuration = 3600;
      const maxDuration = 86400;
      const collateralRequired = ethers.parseEther("1.0");
      const rentalDuration = 3600;
      const totalPrice = pricePerSecond * BigInt(rentalDuration);
      
      // Setup: List NFT for rent
      const listingId = await listNFTForRent(
        nftFlowCore, mockERC721, lender, tokenId, 
        pricePerSecond, minDuration, maxDuration, collateralRequired
      );
      
      // Try to rent own NFT
      await expect(
        nftFlowCore.connect(lender).rentNFT(
          listingId,
          rentalDuration,
          { value: totalPrice + collateralRequired }
        )
      ).to.be.revertedWith("Cannot rent own NFT");
    });
  });

  describe("Rental Completion", function () {
    it("Should allow completion after rental period ends", async function () {
      const { mockERC721, nftFlowCore, lender, tenant } = await loadFixture(deployFixture);
      
      const tokenId = 0;
      const pricePerSecond = ethers.parseEther("0.000001");
      const minDuration = 3600;
      const maxDuration = 86400;
      const collateralRequired = ethers.parseEther("1.0");
      const rentalDuration = 3600; // 1 hour
      const totalPrice = pricePerSecond * BigInt(rentalDuration);
      
      // Setup: List and rent NFT
      const listingId = await listNFTForRent(
        nftFlowCore, mockERC721, lender, tokenId, 
        pricePerSecond, minDuration, maxDuration, collateralRequired
      );
      
      const rentTx = await nftFlowCore.connect(tenant).rentNFT(
        listingId,
        rentalDuration,
        { value: totalPrice + collateralRequired }
      );
      
      // Get rental ID from event
      const rentReceipt = await rentTx.wait();
      const rentEvent = rentReceipt.logs.find(log => {
        try {
          const parsed = nftFlowCore.interface.parseLog(log);
          return parsed.name === 'NFTRented';
        } catch {
          return false;
        }
      });
      const rentalId = rentEvent.args.rentalId;
      
      // Fast forward time to end of rental period
      await time.increase(rentalDuration + 1);
      
      // Complete rental
      await expect(
        nftFlowCore.connect(tenant).completeRental(rentalId)
      ).to.emit(nftFlowCore, "RentalCompleted");
    });

    it("Should not allow completion before rental period ends", async function () {
      const { mockERC721, nftFlowCore, lender, tenant } = await loadFixture(deployFixture);
      
      const tokenId = 0;
      const pricePerSecond = ethers.parseEther("0.000001");
      const minDuration = 3600;
      const maxDuration = 86400;
      const collateralRequired = ethers.parseEther("1.0");
      const rentalDuration = 3600;
      const totalPrice = pricePerSecond * BigInt(rentalDuration);
      
      // Setup: List and rent NFT
      const listingId = await listNFTForRent(
        nftFlowCore, mockERC721, lender, tokenId, 
        pricePerSecond, minDuration, maxDuration, collateralRequired
      );
      
      const rentTx = await nftFlowCore.connect(tenant).rentNFT(
        listingId,
        rentalDuration,
        { value: totalPrice + collateralRequired }
      );
      
      // Get rental ID from event
      const rentReceipt = await rentTx.wait();
      const rentEvent = rentReceipt.logs.find(log => {
        try {
          const parsed = nftFlowCore.interface.parseLog(log);
          return parsed.name === 'NFTRented';
        } catch {
          return false;
        }
      });
      const rentalId = rentEvent.args.rentalId;
      
      // Try to complete before rental period ends
      await expect(
        nftFlowCore.connect(tenant).completeRental(rentalId)
      ).to.be.revertedWith("Rental period not ended");
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to update price oracle", async function () {
      const { nftFlowCore, tenant } = await loadFixture(deployFixture);
      
      await expect(
        nftFlowCore.connect(tenant).updatePriceOracle(tenant.address)
      ).to.be.reverted;
    });

    it("Should allow owner to update price oracle", async function () {
      const { nftFlowCore, owner, tenant } = await loadFixture(deployFixture);
      
      await expect(
        nftFlowCore.connect(owner).updatePriceOracle(tenant.address)
      ).to.not.be.reverted;
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to withdraw funds", async function () {
      const { nftFlowCore, owner } = await loadFixture(deployFixture);
      
      // Send some ETH to the contract
      await owner.sendTransaction({
        to: await nftFlowCore.getAddress(),
        value: ethers.parseEther("1.0")
      });
      
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      
      await nftFlowCore.connect(owner).emergencyWithdraw();
      
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Should not allow non-owner to withdraw funds", async function () {
      const { nftFlowCore, tenant } = await loadFixture(deployFixture);
      
      await expect(
        nftFlowCore.connect(tenant).emergencyWithdraw()
      ).to.be.reverted;
    });
  });
});
