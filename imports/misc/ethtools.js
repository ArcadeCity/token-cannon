import settings from '../../settings.json'

import Web3 from 'web3'
import { API } from './etherscan'
import { buildTx } from "./txbuilder"
import { Meteor } from 'meteor/meteor'

const ethNetwork = settings.eth.network,
  ethSettings = settings.eth[ethNetwork],
  api = new API(ethSettings.etherscanApiUrl, ethSettings.etherscanApiKey);

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
