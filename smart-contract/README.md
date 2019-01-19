# ethereum smart contract

Simple lottery ethereum smart contract using oraclize for generating random numbers
- participants can bid with 0.1 ether, 
- each participants can bid couple of times (to increase the chance to win).
The winner take the price (90% of all bids), 10% of it (- gas price) is for organizer.


## some commands

start blockchain
```
truffle develop
```

run ethereum-bridge (for oraclize api)
```
node bridge -a 9 -H 127.0.0.1 -p 9545 --dev
```

### truffle console commands

preparing accounts
```
let accounts; web3.eth.getAccounts(function(err,res) { accounts = res; });
```

balance
```
web3.eth.getBalance(accounts[0])
```


```
let lottery; Lottery.deployed().then(instance => lottery=instance);
```

```
lottery.bid({from: accounts[3], value: 100000000000000000})
lottery.determineWinner({from: accounts[0], gas: 4712388})
```


## useful links in the topic
```
https://github.com/oraclize/ethereum-examples/tree/master/solidity

https://medium.com/coinmonks/how-to-create-a-dapp-using-truffle-oraclize-ethereum-bridge-and-webpack-9cb84b8f6bcb
```

## sources or random data
```
oraclize_query("URL", "https://www.uuidgenerator.net/api/version4");
oraclize_query("URL", "json(https://api.random.org/json-rpc/1/invoke).result.random.data.0", '\n{"jsonrpc":"2.0","method":"generateIntegers","params":{"apiKey":"9844ab4d-52ef-4587-9cf3-20a6930a7f6e","n":1,"min":1,"max":10,"replacement":true,"base":10},"id":1}');
```

```
uint(keccak256(abi.encodePacked(block.number, now, participants)));
```
