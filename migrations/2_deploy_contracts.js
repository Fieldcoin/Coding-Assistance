var FieldToken = artifacts.require("./FieldToken.sol");

module.exports = function(deployer) {
  deployer.deploy(FieldToken);
};
