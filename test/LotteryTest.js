const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:9545'))

const Lottery = artifacts.require("./Lottery.sol");
const truffleAssert = require('truffle-assertions');

const waitForEvent = (_event, _from = 0, _to = 'latest') => 
  new Promise ((resolve,reject) => 
    _event({fromBlock: _from, toBlock: _to}, (e, ev) => 
      e ? reject(e) : resolve(ev)))


contract('Lottery', function([owner, donor]) {  

    beforeEach(async () => (
        {contract} = await Lottery.deployed(), 
        {methods, events} = new web3.eth.Contract(contract._jsonInterface, contract._address) 
      ))

    it('should deployer be also organizer', async () => {   
        assert.equal(await methods.organizer().call(), owner, "An organizer is different than a deployer")                        
    });    

    it('should accept only 0.1 ether for bid', async () => {
        await truffleAssert.passes(methods.bid().send({from: donor, value: 100000000000000000})); 
        const {returnValues:{participant}} = await waitForEvent(events.LogBidMade) 
        assert.equal(participant, donor, "wrong participant")       
    });


    it('should accept participants buying couple of coupons', async () => {
        await truffleAssert.passes(methods.bid().send({from: donor, value: 100000000000000000}));
        await truffleAssert.passes(methods.bid().send({from: owner, value: 100000000000000000}));
        await truffleAssert.passes(methods.bid().send({from: donor, value: 100000000000000000}));
   });

    it('should not accept value different that 0.1 ether for bid', async () => {
        await truffleAssert.reverts(methods.bid().send({from: donor, value: 20000000}), "you can bid with exactly 0.1 ether");            
   });

   it('should throw exception if no owner try to determine winner', function() {
         truffleAssert.passes(methods.bid().send({from: donor, value: 100000000000000000}));
         truffleAssert.reverts(methods.determineWinner().send({from: donor}), "only the organizer can execute it");                                    
    });

    it('should determine the winner if only one bid', async () => {
        truffleAssert.passes(methods.bid().send({from: donor, value: 100000000000000000}))            
        truffleAssert.passes(methods.determineWinner().send({from: owner, gas:4000000, value:100000000000000}))   
        const {returnValues:{winner, winningPrice}} = await waitForEvent(events.LogWinnerDetermined)
        assert.equal(winner, donor, "wrong winner")
    });

    it('should throw exception if determining winner without paticipants', async () => {
        truffleAssert.reverts(methods.determineWinner().send({from: donor}), "required at least one participant");                                    
    });

    it('should winner received ether', async () => {
        truffleAssert.passes(methods.bid().send({from: donor, value: 100000000000000000}))            
        truffleAssert.passes(methods.bid().send({from: donor, value: 100000000000000000})) 
        truffleAssert.passes(methods.determineWinner().send({from: owner, gas:4000000}))   
        const {returnValues:{winner, winningPrice}} = await waitForEvent(events.LogWinnerDetermined)
        assert.equal(winner, donor, "wrong winner")
        assert.isTrue(winningPrice > 100000000000000000 * 1.5)
        assert.isTrue(winningPrice < 100000000000000000 * 2)
    });
});