const DappToken = artifacts.require("DappToken");

// Set the total number of tokens
module.exports = function (deployer) {
  deployer.deploy(DappToken, 1000000);
};
