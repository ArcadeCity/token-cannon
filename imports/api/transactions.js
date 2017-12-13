import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'

import Web3 from 'web3'

export const Transactions = new Mongo.Collection('tx1');

if (Meteor.isServer) {
  Meteor.publish('transactions', function () {
    return Transactions.find({});
  });

  Meteor.methods({

    'transactions.updateTx' (tx, rewardTxId) {

      console.log('here we are in updateTx')

      Transactions.update(tx._id, {
        $set : {
          rewardTxId: rewardTxId,
          status: 'sent'
        }
      })
      console.log('Updated tx id ' + tx._id + ' with rewardTxId ' + rewardTxId)

    },

    'transactions.loadTargets' (addr) {
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

      endBlockNumber = 4678051
      startBlockNumber = 4661684 // 4641346 began
      numBlocks = endBlockNumber - startBlockNumber

      console.log('Loading targets from address ' + addr + '...')
      console.log('Sync status: ', web3.eth.syncing)
      console.log("Using startBlockNumber: " + startBlockNumber);
      console.log("Using endBlockNumber: " + endBlockNumber);
      console.log("Searching for transactions to/from account \"" + addr + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);

      // https://ethereum.stackexchange.com/questions/2531/common-useful-javascript-snippets-for-geth/3478#3478
      for (var i = startBlockNumber; i <= endBlockNumber; i++) {
        if (i % 1 == 0) {
          blocksSoFar = i - startBlockNumber
          percSoFar = parseFloat(Math.round(blocksSoFar / numBlocks * 10000) / 100).toFixed(2)
          console.log("Searching block " + i + " - " + blocksSoFar + "/" + numBlocks + " (" + percSoFar + "%)");
        }

        var block = web3.eth.getBlock(i, true);
        if (block != null && block.transactions != null) {

          block.transactions.forEach( (tx) => {
            if (addr == tx.to) {
              console.log('------ Attempting insort')
              tx.status = 'new'

              console.log(tx)
              wat = Transactions.insert(tx)

              // Meteor.callPromise('transactions.insert', tx)
              console.log('?! - ' + wat)
              // Meteor.call('txinsert', tx)
              // tx.dbid =
              // console.log('Transaction added with id: ', tx.dbid)

              // console.log(tx)
              console.log("Inserted ---- tx hash          : " + tx.hash + "\n"
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
      console.log('Done!')

    }
  })

}
