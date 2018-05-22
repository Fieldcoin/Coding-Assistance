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
    })
    it('initialize Milestones should pass', async () => {

      var totals = [
        ether(100000000)
      ];

      for(var i=1;i<5;i++) {
        var val = totals[i-1].add(ether(100000000))
        totals.push(val);
      }

      var bonus = [
        20,
        15,
        10,
        5,
        0
      ];

      let tx = await tokenSale.initializeMilestones(bonus, totals);
      let initialized = await tokenSale.initialized();
      assert(initialized == true);
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
    let tokensForSale = 5*15800;
    let bonusTokens = 58000000
    let minContribution = ether(0.1);

    var bonus;

    beforeEach(async () => {
      var totalSupply = 750000000
      ERC20 = await Token.new(totalSupply);
      var now = latestTime();
      openingTime = now + duration.days(1);
      closingTime = openingTime + duration.days(70);
      tokenSale = await TokenSale.new(openingTime, closingTime, rate, tokenCost, wallet, ether(tokensForSale), ether(bonusTokens), ERC20.address, minContribution);
      var totals = [
        ether(15800)
      ];

      for(var i=1;i<5;i++) {
        var val = totals[i-1].add(ether(15800))
        totals.push(val);
      }

      bonus = [
        20,
        15,
        10,
        5,
        0
      ];

      let tx = await tokenSale.initializeMilestones(bonus, totals);
      let initialized = await tokenSale.initialized();
      await ERC20.transfer(tokenSale.address, ether(tokensForSale));
      await ERC20.transfer(tokenSale.address, ether(bonusTokens));
    });

    it('Milestone 1', async () => {
      await increaseTimeTo(openingTime + 1);
      var milestoneIndex = 0;
      var eth_usd = 790;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 1;
      var expectedTokens = eth * (eth_usd/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100
      await tokenSale.sendTransaction({ value: ether(eth), from: accounts[1] });
      let tokensSold = await tokenSale.tokensSold();
      expectedTokens = expectedTokens + bT;
      let balance = await ERC20.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(ether(expectedTokens));
      var expectedIndex = await tokenSale.getCurrentMilestoneIndex();
      assert(expectedIndex.toString() == '1');
    });


    it('Milestone 2', async () => {

      await increaseTimeTo(openingTime + 1);
      var milestoneIndex = 1;
      var eth_usd = 790;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 1;
      for(var i=0;i<milestoneIndex;i++) {
        await tokenSale.sendTransaction({ value: ether(eth), from: accounts[0] });
      }

      var eth = 1;
      var expectedTokens = eth * (eth_usd/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100
      expectedTokens = expectedTokens + bT;
      await tokenSale.sendTransaction({ value: ether(eth), from: accounts[1] });

      let balance = await ERC20.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(ether(expectedTokens));
      var expectedIndex = await tokenSale.getCurrentMilestoneIndex();
      assert(expectedIndex.toString() == (milestoneIndex+1).toString());
    });

    it('Milestone 3', async () => {

      await increaseTimeTo(openingTime + 1);
      var milestoneIndex = 2;
      var eth_usd = 790;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 1;
      for(var i=0;i<milestoneIndex;i++) {
        await tokenSale.sendTransaction({ value: ether(eth), from: accounts[0] });
      }

      var eth = 1;
      var expectedTokens = eth * (eth_usd/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100
      expectedTokens = expectedTokens + bT;
      await tokenSale.sendTransaction({ value: ether(eth), from: accounts[1] });

      let balance = await ERC20.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(ether(expectedTokens));
      var expectedIndex = await tokenSale.getCurrentMilestoneIndex();
      assert(expectedIndex.toString() == (milestoneIndex+1).toString());
    });

    it('Milestone 4', async () => {

      await increaseTimeTo(openingTime + 1);
      var milestoneIndex = 3;
      var eth_usd = 790;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 1;
      for(var i=0;i<milestoneIndex;i++) {
        await tokenSale.sendTransaction({ value: ether(eth), from: accounts[0] });
      }

      var eth = 1;
      var expectedTokens = eth * (eth_usd/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100
      expectedTokens = expectedTokens + bT;
      await tokenSale.sendTransaction({ value: ether(eth), from: accounts[1] });

      let balance = await ERC20.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(ether(expectedTokens));
      var expectedIndex = await tokenSale.getCurrentMilestoneIndex();
      assert(expectedIndex.toString() == (milestoneIndex+1).toString());
    });

    it('Milestone 5', async () => {

      await increaseTimeTo(openingTime + 1);
      var milestoneIndex = 4;
      var eth_usd = 790;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 1;
      for(var i=0;i<milestoneIndex;i++) {
        await tokenSale.sendTransaction({ value: ether(eth), from: accounts[0] });
      }
      var tokenSold = await tokenSale.tokensSold();
      var tokensRemaining = await tokenSale.tokensRemaining();
      var eth = 1;
      var expectedTokens = eth * (eth_usd/0.05);
      var bT = expectedTokens * bonus[milestoneIndex]/100
      expectedTokens = expectedTokens + bT;
      await tokenSale.sendTransaction({ value: ether(eth), from: accounts[1] });
      //
      let balance = await ERC20.balanceOf(accounts[1]);
      balance.should.be.bignumber.equal(ether(expectedTokens));
      var tokenSold = await tokenSale.tokensSold();
      tokenSold.should.be.bignumber.equal(ether(tokensForSale))
    });

    it('finalize should burn the tokens', async () => {

      await increaseTimeTo(openingTime + 1);
      var milestoneIndex = 5;
      var eth_usd = 790;
      await tokenSale.setETH_USDRate(eth_usd * 100);
      var eth = 1;
      for(var i=0;i<milestoneIndex;i++) {
        await tokenSale.sendTransaction({ value: ether(eth), from: accounts[3] });
      }
      var balance = await ERC20.balanceOf(tokenSale.address);
      var totalSupply = await ERC20.totalSupply();
      await tokenSale.finalize();
      var newBalance = await ERC20.balanceOf(tokenSale.address);
      assert(newBalance.toString() == '0');
      var newTokenSupply = await ERC20.totalSupply();
      var expectedTokenSupply = totalSupply.sub(balance);
      newTokenSupply.should.be.bignumber.equal(expectedTokenSupply);
    });

  });
  //
  // describe('TokenSale Finalizable',  () => {
  //   let ERC20;
  //   let tokenSale;
  //   let openingTime;
  //   let closingTime;
  //   let rate = 1;
  //   let tokenCost = 5;
  //   let wallet = accounts[2];
  //   let tokensForSale = 600000000
  //   let bonusTokens = 58000000
  //   let minContribution = ether(0.1);
  //
  //   var times;
  //   var bonus;
  //   var totalSupply;
  //
  //   beforeEach(async () => {
  //     totalSupply = 750000000
  //     ERC20 = await Token.new(totalSupply);
  //     var now = latestTime();
  //     openingTime = now + duration.days(1);
  //     closingTime = openingTime + duration.days(70);
  //     tokenSale = await TokenSale.new(openingTime, closingTime, rate, tokenCost, wallet, ether(tokensForSale), ether(bonusTokens), ERC20.address, minContribution);
  //     times = [
  //       openingTime + duration.days(10),
  //       openingTime + duration.days(10 + 15),
  //       openingTime + duration.days(10 + 15 + 10),
  //       openingTime + duration.days(10 + 15 + 10 + 10),
  //       openingTime + duration.days(10 + 15 + 10 + 10 + 10),
  //       closingTime + 1
  //     ]
  //
  //     bonus = [
  //       30,
  //       26,
  //       15,
  //       10,
  //       5,
  //       0
  //     ];
  //
  //     await tokenSale.initializeMilestones(times, bonus)
  //     await ERC20.transfer(tokenSale.address, ether(tokensForSale));
  //     await ERC20.transfer(tokenSale.address, ether(bonusTokens));
  //   });
  //
  //   it('finalization should burn the unsold tokens', async () => {
  //     await increaseTimeTo(closingTime + 1);
  //     await tokenSale.finalize()
  //     let currentTotalSupply = await ERC20.totalSupply();
  //     currentTotalSupply.should.be.bignumber.equal(ether(totalSupply - tokensForSale - bonusTokens));
  //   })
  //
  //   it('finalization should burn the unsold tokens', async () => {
  //     var milestoneIndex = 5;
  //     await increaseTimeTo(times[milestoneIndex] - 10);
  //     assert((await tokenSale.getCurrentMilestoneIndex()) == milestoneIndex);
  //     var eth_usd = 600;
  //     var expectedTokens = (600/0.05);
  //     var bT = expectedTokens * bonus[milestoneIndex]/100;
  //     expectedTokens = expectedTokens + bT;
  //     await tokenSale.sendTransaction({ value: ether(1), from: accounts[1] });
  //     await increaseTimeTo(closingTime + 1);
  //     await tokenSale.finalize()
  //     let currentTotalSupply = await ERC20.totalSupply();
  //     currentTotalSupply.should.be.bignumber.equal(
  //       ether(totalSupply + expectedTokens - tokensForSale - bonusTokens)
  //     );
  //   })
  //
  // });
  //
  // describe('Token sale close', () => {
  //   let ERC20;
  //   let tokenSale;
  //   let openingTime;
  //   let closingTime;
  //   let rate = 1;
  //   let tokenCost = 5;
  //   let wallet = accounts[2];
  //   let tokensForSale = 12000
  //   let bonusTokens = 58000000
  //   let minContribution = ether(0.1);
  //
  //   var times;
  //   var bonus;
  //
  //   beforeEach(async () => {
  //     var totalSupply = 750000000
  //     ERC20 = await Token.new(totalSupply);
  //     var now = latestTime();
  //     openingTime = now + duration.days(1);
  //     closingTime = openingTime + duration.days(70);
  //     tokenSale = await TokenSale.new(openingTime, closingTime, rate, tokenCost, wallet, ether(tokensForSale), ether(bonusTokens), ERC20.address, minContribution);
  //     times = [
  //       openingTime + duration.days(10),
  //       openingTime + duration.days(10 + 15),
  //       openingTime + duration.days(10 + 15 + 10),
  //       openingTime + duration.days(10 + 15 + 10 + 10),
  //       openingTime + duration.days(10 + 15 + 10 + 10 + 10),
  //       closingTime + 1
  //     ]
  //
  //     bonus = [
  //       30,
  //       26,
  //       15,
  //       10,
  //       5,
  //       0
  //     ];
  //     await tokenSale.initializeMilestones(times, bonus)
  //     await ERC20.transfer(tokenSale.address, ether(tokensForSale));
  //     await ERC20.transfer(tokenSale.address, ether(bonusTokens));
  //   });
  //
  //   it('should not accept any contributions once the crowdsale is over', async () => {
  //     await increaseTimeTo(closingTime + 10);
  //     await tokenSale.sendTransaction({ value: ether(0.2) }).should.be.rejectedWith(EVMRevert);
  //   })
  //
  //   it('should not accept any contributions once the crowdsale is over', async () => {
  //     await increaseTimeTo(openingTime + 10);
  //     await tokenSale.sendTransaction({ value: ether(1) });
  //     let tokensSold = await tokenSale.tokensSold();
  //     let _tokensForSale = await tokenSale.tokensForSale();
  //     let tokensRemaining = await tokenSale.tokensRemaining()
  //     await tokenSale.sendTransaction({ value: ether(1) })
  //     .should.be.rejectedWith(EVMRevert);
  //   })
  // })

});
