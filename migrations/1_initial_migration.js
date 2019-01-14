var Lottery = artifacts.require("../contracts/Lottery.sol");
var Migrations = artifacts.require("../contracts/Migrations.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Lottery);
};
