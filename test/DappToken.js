var DappToken = artifacts.require("./DappToken");

contract('DappToken', function(accounts){

  var tokenInstance;

  it('Initialize the contract with the correct values', function(){
    return DappToken.deployed().then(function(instance)
    {
      tokenInstance = instance;
      return tokenInstance.getTokenName();
    }).then(function(name)
    {
      assert.equal(name, 'Dapp Token', 'Has the correct name');
      return tokenInstance.getTokenSymbol();
    }).then(function(symbol)
    {
      assert.equal(symbol, 'DAPP', 'Has the correct symbol');
      return tokenInstance.getTokenStandard();
    }).then(function(standard)
    {
      assert.equal(standard, 'DApp Token v1.0', 'Has the correct standard');
    });
  })


  it('Sets the total supply upon deployment', function(){
    return DappToken.deployed().then(function(instance)
    {
      tokenInstance = instance;
      return tokenInstance.getTotalSupply();
    }).then(function(totalSupply)
    {
      assert.equal(totalSupply.toNumber(), 1000000, 'Sets the total supply to 1,000,000')
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function(adminBalance)
    {
      assert.equal(adminBalance.toNumber(), 1000000, 'Its allocates the initial balance to the admin account')
    });
  });


  it('Transfers token ownership', function(){
    return DappToken.deployed().then(function(instance)
    {
      tokenInstance = instance;
      // Test require statement first by Transfering something larger than the sender's balance.
      // A call to the function will not create a transaction.
      return tokenInstance.transferFunds.call(accounts[1], 99999999999);
    }).then(assert.fail).catch(function(error)
    {
      assert(error.message.indexOf('revert') >= 0, 'Error message must contain revert');
      return tokenInstance.transferFunds.call(accounts[1], 250000, {from: accounts[0]})
    }).then(function(success)
    {
      assert.equal(success, true, 'It returns true')
      return tokenInstance.transferFunds(accounts[1], 250000, {from: accounts[0]});
    }).then(function(receipt)
    {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
      assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
      assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
      return tokenInstance.balanceOf(accounts[1]);
    }).then(function(balance)
    {
      assert.equal(balance.toNumber(), 250000, 'Adds the amount to the receiver account');
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function(balance)
    {
      assert.equal(balance.toNumber(), 750000, 'Deducts the amount of the sending account')
    });
  });


  it('Approves tokens for delegated transfer', function(){
    return DappToken.deployed().then(function(instance)
    {
      tokenInstance = instance;
      return tokenInstance.approveTransfer.call(accounts[1], 100);
    }).then(function(success)
    {
      assert.equal(success, true, 'It returns true');
      return tokenInstance.approveTransfer(accounts[1], 100);
    }).then(function(receipt)
    {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
      assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
      assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
      assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
      return tokenInstance.allowance(accounts[0], accounts[1]);
    }).then(function(allowance)
    {
      assert.equal(allowance, 100, 'Stores the allowance for delegated transfer');
    });
  });

  it('Handles delegated token transfers', function(){
    return DappToken.deployed().then(function(instance)
    {
      tokenInstance = instance;
      fromAccount = accounts[2];
      toAccount = accounts[3];
      spendingAccount = accounts[4];
      // Transfer some tokens to fromAccount
      return tokenInstance.transferFunds(fromAccount, 100, {from: accounts[0]});
    }).then(function(receipt)
    {
      // Approve spendingAccount to spend 10 tokens from fromAccount
      return tokenInstance.approveTransfer(spendingAccount, 10, {from: fromAccount});
    }).then(function(receipt)
    {
      // Try transfering something larger than the sender's balance
      return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from: spendingAccount});
    }).then(assert.fail).catch(function(error)
    {
      assert(error.message.indexOf('revert') >= 0, 'Cannot transfer value larger then balance');
      // Try Transfering something larger than the approved amount
      return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount});
    }).then(assert.fail).catch(function(error)
    {
      assert(error.message.indexOf('revert') >= 0, 'Cannot transfer value larger than approved amount');
      return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
    }).then(function(success)
    {
      assert.equal(success, true);
      return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
    }).then(function(receipt)
    {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
      assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transfered from');
      assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transfered to');
      assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
      return tokenInstance.balanceOf(fromAccount);
    }).then(function(balance)
    {
      assert.equal(balance.toNumber(), 90, 'Deducts the amount from the sending account');
      return tokenInstance.balanceOf(toAccount);
    }).then(function(balance)
    {
      assert.equal(balance.toNumber(), 10, 'Adds the amount from the receiving account');
      return tokenInstance.allowance(fromAccount, spendingAccount);
    }).then(function(allowance)
    {
      assert.equal(allowance.toNumber(), 0, 'Deducts the amount from the allowance');
    });
  });
});
