import settings from '../../settings.json';

import Web3 from 'web3';
import { API } from './etherscan';
import { buildTx } from "./txbuilder";

const ethNetwork = settings.eth.network,
  ethSettings = settings.eth[ethNetwork],
  api = new API(ethSettings.etherscanApiUrl, ethSettings.etherscanApiKey);

// https://ethereum.stackexchange.com/questions/2531/common-useful-javascript-snippets-for-geth/3478#3478
export async function grabTransactionsForAddress (myaccount) {
  console.log('Grabbing transactions for address ' + myaccount)

  web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/" + ethSettings.infuraKey)); //
  // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  console.log(web3)
  console.log('Current block number is: ' + web3.eth.blockNumber)

  if (web3.eth.blockNumber == 0) {
    console.log('eh zero')
    console.log(web3.eth.syncing)
    // console.log(web3.eth.debug.traceTransaction('0xed3b42563b70d1237a98f5c652a7b3befabbd4d2b29abb3d422398eabd504179'))
    return
  }

  transactions = []

  endBlockNumber = 4646466
  startBlockNumber = 4646284
  console.log("Using startBlockNumber: " + startBlockNumber);
  console.log("Using endBlockNumber: " + endBlockNumber);

  console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);

  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    console.log(i)
    if (i !== 4646464 && i !== 4646284) // just query 2 specific blocks for demo purposes now so we avoid infura rate-limiting
      continue
    console.log("Searching block " + i);
    var block = web3.eth.getBlock(i, true);
    if (block != null && block.transactions != null) {
      // console.log('block.transactions:', block.transactions)
      block.transactions.forEach( function(e) {
        if (myaccount == "*" || myaccount == e.from || myaccount == e.to) {
          console.log('------')
          transactions.push(e)
          console.log(e)
          console.log("  tx hash          : " + e.hash + "\n"
            + "   nonce           : " + e.nonce + "\n"
            + "   blockHash       : " + e.blockHash + "\n"
            + "   blockNumber     : " + e.blockNumber + "\n"
            + "   transactionIndex: " + e.transactionIndex + "\n"
            + "   from            : " + e.from + "\n"
            + "   to              : " + e.to + "\n"
            + "   value           : " + e.value + "\n"
            + "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
            + "   gasPrice        : " + e.gasPrice + "\n"
            + "   gas             : " + e.gas + "\n"
            + "   input           : " + e.input);
          console.log('------------------')
        }
      })
    }
  }

  return transactions
}

export async function fetchAddressBalance (address) {
  console.log("Attempting to fetch ether balance for address:", address);
  let balance;
  try {
    balance = await api.getBalance(address);
  } catch (error) {
    console.error('Etherscan error:', error);
    return;
  }
  console.log("Fetch result balance:", balance);
  return balance;
}

export async function getEthUsd () {
  console.log('Looking up ETHUSD price');
  let ethprice;
  try {
    ethprice = await api.getEthPrice();
  } catch (error) {
    console.error('Etherscan error:', error);
    return;
  }
  if (ethprice.ethusd)
    return ethprice.ethusd;
  throw new Error('Request succeeded but ethusd price data missing.');
}

/**
 * Creates and transmits an ETH transaction that sends a fixed reward amount
 * from the built-in wallet address to the recipient address.
 * @param toAddress
 * @returns txid of new reward transaction
 */
export async function sendEthReward (toAddress) {
  // This needs to be a global.
  // Must still be done on server, as this method runs on server.
  web3 = new Web3();

  const fromAddress = ethSettings.walletPubkey,
    nonce = await api.getTransactionCount(fromAddress),
    gasPrice = await api.getGasPrice(),
    gasLimit = web3.toHex(200000),
    value = web3.toHex(settings.reward.wei),
    txData = {
      contractAddress: toAddress,
      privateKey: ethSettings.walletPrivkey,
      nonce: nonce,
      functionSignature: null,
      functionParameters: null,
      value: value,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    };

  console.log("Building transaction with parameters:", txData);
  const tx = buildTx(txData);
  console.log("Created raw transaction, transmitting:", tx);
  return await api.sendRaw(tx);
}

// Ensure this has the basic requirements of an address
// https://ethereum.stackexchange.com/questions/1374/how-can-i-check-if-an-ethereum-address-is-valid
export function isAddress (address) {
  return /^(0x)?[0-9a-f]{40}$/i.test(address);
}
