pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";


contract FieldToken is StandardToken, BurnableToken {

	  string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public supply;

  	function FieldToken(string _name, string _symbol, uint8 _decimals, uint256 _supply) public {
    	name = _name;
    	symbol = _symbol;
    	decimals = _decimals;
    	supply = _supply;
  	}

}