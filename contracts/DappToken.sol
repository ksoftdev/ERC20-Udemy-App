pragma solidity 0.5.16;


contract DappToken {

    // Token name
    string public name = "Dapp Token";

    // Token symbol
    string public symbol = "DAPP";

    // Token standard
    string public standard = "DApp Token v1.0";

    // Token total supply
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;

    mapping(address => mapping (address => uint256)) public allowance;

    // Constructor
    constructor (uint256 _initialSupply) public {
        // msg is a global variable from solidity.
        // sender is the address of the account that deployed the contract.
        balanceOf[msg.sender] = _initialSupply;

        // Allocate the initial supply.
        totalSupply = _initialSupply;
    }

    // Transfering funds.
    function transferFunds(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        // Transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // Transfer event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    // Approve funds transfer
    function approveTransfer(address _spender, uint256 _value) public returns(bool success) {
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // Transfer from
    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success) {
        // Require allowance is big enough
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        // Change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // Update the allowance
        allowance[_from][msg.sender] -= _value;

        // Transfer event
        emit Transfer(_from, _to, _value);

        // return a boolean
        return true;
    }
}
