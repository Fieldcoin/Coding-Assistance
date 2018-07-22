pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "zeppelin-solidity/contracts/ownership/CanReclaimToken.sol";
import "zeppelin-solidity/contracts/ownership/Whitelist.sol";
import "zeppelin-solidity/contracts/token/ERC827/ERC827Token.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract FieldToken is ERC827Token, BurnableToken, CanReclaimToken, Whitelist, Pausable {

  string public constant name = "FieldToken";
  string public constant symbol = "FLC";
  uint8 public constant decimals = 18;
  bool public released = false;
  mapping(address => bool) public transferAgents;

  modifier canTransfer(address sender) {
    if(released) {
      _;
    } else if(transferAgents[sender]) {
      _;
    } else {
      revert();
    }
  }


  function setTransferAddress(address _addr, bool _allowTransfer) public onlyWhitelisted whenNotPaused {
    transferAgents[_addr] = _allowTransfer;
  }
  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  function FieldToken(uint256 _initialSupply) public {
    totalSupply_ = _initialSupply * (10 ** uint256(decimals));
    balances[msg.sender] = totalSupply_;
    super.addAddressToWhitelist(msg.sender);
    setTransferAddress(msg.sender, true);
    emit Transfer(0x0, msg.sender, totalSupply_);
  }

  function releaseToken() public onlyWhitelisted whenNotPaused {
    released = true;
  }

  function transfer(address _to, uint _amount) public canTransfer(msg.sender)  whenNotPaused returns(bool) {
    return super.transfer(_to, _amount);
  }

  function transferFrom(address _from, address _to, uint _amount) public canTransfer(_from)  whenNotPaused returns(bool) {
    return super.transferFrom(_from, _to, _amount);
  }

  function burn(uint256 _value) public onlyWhitelisted whenNotPaused {
    super.burn(_value);
  }

  function transferAndCall(address _to, uint256 _value, bytes _data) public payable canTransfer(msg.sender) whenNotPaused returns (bool) {
    return super.transferAndCall(_to, _value, _data);
  }

  function transferFromAndCall(address _from, address _to, uint256 _value, bytes _data) public payable whenNotPaused canTransfer(_from) returns (bool) {
    return super.transferFromAndCall(_from, _to, _value, _data);
  }

}
