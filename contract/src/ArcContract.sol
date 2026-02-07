// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;


import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract ArcController{
    IERC20 public immutable usdc;
    address public admin;

    constructor(address _usdc, address _admin){
        usdc = IERC20(_usdc);
        admin = _admin;
    }

    modifier isAdmin
    {
        require(msg.sender == admin);
        _;
    }

    function deposit(uint _amount, address _to) external{
        usdc.transferFrom(msg.sender, address(this), _amount);

        usdc.transfer(admin, (_amount)/100);
        usdc.transfer(_to, (_amount)*99/100);
        
    }

    function changeAdmin(address _newAdmin) external isAdmin{
        admin = _newAdmin;
    }

}