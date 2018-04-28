require('babel-register');
require('babel-polyfill');
import ether  from './helpers/ether';
const EVMRevert = require('./helpers/EVMRevert.js')
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import BigNumber  from 'bignumber.js'
var TokenSale = artifacts.require('./TokenSale');
var Token = artifacts.require('./FieldToken');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

contract('Tokensale', async function(accounts) {
  describe('Token sale initialization' , () => {
    let ERC20;
    let tokenSale;
    let openingTime;
    let closingTime;
    let rate = 1;
    let tokenCost = 5;
    let wallet = accounts[2];
    let tokensForSale = ether(600000000)
    let bonusTokens = ether(58000000)
    let minContribution = ether(0.1);

    beforeEach(async () => {
      var totalSupply = 750000000
      ERC20 = await Token.new(totalSupply);
      var now = latestTime();
      openingTime = now + duration.days(1);
      closingTime = openingTime + duration.days(70);
      tokenSale = await TokenSale.new(openingTime, closingTime, rate, tokenCost, wallet, tokensForSale, bonusTokens, ERC20.address, minContribution);
      var initialized = await tokenSale.initialized();
      //console.log(initialized);
    })
    it('initialize Milestones should pass', async () => {
      var times = [
        openingTime + duration.days(10),
        openingTime + duration.days(10 + 15),
        openingTime + duration.days(10 + 15 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10 + 10),
        closingTime + 1
      ];
      var bonus = [
        30,
        26,
        15,
        10,
        5,
        0
      ];

      let tx = await tokenSale.initializeMilestones(times, bonus);
      let initialized = await tokenSale.initialized();
      assert(initialized == true);
    });

    it('initialize Milestones cannot be called more than once', async () => {
      var times = [
        openingTime + duration.days(10),
        openingTime + duration.days(10 + 15),
        openingTime + duration.days(10 + 15 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10 + 10),
        closingTime + 1
      ];
      var bonus = [
        30,
        26,
        15,
        10,
        5,
        0
      ];

      await tokenSale.initializeMilestones(times, bonus);
      await tokenSale.initializeMilestones(times, bonus)
      .should.be.rejectedWith(EVMRevert);
    });

    it('initialize Milestones cannot be after the opening time', async () => {
      var times = [
        openingTime + duration.days(10),
        openingTime + duration.days(10 + 15),
        openingTime + duration.days(10 + 15 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10 + 10),
        closingTime + 1
      ];
      var bonus = [
        30,
        26,
        15,
        10,
        5,
        0
      ];

      await increaseTimeTo(openingTime);
      await tokenSale.initializeMilestones(times, bonus)
      .should.be.rejectedWith(EVMRevert);
    });

    it('initialize Milestones initial the milestones count properly', async () => {
      var times = [
        openingTime + duration.days(10),
        openingTime + duration.days(10 + 15),
        openingTime + duration.days(10 + 15 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10 + 10),
        closingTime + 1
      ];
      var bonus = [
        30,
        26,
        15,
        10,
        5,
        0
      ];
      await tokenSale.initializeMilestones(times, bonus)
      let milestonesCount = await tokenSale.milestoneCount();
      assert(milestonesCount.toString() == bonus.length.toString());
    });
  });

  describe('TokenSale Buy Tokens',  () => {
    let ERC20;
    let tokenSale;
    let openingTime;
    let closingTime;
    let rate = 1;
    let tokenCost = 5;
    let wallet = accounts[2];
    let tokensForSale = 600000000
    let bonusTokens = 58000000
    let minContribution = ether(0.1);

    var times;
    var bonus;

    beforeEach(async () => {
      var totalSupply = 750000000
      ERC20 = await Token.new(totalSupply);
      var now = latestTime();
      openingTime = now + duration.days(1);
      closingTime = openingTime + duration.days(70);
      tokenSale = await TokenSale.new(openingTime, closingTime, rate, tokenCost, wallet, ether(tokensForSale), ether(bonusTokens), ERC20.address, minContribution);
      times = [
        openingTime + duration.days(10),
        openingTime + duration.days(10 + 15),
        openingTime + duration.days(10 + 15 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10 + 10),
        closingTime + 1
      ]

      bonus = [
        30,
        26,
        15,
        10,
        5,
        0
      ];
      await tokenSale.initializeMilestones(times, bonus)
      await ERC20.transfer(tokenSale.address, ether(tokensForSale));
      await ERC20.transfer(tokenSale.address, ether(bonusTokens));
    });

    it('Milestone 1', async () => {
      var milestoneIndex = 0;
      await increaseTimeTo(times[milestoneIndex] - 10);
      assert((await tokenSale.getCurrentMilestoneIndex()) == milestoneIndex);
      var eth_usd = 600;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 1;
      var expectedTokens = eth * (eth_usd/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100;
      expectedTokens = expectedTokens + bT;
      await tokenSale.sendTransaction({ value: ether(eth), from: accounts[1] });
      let balance = await ERC20.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(ether(expectedTokens));
      let expectedRemainingBonus = bonusTokens - bT;
      (await tokenSale.bonusTokens()).should.be.bignumber.equal(ether(expectedRemainingBonus));
    });

    it('Milestone 2', async () => {
      var milestoneIndex = 1;
      await increaseTimeTo(times[milestoneIndex] - 10);
      assert((await tokenSale.getCurrentMilestoneIndex()) == milestoneIndex);
      var eth_usd = 650;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 0.5;
      var expectedTokens = eth * (eth_usd/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100;
      expectedTokens = expectedTokens + bT;
      await tokenSale.sendTransaction({ value: ether(eth), from: accounts[1] });
      let balance = await ERC20.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(ether(expectedTokens));
      let expectedRemainingBonus = bonusTokens - bT;
      (await tokenSale.bonusTokens()).should.be.bignumber.equal(ether(expectedRemainingBonus));
    });

    it('Milestone 3', async () => {

      var milestoneIndex = 2;
      await increaseTimeTo(times[milestoneIndex] - 10);
      assert((await tokenSale.getCurrentMilestoneIndex()) == milestoneIndex);
      var eth_usd = 711;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 0.2;
      var expectedTokens = eth * (eth_usd/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100;
      expectedTokens = expectedTokens + bT;
      await tokenSale.sendTransaction({ value: ether(eth), from: accounts[1] });
      let balance = await ERC20.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(ether(expectedTokens));
      let expectedRemainingBonus = bonusTokens - bT;
      (await tokenSale.bonusTokens()).should.be.bignumber.equal(ether(expectedRemainingBonus));
    });
    //
    it('Milestone 4', async () => {

      var milestoneIndex = 3;
      await increaseTimeTo(times[milestoneIndex] - 10);
      assert((await tokenSale.getCurrentMilestoneIndex()) == milestoneIndex);
      var eth_usd = 810;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 0.2;
      var expectedTokens = eth * (eth_usd/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100;
      expectedTokens = expectedTokens + bT;
      await tokenSale.sendTransaction({ value: ether(eth), from: accounts[1] });
      let balance = await ERC20.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(ether(expectedTokens));
      let expectedRemainingBonus = bonusTokens - bT;
      (await tokenSale.bonusTokens()).should.be.bignumber.equal(ether(expectedRemainingBonus));

    });
    //
    it('Milestone 5', async () => {

      var milestoneIndex = 4;
      await increaseTimeTo(times[milestoneIndex] - 10);
      assert((await tokenSale.getCurrentMilestoneIndex()) == milestoneIndex);
      var eth_usd = 790;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 0.71;
      var expectedTokens = eth * (eth_usd/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100;
      expectedTokens = expectedTokens + bT;
      await tokenSale.sendTransaction({ value: ether(eth), from: accounts[1] });
      let balance = await ERC20.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(ether(expectedTokens));

      let expectedTokensRemaining = tokensForSale - expectedTokens + bT;
      (await tokenSale.tokensRemaining()).should.be.bignumber.equal(ether(expectedTokensRemaining));

      let expectedRemainingBonus = bonusTokens - bT;
      (await tokenSale.bonusTokens()).should.be.bignumber.equal(ether(expectedRemainingBonus));

    });

    it('Milestone 6', async () => {

      var milestoneIndex = 5;
      await increaseTimeTo(times[milestoneIndex] - 10);
      assert((await tokenSale.getCurrentMilestoneIndex()) == milestoneIndex);
      var eth_usd = 790;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 0.71;
      var expectedTokens = eth * (eth_usd/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100;
      expectedTokens = expectedTokens + bT;

      await tokenSale.sendTransaction({ value: ether(eth), from: accounts[1] });
      let balance = await ERC20.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(ether(expectedTokens));

      let expectedTokensRemaining = tokensForSale - expectedTokens + bT;
      (await tokenSale.tokensRemaining()).should.be.bignumber.equal(ether(expectedTokensRemaining));

      let expectedRemainingBonus = bonusTokens - bT;
      (await tokenSale.bonusTokens()).should.be.bignumber.equal(ether(expectedRemainingBonus));

    });

  });

  describe('TokenSale Finalizable',  () => {
    let ERC20;
    let tokenSale;
    let openingTime;
    let closingTime;
    let rate = 1;
    let tokenCost = 5;
    let wallet = accounts[2];
    let tokensForSale = 600000000
    let bonusTokens = 58000000
    let minContribution = ether(0.1);

    var times;
    var bonus;
    var totalSupply;

    beforeEach(async () => {
      totalSupply = 750000000
      ERC20 = await Token.new(totalSupply);
      var now = latestTime();
      openingTime = now + duration.days(1);
      closingTime = openingTime + duration.days(70);
      tokenSale = await TokenSale.new(openingTime, closingTime, rate, tokenCost, wallet, ether(tokensForSale), ether(bonusTokens), ERC20.address, minContribution);
      times = [
        openingTime + duration.days(10),
        openingTime + duration.days(10 + 15),
        openingTime + duration.days(10 + 15 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10),
        openingTime + duration.days(10 + 15 + 10 + 10 + 10),
        closingTime + 1
      ]

      bonus = [
        30,
        26,
        15,
        10,
        5,
        0
      ];

      await tokenSale.initializeMilestones(times, bonus)
      await ERC20.transfer(tokenSale.address, ether(tokensForSale));
      await ERC20.transfer(tokenSale.address, ether(bonusTokens));
    });

    it('finalization should burn the unsold tokens', async () => {
      await increaseTimeTo(closingTime + 1);
      await tokenSale.finalize()
      let currentTotalSupply = await ERC20.totalSupply();
      currentTotalSupply.should.be.bignumber.equal(ether(totalSupply - tokensForSale - bonusTokens));
    })

    it('finalization should burn the unsold tokens', async () => {
      var milestoneIndex = 5;
      await increaseTimeTo(times[milestoneIndex] - 10);
      assert((await tokenSale.getCurrentMilestoneIndex()) == milestoneIndex);
      var eth_usd = 600;
      var expectedTokens = (600/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100;
      expectedTokens = expectedTokens + bT;
      await tokenSale.sendTransaction({ value: ether(1), from: accounts[1] });
      await increaseTimeTo(closingTime + 1);
      await tokenSale.finalize()
      let currentTotalSupply = await ERC20.totalSupply();
      currentTotalSupply.should.be.bignumber.equal(
        ether(totalSupply + expectedTokens - tokensForSale - bonusTokens)
      );
    })

  });

});
