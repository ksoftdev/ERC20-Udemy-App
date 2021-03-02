pragma solidity 0.5.16;


contract DappToken {

    // Token name
    string private name = "Dapp Token";

    // Token symbol
    string private symbol = "DAPP";

    // Token standard
    string private standard = "DApp Token v1.0";

    // Token total supply
    uint256 private totalSupply;

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

    // Returns the token name
    function getTokenName() public view returns (string memory) {
        return name;
    }

    // Returns the token symbol
    function getTokenSymbol() public view returns (string memory) {
        return symbol;
    }

    // Returns the token standard
    function getTokenStandard() public view returns (string memory) {
        return standard;
    }

    // Returns the total supply
    function getTotalSupply() public view returns (uint) {
        return totalSupply;
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
