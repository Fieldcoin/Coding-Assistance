pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import './FieldToken.sol';


contract PreCrowdsale is CappedCrowdsale, WhitelistedCrowdsale, TimedCrowdsale, FieldToken {


  uint8 public MAX_TIERS = 2;

  struct Tier {
    uint256 discount;  // bonus percentage
    uint256 startTime; // from start time 
    uint256 endTime;  // to end time 
    uint256 cap; // cap for the tier
  }

  Tier[2] public tiers;

  bool public tiersInitialized = false;


  function PreCrowdsale(uint256 _openingTime, uint256 _closingTime, uint256 _rate, address _wallet, uint256 _cap, FieldToken _token) public
    Crowdsale(_rate, _wallet, _token)
    TimedCrowdsale(_openingTime, _closingTime)
    CappedCrowdsale(_cap) 
    {

    }


   function initTiers(uint256[] discount, uint256[] startTime, uint256[] endTime, uint256[] cap) public onlyOwner {
    require(discount.length == MAX_TIERS && startTime.length == MAX_TIERS && endTime.length == MAX_TIERS && cap.length == MAX_TIERS);

    for(uint8 i=0;i<MAX_TIERS; i++) {
      require(discount[i] > 0);
      require(startTime[i] >= now);
      require(endTime[i] > startTime[i]);
      require(cap[i] > 0);

      /**
      require(from[i] > 0);
      if(i>0) {
        require(from[i] > to[i-1]);
      }
      **/

      tiers[i] = Tier({
        discount: discount[i],
        startTime: startTime[i],
        endTime: endTime[i],
        cap: cap[i]
      });


    }

    tiersInitialized = true;
  }

  function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
    return _weiAmount.mul(rate);
  }


}