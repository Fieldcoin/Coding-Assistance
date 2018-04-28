pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";


contract FieldToken is StandardToken, BurnableToken {

  string public constant name = "FieldToken"; // solium-disable-line uppercase
  string public constant symbol = "FLC"; // solium-disable-line uppercase
  uint8 public constant decimals = 18; // solium-disable-line uppercase


  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  function FieldToken(uint256 _initialSupply) public {
    totalSupply_ = _initialSupply * (10 ** uint256(decimals));
    balances[msg.sender] = totalSupply_;
    emit Transfer(0x0, msg.sender, totalSupply_);
  }

}
