const DappToken = artifacts.require('./DappToken.sol');
const DappTokenSale = artifacts.require('./DappTokenSale.sol');

contract('DappTokenSale', function(accounts){
  var tokenInstance;
  var tokenSaleInstance;

  var _admin = accounts[0];
  var _buyer = accounts[4];

  // Price in WEI
  var _tokenPrice = 1000000000000000;
  var _tokensAvailable = 750000;
  var _numberOfTokens;

  var saleBalance = -1;


  it('Initialiazes the contract with the correct values', function(){
    return DappTokenSale.deployed().then(function(instance)
    {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
    }).then(function(address)
    {
        assert.notEqual(address, 0x0, 'Has contract address');
        return tokenSaleInstance.getTokenContract();
    }).then(function(address)
    {
        assert.notEqual(address, 0x0, 'Has token contract address');
        return tokenSaleInstance.getTokenPrice();
    }).then(function(price)
    {
        assert.equal(price, _tokenPrice, 'Token price is correct');
    });
  });


  it('Facilitates token buying', function() {
    return DappToken.deployed().then(function(instance)
    {
      // Grab token instance first
      tokenInstance = instance;
      return DappTokenSale.deployed();
    }).then(function(instance)
    {
      // Then grab token sale instance
      tokenSaleInstance = instance;
      // Provision 75% of all tokens to the token sale
      return tokenInstance.transferFunds(tokenSaleInstance.address, _tokensAvailable, { from: _admin });
    }).then(function(receipt)
    {
      _numberOfTokens = 10;
      _value = _numberOfTokens * _tokenPrice
      return tokenSaleInstance.buyTokens(_numberOfTokens, { from: _buyer, value: _value })
    }).then(function(receipt)
    {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      assert.equal(receipt.logs[0].args._buyer, _buyer, 'logs the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, _numberOfTokens, 'logs the number of tokens purchased');
      return tokenSaleInstance.getTokensSold();
    }).then(function(amount)
    {
      assert.equal(amount.toNumber(), _numberOfTokens, 'increments the number of tokens sold');
      return tokenInstance.balanceOf(_buyer);
    }).then(function(balance)
    {
      assert.equal(balance.toNumber(), _numberOfTokens);
      return tokenInstance.balanceOf(tokenSaleInstance.address);
    }).then(function(balance)
    {
      assert.equal(balance.toNumber(), _tokensAvailable - _numberOfTokens);
      // Try to buy tokens different from the ether value
      return tokenSaleInstance.buyTokens(_numberOfTokens, { from: _buyer, value: 1 });
    }).then(assert.fail).catch(function(error)
    {
      assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
      return tokenSaleInstance.buyTokens(800000, { from: _buyer, value: _numberOfTokens * _tokenPrice });
    }).then(assert.fail).catch(function(error)
    {
      assert(error.message.indexOf('revert') >= 0, 'Cannot purchase more tokens than available');
    });
  });


  it('Ends token sale', function(){
    return DappToken.deployed().then(function(instance)
    {
      tokenInstance = instance;
      return DappTokenSale.deployed();
    }).then(function(instance)
    {
      tokenSaleInstance = instance;
      return tokenSaleInstance.endSale({from: _buyer});
    }).then(assert.fail).catch(function(error)
    {
      assert(error.message.indexOf('revert') >= 0, 'must be admin to end sale');
      // End sale as admin
      return tokenSaleInstance.endSale({from: _admin});
    }).then(function(receipt)
    {
      return tokenInstance.balanceOf(_admin);
    }).then(function(balance)
    {
      assert.equal(balance.toNumber(), 999990, 'returns all unsold dapp tokens to admin');
      // Check that the contract has no balance
     return web3.eth.getBalance(tokenSaleInstance.address);
   }).then(function(balance)
   {
     assert.equal(balance.valueOf(), 0);
   });
  });

});
