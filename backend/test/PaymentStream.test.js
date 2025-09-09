const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PaymentStream", function () {
  let paymentStream;
  let sender, recipient, otherAccount;

  beforeEach(async function () {
    [sender, recipient, otherAccount] = await ethers.getSigners();

    const PaymentStream = await ethers.getContractFactory("PaymentStream");
    paymentStream = await PaymentStream.deploy(sender.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await paymentStream.owner()).to.equal(sender.address);
    });

    it("Should initialize with zero streams", async function () {
      expect(await paymentStream.nextStreamId()).to.equal(0);
    });
  });

  describe("Stream Creation", function () {
    it("Should create a stream successfully", async function () {
      const deposit = ethers.parseEther("1.0");
      const startTime = (await time.latest()) + 100;
      const stopTime = startTime + 3600; // 1 hour

      await expect(
        paymentStream.connect(sender).createStream(
          recipient.address,
          startTime,
          stopTime,
          "0x0000000000000000000000000000000000000000", // nftContract
          { value: deposit }
        )
      ).to.emit(paymentStream, "StreamCreated")
        .withArgs(0, sender.address, recipient.address, deposit, deposit / BigInt(3600), startTime, stopTime);
    });

    it("Should reject stream to zero address", async function () {
      const deposit = ethers.parseEther("1.0");
      const startTime = (await time.latest()) + 100;
      const stopTime = startTime + 3600;

      await expect(
        paymentStream.connect(sender).createStream(
          "0x0000000000000000000000000000000000000000",
          startTime,
          stopTime,
          "0x0000000000000000000000000000000000000000", // nftContract
          { value: deposit }
        )
      ).to.be.revertedWith("Invalid recipient");
    });

    it("Should reject stream to self", async function () {
      const deposit = ethers.parseEther("1.0");
      const startTime = (await time.latest()) + 100;
      const stopTime = startTime + 3600;

      await expect(
        paymentStream.connect(sender).createStream(
          sender.address,
          startTime,
          stopTime,
          "0x0000000000000000000000000000000000000000", // nftContract
          { value: deposit }
        )
      ).to.be.revertedWith("Cannot stream to self");
    });

    it("Should reject stream with zero deposit", async function () {
      const startTime = (await time.latest()) + 100;
      const stopTime = startTime + 3600;

      await expect(
        paymentStream.connect(sender).createStream(
          recipient.address,
          startTime,
          stopTime,
          "0x0000000000000000000000000000000000000000", // nftContract
          { value: 0 }
        )
      ).to.be.revertedWith("Deposit must be greater than 0");
    });

    it("Should reject stream with past start time", async function () {
      const deposit = ethers.parseEther("1.0");
      const startTime = (await time.latest()) - 100; // Past time
      const stopTime = startTime + 3600;

      await expect(
        paymentStream.connect(sender).createStream(
          recipient.address,
          startTime,
          stopTime,
          "0x0000000000000000000000000000000000000000", // nftContract
          { value: deposit }
        )
      ).to.be.revertedWith("Start time in the past");
    });

    it("Should reject stream with stop time before start time", async function () {
      const deposit = ethers.parseEther("1.0");
      const startTime = (await time.latest()) + 3600;
      const stopTime = startTime - 100; // Before start time

      await expect(
        paymentStream.connect(sender).createStream(
          recipient.address,
          startTime,
          stopTime,
          "0x0000000000000000000000000000000000000000", // nftContract
          { value: deposit }
        )
      ).to.be.revertedWith("Stop time before start time");
    });
  });

  describe("Balance Calculation", function () {
    let streamId;
    const deposit = ethers.parseEther("1.0");

    beforeEach(async function () {
      const startTime = (await time.latest()) + 100;
      const stopTime = startTime + 3600; // 1 hour

      const tx = await paymentStream.connect(sender).createStream(
        recipient.address,
        startTime,
        stopTime,
        "0x0000000000000000000000000000000000000000", // nftContract
        { value: deposit }
      );

      const receipt = await tx.wait();
      streamId = receipt.events[0].args[0];
    });

    it("Should return zero balance before stream starts", async function () {
      expect(await paymentStream.balanceOf(streamId)).to.equal(0);
    });

    it("Should calculate correct balance during stream", async function () {
      // Fast forward to stream start + 1800 seconds (half way)
      const stream = await paymentStream.getStream(streamId);
      await time.increaseTo(stream.startTime.add(1800));

      const balance = await paymentStream.balanceOf(streamId);
      const expectedBalance = deposit.div(2); // Half the deposit after half the time
      
      // Allow for small rounding differences
      expect(balance).to.be.closeTo(expectedBalance, ethers.parseEther("0.01"));
    });

    it("Should return full remaining balance after stream ends", async function () {
      const stream = await paymentStream.getStream(streamId);
      await time.increaseTo(stream.stopTime.add(1));

      const balance = await paymentStream.balanceOf(streamId);
      expect(balance).to.equal(stream.remainingBalance);
    });
  });

  describe("Withdrawals", function () {
    let streamId;
    const deposit = ethers.parseEther("1.0");

    beforeEach(async function () {
      const startTime = (await time.latest()) + 100;
      const stopTime = startTime + 3600;

      const tx = await paymentStream.connect(sender).createStream(
        recipient.address,
        startTime,
        stopTime,
        "0x0000000000000000000000000000000000000000", // nftContract
        { value: deposit }
      );

      const receipt = await tx.wait();
      streamId = receipt.events[0].args[0];

      // Fast forward to middle of stream
      await time.increaseTo(startTime + 1800);
    });

    it("Should allow recipient to withdraw available balance", async function () {
      const availableBalance = await paymentStream.balanceOf(streamId);
      
      await expect(
        paymentStream.connect(recipient).withdrawFromStream(streamId, 0)
      ).to.emit(paymentStream, "StreamWithdrawn")
        .withArgs(streamId, recipient.address, availableBalance);
    });

    it("Should reject withdrawal by non-recipient", async function () {
      await expect(
        paymentStream.connect(otherAccount).withdrawFromStream(streamId, 0)
      ).to.be.revertedWith("Not the recipient");
    });

    it("Should reject withdrawal of more than available", async function () {
      const availableBalance = await paymentStream.balanceOf(streamId);
      const excessiveAmount = availableBalance.add(ethers.parseEther("0.1"));

      await expect(
        paymentStream.connect(recipient).withdrawFromStream(streamId, excessiveAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Stream Cancellation", function () {
    let streamId;
    const deposit = ethers.parseEther("1.0");

    beforeEach(async function () {
      const startTime = (await time.latest()) + 100;
      const stopTime = startTime + 3600;

      const tx = await paymentStream.connect(sender).createStream(
        recipient.address,
        startTime,
        stopTime,
        "0x0000000000000000000000000000000000000000", // nftContract
        { value: deposit }
      );

      const receipt = await tx.wait();
      streamId = receipt.events[0].args[0];

      // Fast forward to middle of stream
      await time.increaseTo(startTime + 1800);
    });

    it("Should allow sender to cancel stream", async function () {
      await expect(
        paymentStream.connect(sender).cancelStream(streamId)
      ).to.emit(paymentStream, "StreamCancelled");

      const stream = await paymentStream.getStream(streamId);
      expect(stream.active).to.be.false;
    });

    it("Should allow recipient to cancel stream", async function () {
      await expect(
        paymentStream.connect(recipient).cancelStream(streamId)
      ).to.emit(paymentStream, "StreamCancelled");

      const stream = await paymentStream.getStream(streamId);
      expect(stream.active).to.be.false;
    });

    it("Should reject cancellation by unauthorized user", async function () {
      await expect(
        paymentStream.connect(otherAccount).cancelStream(streamId)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Stream Information", function () {
    let streamId;

    beforeEach(async function () {
      const deposit = ethers.parseEther("1.0");
      const startTime = (await time.latest()) + 100;
      const stopTime = startTime + 3600;

      const tx = await paymentStream.connect(sender).createStream(
        recipient.address,
        startTime,
        stopTime,
        "0x0000000000000000000000000000000000000000", // nftContract
        { value: deposit }
      );

      const receipt = await tx.wait();
      streamId = receipt.events[0].args[0];
    });

    it("Should return correct stream details", async function () {
      const stream = await paymentStream.getStream(streamId);
      
      expect(stream.sender).to.equal(sender.address);
      expect(stream.recipient).to.equal(recipient.address);
      expect(stream.deposit).to.equal(ethers.parseEther("1.0"));
      expect(stream.active).to.be.true;
    });

    it("Should track sender streams", async function () {
      const senderStreams = await paymentStream.getSenderStreams(sender.address);
      expect(senderStreams).to.include(streamId);
    });

    it("Should track recipient streams", async function () {
      const recipientStreams = await paymentStream.getRecipientStreams(recipient.address);
      expect(recipientStreams).to.include(streamId);
    });

    it("Should correctly identify active streams", async function () {
      // Before stream starts
      expect(await paymentStream.isStreamActive(streamId)).to.be.false;

      // During stream
      const stream = await paymentStream.getStream(streamId);
      await time.increaseTo(stream.startTime.add(1800));
      expect(await paymentStream.isStreamActive(streamId)).to.be.true;

      // After stream ends
      await time.increaseTo(stream.stopTime.add(1));
      expect(await paymentStream.isStreamActive(streamId)).to.be.false;
    });
  });
});

