var FieldToken = artifacts.require("./FieldToken.sol");

module.exports = function(deployer) {
  deployer.deploy(FieldToken, "FieldCoin", "FLC",18, 1000000000);
};
