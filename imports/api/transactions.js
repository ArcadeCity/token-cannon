import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'
import Web3 from 'web3'

export const Transactions = new Mongo.Collection('transactions');

if (Meteor.isServer) {
  Meteor.publish('transactions', function () {
    return Transactions.find({});
  });
}

Meteor.methods({

  txinsert(transaction) {
    console.log('Inserting tx!!!', transaction)
    Transactions.insert(transaction)
    console.log('did it?')
    // console.log('Did that work?!!!', tx)
    // return tx
    return true
  },

  async 'transactions.insert' (transaction) {
    console.log('Inserting tx', transaction)
    tx = Transactions.insert(transaction)
    console.log('Did that work?', tx)
    return tx
  },

  'transactions.loadTargets' (addr) {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

    endBlockNumber = 4720382
    startBlockNumber = 4641346
    numBlocks = endBlockNumber - startBlockNumber

    console.log('Loading targets from address ' + addr + '...')
    console.log('Sync status: ', web3.eth.syncing)
    console.log("Using startBlockNumber: " + startBlockNumber);
    console.log("Using endBlockNumber: " + endBlockNumber);
    console.log("Searching for transactions to/from account \"" + addr + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);

    // https://ethereum.stackexchange.com/questions/2531/common-useful-javascript-snippets-for-geth/3478#3478
    for (var i = startBlockNumber; i <= endBlockNumber; i++) {
      if (i % 50 == 0) {
        blocksSoFar = i - startBlockNumber
        percSoFar = parseFloat(Math.round(blocksSoFar / numBlocks * 10000) / 100).toFixed(2)
        console.log("Searching block " + i + " - " + blocksSoFar + "/" + numBlocks + " (" + percSoFar + "%)");
      }

      var block = web3.eth.getBlock(i, true);
      if (block != null && block.transactions != null) {
        block.transactions.forEach( (tx) => {
          if (addr == "*" || addr == tx.from || addr == tx.to) {
            console.log('------')
            tx.status = 'new'
            console.log(tx)
            Transactions.insert(tx)
            console.log('?!')

            // Meteor.callPromise('transactions.insert', tx)
            // Meteor.call('txinsert', tx)
            // tx.dbid =
            // console.log('Transaction added with id: ', tx.dbid)

            // console.log(tx)
            console.log("  tx hash          : " + tx.hash + "\n"
              + "   nonce           : " + tx.nonce + "\n"
              + "   blockHash       : " + tx.blockHash + "\n"
              + "   blockNumber     : " + tx.blockNumber + "\n"
              + "   transactionIndex: " + tx.transactionIndex + "\n"
              + "   from            : " + tx.from + "\n"
              + "   to              : " + tx.to + "\n"
              + "   value           : " + tx.value + "\n"
              + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
              + "   gasPrice        : " + tx.gasPrice + "\n"
              + "   gas             : " + tx.gas + "\n"
              + "   input           : " + tx.input);
            console.log('------------------')
          }
        })
      }
    }

  }
})
