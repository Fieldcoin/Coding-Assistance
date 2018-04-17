pragma solidity ^0.4.18;


import "zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';


contract PreCrowdsale is FinalizableCrowdsale {

  uint public tokenCost = 5; //5 cents
  uint public ETH_USD = 60000; //in cents
  uint public USDRaised = 0;
  uint public tokensSold = 0;
  uint public tokensForSale = 0; //change
  uint public bonusTokens = 0;

  struct Milestone {
    uint time;
    uint bonus;
  }

  Milestone[10] public milestones;
  uint public milestoneCount;

  function PreCrowdsale(uint256 _openingTime, uint256 _closingTime, uint _rate, uint256 _tokenCost, address _wallet, uint256 _tokensForSale, uint256 _bonusTokens, ERC20 _token) public
    Crowdsale(_rate, _wallet, _token)
    TimedCrowdsale(_openingTime, _closingTime) {
      require(_tokenCost > 0);
      require(_tokensForSale > 0);
      tokenCost = _tokenCost;
      tokensForSale = _tokensForSale;
      bonusTokens = _bonusTokens;
  }

  function setETH_USDRate(uint _newETH_USD) public onlyOwner {
    require(_newETH_USD > 0);
    ETH_USD = _newETH_USD;
  }

  function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
     return _weiAmount.mul(ETH_USD).div(tokenCost);
  }


  function getCurrentMilestone() private constant returns (Milestone) {
    uint i;
    for(i=0; i<milestones.length; i++) {
      if(now < milestones[i].time) {
        return milestones[i-1];
      }
    }
  }

  function _processPurchase(address _beneficiary, uint256 _tokenAmount) internal {

    tokensSold = tokensSold.add(_tokenAmount);

    //get bonus tier
    Milestone memory _currentMilestone = getCurrentMilestone();
    if(_currentMilestone.bonus > 0 && bonusTokens > 0) {
      uint _bonusTokens = _tokenAmount.mul(_currentMilestone.bonus).div(100);
      bonusTokens = bonusTokens.sub(_bonusTokens);
      _tokenAmount = _tokenAmount.add(_bonusTokens);
    }

    super._processPurchase(_beneficiary, _tokenAmount);
  }


  function tokensRemaining() public constant returns(uint256) {
    return tokensForSale.sub(tokensSold);
  }

  function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
    require(tokensRemaining() > 0);
    super._preValidatePurchase(_beneficiary, _weiAmount);
  }

  function hasClosed() public view returns (bool) {
    uint tokensLeft = tokensRemaining();
    return tokensLeft == 0 || super.hasClosed();
  }

  function finalization() internal {
    //burn tokens
    BurnableToken _token = BurnableToken(token);
    _token.burn(_token.balanceOf(this));
    super.finalization();
  }
}
