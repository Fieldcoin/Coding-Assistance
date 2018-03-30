
var FieldToken = artifacts.require("./FieldToken.sol");
var PreCrowdsale = artifacts.require("./PreCrowdsale.sol");
//var ether = require('ethers');
function ether(n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'))
}

var OpeningTime = 1524343044; // April
var ClosingTime = 1525034244 // April 29 2018
var Rate = '0x' + (20000).toString(16); //0.28;
var Wallet = '0x3ccB4bd1a9923D47b84037548141715beFD3f9A4';
var Cap = '0x' + ether(30).toString(16); //6.4 million USD @ $1000/ETH = 6400 ETH in Wei = 6400000000000000000000



module.exports = function(deployer) {
  //deployer.deploy(FieldToken);
  deployer.deploy(FieldToken).then(function() {
  return deployer.deploy(PreCrowdsale,OpeningTime,ClosingTime,Rate,Wallet,Cap, FieldToken.address);
});


};



