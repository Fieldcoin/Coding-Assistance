

//var ether = require('ethers');
function ether(n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'))
}


module.exports = function(deployer) {
  //deployer.deploy(FieldToken);

};
