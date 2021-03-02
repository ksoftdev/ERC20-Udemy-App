pragma solidity 0.5.16;

import "./DappToken.sol";


contract DappTokenSale {

    address payable private adminAccount;
    DappToken private tokenContract;
    uint256 private tokenPrice;
    uint256 private tokensSold;

    event Sell(
        address _buyer,
        uint256 _amount
    );

    constructor (DappToken _tokenContract, uint256 _tokenPrice) public {
        // Assign an admin
        adminAccount = msg.sender;

        // Token contract
        tokenContract = _tokenContract;

        // Token price
        tokenPrice = _tokenPrice;

        tokensSold = 0;
    }

    // Returns the token contract
    function getTokenContract() public view returns (DappToken) {
        return tokenContract;
    }

    // Returns the address of admin accounts
    function getAdminAccount() public view returns (address) {
        return adminAccount;
    }

    // Returns the token price
    function getTokenPrice() public view returns (uint) {
        return tokenPrice;
    }

    // Returns the number of tokens sold
    function getTokensSold() public view returns (uint256) {
        return tokensSold;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));

        // Require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

        // Require that a transfer is successful
        require(tokenContract.transferFunds(msg.sender, _numberOfTokens));

        // Keep track of tokens sold
        tokensSold += _numberOfTokens;

        // Trigger sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        // Require admin
        require(msg.sender == adminAccount);

        // Transfer remaining dapp tokens to admin
        require(tokenContract.transferFunds(adminAccount, tokenContract.balanceOf(address(this))));

        // Destroy contract
        selfdestruct(adminAccount);
    }

    // Calculations using DS-Math https://github.com/dapphub/ds-math
    function multiply(uint x, uint y) internal pure returns(uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }
}
