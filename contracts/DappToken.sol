pragma solidity >=0.4.2;

contract DappToken {
  // Constructor
  // Name
  string public name = 'Dapp Token';
  // Symbol
  string public symbol = 'DAPP';
  // standard
  string public standard = 'DApp Token v1.0';
  // Supply
  uint256 public totalSupply;

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 _value
  );

  mapping(address => uint256) public balanceOf;

  constructor (uint256 _initialSupply) public {
    // msg is a global variable from solidity.
    // sender is the address of the account that deployed the contract.
    balanceOf[msg.sender] = _initialSupply;

    // Allocate the initial supply.
    totalSupply = _initialSupply;
  }

  // Transfering funds.
  function transfer(address _to, uint256 _value) public returns (bool success){
    require(balanceOf[msg.sender] >= _value);
    // Transfer the balance
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    // Transfer event
    emit Transfer(msg.sender, _to, _value);

    return true;
  }
}
