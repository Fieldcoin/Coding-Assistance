pragma solidity ^0.4.18;


import "zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import 'zeppelin-solidity/contracts/math/Math.sol';


contract TokenSale is FinalizableCrowdsale, Pausable  {

  uint public tokenCost = 5; //5 cents
  uint public ETH_USD = 60000; //in cents
  uint public tokensSold = 0;
  uint public tokensForSale = 0; //change
  uint public bonusTokens = 0;
  bool public initialized = false;
  uint public minContribution;


  struct Milestone {
    uint bonus;
    uint total;
  }

  Milestone[10] public milestones;
  uint public milestoneCount;

  function TokenSale(uint256 _openingTime, uint256 _closingTime, uint _rate, uint256 _tokenCost, address _wallet, uint256 _tokensForSale, uint256 _bonusTokens, ERC20 _token, uint _minContribution) public
  Crowdsale(_rate, _wallet, _token)
  TimedCrowdsale(_openingTime, _closingTime)
  {
      require(_tokenCost > 0);
      require(_tokensForSale > 0);
      require(_minContribution > 0);
      tokenCost = _tokenCost;
      tokensForSale = _tokensForSale;
      bonusTokens = _bonusTokens;
      minContribution = _minContribution;
  }

  function setETH_USDRate(uint _newETH_USD) public onlyOwner {
    require(_newETH_USD > 0);
    ETH_USD = _newETH_USD;
  }

  function initializeMilestones(uint[] _bonus, uint[] _total) public onlyOwner {
    require(now < openingTime);
    require(_bonus.length > 0 && _bonus.length == _total.length);
    for(uint i=0; i < _bonus.length; i++) {
      milestones[i] = Milestone({ total: _total[i], bonus: _bonus[i] });
    }
    milestoneCount = _bonus.length;
    initialized = true;
  }

  function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
     return _weiAmount.mul(ETH_USD).div(tokenCost);
  }

  function getCurrentMilestoneIndex() public constant returns (uint) {
    uint i;
    for(i=0; i < milestoneCount; i++) {
      if(tokensSold < milestones[i].total) {
        return i;
      }
    }
  }

  function _processPurchase(address _beneficiary, uint256 _tokenAmount) internal {
    require(tokensRemaining() >= _tokenAmount);
    uint currentMilestoneIndex = getCurrentMilestoneIndex();
    uint _bonusTokens = 0;
    //get bonus tier
    Milestone memory _currentMilestone = milestones[currentMilestoneIndex];
    if(bonusTokens > 0 && _currentMilestone.bonus > 0) {
      _bonusTokens = _tokenAmount.mul(_currentMilestone.bonus).div(100);
      _bonusTokens = Math.min256(bonusTokens, _bonusTokens);
      bonusTokens = bonusTokens.sub(_bonusTokens);
    }
    tokensSold = tokensSold.add(_tokenAmount);
    super._processPurchase(_beneficiary, _tokenAmount.add(_bonusTokens));

  }


  function tokensRemaining() public constant returns(uint256) {
    return tokensForSale.sub(tokensSold);
  }

  function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) whenNotPaused internal {
    require(initialized == true);
    require(_weiAmount >= minContribution);
    super._preValidatePurchase(_beneficiary, _weiAmount);
  }

  function changeMinContribution(uint256 _minContribution) public onlyOwner {
     require(_minContribution > 0);
     minContribution = _minContribution;
  }

  function changeTokenCost(uint256 _tokenCost) public onlyOwner {
     require(_tokenCost > 0);
     tokenCost = _tokenCost;
  }

  function hasClosed() public view returns (bool) {
    uint tokensLeft = tokensRemaining();
    return tokensLeft == 0 || super.hasClosed();
  }

  function setNewWallet(address _newWallet) onlyOwner public {
    wallet = _newWallet;
  }

  function finalization() internal {
    //burn tokens
    BurnableToken _token = BurnableToken(token);
    _token.burn(_token.balanceOf(this));
    super.finalization();
  }
}
