// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;


contract Migrations {
    address public owner = msg.sender;
    uint public lastCompletedMigration;

    modifier restricted() {
        require(
        msg.sender == owner,
        "This function is restricted to the contracts owner"
        );
        _;
    }

    function setCompleted(uint completed) public restricted {
        lastCompletedMigration = completed;
    }
}
