const Lottery = artifacts.require("./Lottery.sol");
const truffleAssert = require('truffle-assertions');

contract('Lottery', function([owner, donor]) {  

    it('should deployer be also owner', function() {    
        return Lottery.deployed().then(async function (instance) {
            assert.equal(await instance.owner(), owner, "An owner is different than a deployer")    
            truffleAssert
        });    
        
    });

    it('should accept only 0.1 ether for coupon', function() {
         return Lottery.deployed().then(async function(instance) {
            await truffleAssert.passes(instance.buyCoupon({from: donor, value: 100000000000000000}));
          });
    });


    it('should accept participants buying couple of coupons', function() {
        return Lottery.deployed().then(async function(instance) {
           await truffleAssert.passes(instance.buyCoupon({from: donor, value: 100000000000000000}));
           await truffleAssert.passes(instance.buyCoupon({from: owner, value: 100000000000000000}));
           await truffleAssert.passes(instance.buyCoupon({from: donor, value: 100000000000000000}));
         });
   });

    it('should not accept value different thatn 0.1 ether for coupon', function() {
        return Lottery.deployed().then( async function(instance) {
            await truffleAssert.reverts(instance.buyCoupon({from: donor, value: 20000000}), "you can spend exactly 0.1 ether for a coupon");            
         });
   });

   it('should throw exception if no owner try to determine winner', function() {
        return Lottery.deployed().then(async function(instance) {
            await truffleAssert.passes(instance.buyCoupon({from: donor, value: 100000000000000000}));
            await truffleAssert.reverts(instance.determineWinner({from: donor}), "revert only the owner can execute it");                        
        });     
    });

    it('should determine the winnery by owner', function() {
        return Lottery.deployed().then( async function(instance) {
            await truffleAssert.passes(instance.buyCoupon({from: donor, value: 100000000000000000}))            
            await truffleAssert.passes(instance.determineWinner({from: owner}))        
         });     
    });

    //todo check balances, selecting the winner etc
});