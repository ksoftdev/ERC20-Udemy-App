const DappToken = artifacts.require("DappToken");
const DappTokenSale = artifacts.require("DappTokenSale");

module.exports = function (deployer) {
  // Set the total number of tokens
  deployer.deploy(DappToken, 1000000).then(function()
  {
    // Set token sale price
  	var tokenPrice = 1000000000000000;
    return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
  });
};
