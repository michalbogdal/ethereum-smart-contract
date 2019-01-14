pragma solidity ^0.5.0;


contract Lottery {

    enum LotteryState { Accepting, Finished }

    address payable public owner;
    address payable[] participants;
    LotteryState state; 
    

    constructor() public {
        owner = msg.sender;
        state = LotteryState.Accepting;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only the owner can execute it"); 
        _;
    }

    function buyCoupon() public payable {
        require(state == LotteryState.Accepting, "lottery is already over");
        require(msg.value == 0.1 ether, "you can spend exactly 0.1 ether for a coupon");
        participants.push(msg.sender);
    }

    function determineWinner() public onlyOwner {
        state = LotteryState.Finished;
        require(participants.length > 0, "required at least one participant");

        uint256 balance = address(this).balance;
        uint256 winningPrice = balance - (balance / 10);
    
        uint256 winningIndex = random() % participants.length;
        address payable winner = participants[winningIndex];
        
        winner.transfer(winningPrice);
        selfdestruct(owner);
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty,now,participants)));
    }
}
