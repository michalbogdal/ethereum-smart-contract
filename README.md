# ethereum-contract

Simple lottery ethereum contract - participants can buy a coupon for 0.1 ether, each participants can buy couple of coupons (to increase the chance to win).
The winner is determined and get almost whole included balance - 10% of it (- gas price) is send to the owner.

truffle develop


--hints:
let accounts;
web3.eth.getAccounts(function(err,res) { accounts = res; });

let lottery;
Lottery.deployed().then(instance => lottery=instance);

lottery.buyCoupon({from: accounts[3], value: 100000000000000000}
lottery.determineWinner({from: accounts[0], gas: 4712388}

