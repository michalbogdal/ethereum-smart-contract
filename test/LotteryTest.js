const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:9545'))

const Lottery = artifacts.require("./Lottery.sol");
const truffleAssert = require('truffle-assertions');

const waitForEvent = (_event, _from = 0, _to = 'latest') => 
  new Promise ((resolve,reject) => 
    _event({fromBlock: _from, toBlock: _to}, (e, ev) => 
      e ? reject(e) : resolve(ev)))


contract('Lottery', function([owner, donor]) {  

    let lottery;

    beforeEach(async () => (
        //{contract} = await Lottery.deployed(), 
        lottery = await Lottery.new({from: owner}), 
        {methods, events} = new web3.eth.Contract(lottery.contract._jsonInterface, lottery.contract._address) 
      ))

    it('should deployer be also organizer', async () => {   
        //two ways of executing methods
        assert.equal(await methods.organizer().call(), owner, "An organizer is different than a deployer")                        
        assert.equal(await lottery.organizer(), owner, "An organizer is different than a deployer")                        
    });    

    it('should accept only 0.1 ether for bid', async () => {
        //await truffleAssert.passes(methods.bid().send({from: donor, value: 100000000000000000})); 
        await truffleAssert.passes(lottery.bid({from: donor, value: 100000000000000000})); 
        const {returnValues:{participant, balanceInPool}} = await waitForEvent(events.LogBidMade) 
        assert.equal(participant, donor, "wrong participant")  
        assert.equal(balanceInPool, 100000000000000000, "0.1 ether should be in winning pool")     
    });

    it('should get total winning price after bidding', async () => {
        
        let tx = await lottery.bid({from: donor, value: 100000000000000000})   ;
        await truffleAssert.eventEmitted(tx, "LogBidMade", (ev) => {
            return ev.balanceInPool == 100000000000000000;
        }, "0.1 ether should be in winning pool");

        tx = await lottery.bid({from: donor, value: 100000000000000000})   ;
        await truffleAssert.eventEmitted(tx, "LogBidMade", (ev) => {
            return ev.balanceInPool == 200000000000000000;
        }, "0.2 ether should be in winning pool");
        
        tx = await lottery.bid({from: donor, value: 100000000000000000})   ;
        await truffleAssert.eventEmitted(tx, "LogBidMade", (ev) => {
            return ev.balanceInPool == 300000000000000000;
        }, "0.3 ether should be in winning pool");       
    });

    it('should accept participants buying couple of coupons', async () => {
        await truffleAssert.passes(lottery.bid({from: donor, value: 100000000000000000}));
        await truffleAssert.passes(lottery.bid({from: donor, value: 100000000000000000}));
        await truffleAssert.passes(lottery.bid({from: donor, value: 100000000000000000}));
   });

    it('should not accept value different that 0.1 ether for bid', async () => {
        await truffleAssert.reverts(lottery.bid({from: donor, value: 20000000}), "you can bid with exactly 0.1 ether");            
   });

   it('should throw exception if no owner try to determine winner', function() {
         truffleAssert.passes(lottery.bid({from: donor, value: 100000000000000000}));
         truffleAssert.reverts(lottery.determineWinner({from: donor}), "only the organizer can execute it");                                    
    });

    it('should throw exception if determining winner without paticipants', async () => {
        await truffleAssert.reverts(lottery.determineWinner({from: owner}), "required at least one participant");                                    
    });

    it('should winner received winner price', async () => {
        await truffleAssert.passes(lottery.bid({from: donor, value: 100000000000000000}))            
        await truffleAssert.passes(lottery.bid({from: donor, value: 100000000000000000})) 
        await lottery.determineWinner({from: owner, gas:4000000}) 
        
        const {returnValues:{winner, winningPrice}} = await waitForEvent(events.LogWinnerDetermined)
        assert.equal(winner, donor, "wrong winner")
        let expectedWinningPrice = 2 * 100000000000000000 - (2 * 100000000000000000 / 10);
        assert.equal(winningPrice, expectedWinningPrice, "wrong winning price")        
    });

    it('should determine the winner if only one bid', async () => {
        await truffleAssert.passes(lottery.bid({from: donor, value: 100000000000000000}))            
        await truffleAssert.passes(lottery.determineWinner({from: owner, gas:4000000})) 
        const {returnValues:{winner}} = await waitForEvent(events.LogWinnerDetermined)
        assert.equal(winner, donor, "wrong winner")        
    });

    it('should organizer receive 10% of winning price', async () => {
        await truffleAssert.passes(lottery.bid({from: donor, value: 100000000000000000}))            
        await truffleAssert.passes(lottery.bid({from: donor, value: 100000000000000000})) 

        let balanceBefore = await web3.eth.getBalance(owner)
        let txInfo = await lottery.determineWinner({from: owner, gas:200000})         

        await waitForEvent(events.LogWinnerDetermined)
        let balanceAfter = await web3.eth.getBalance(owner)   
        
        const tx = await web3.eth.getTransaction(txInfo.tx);
        let defaultGasPrice = tx.gasPrice;//by default 20000000000;
        let oraclizeAproxGasUsed = 200000;
        let transactionFee = (txInfo.receipt.gasUsed + oraclizeAproxGasUsed ) * defaultGasPrice;
        console.log("estimated tansaction fee "+ transactionFee);
        console.log("organizer balance diff: "+(parseInt(balanceAfter) - parseInt(balanceBefore)))

        assert.isAbove(parseInt(balanceAfter), parseInt(balanceBefore), "organizer should receive fee")

        let estimatedOrganizerWinningPrice = 100000000000000000 * 2 / 10 - transactionFee;
        assert.isAbove(parseInt(balanceAfter) - parseInt(balanceBefore), estimatedOrganizerWinningPrice, "should receive at least 10% (minus operation fees) of winning price")
    });
});