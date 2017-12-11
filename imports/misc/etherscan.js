// Based on https://github.com/TokenMarketNet/ethereum-smart-contract-transaction-demo/

import fetch from 'isomorphic-fetch';

/** Throw when API call fails. */
export class APIError extends Error {}

export class API {

  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey= apiKey;
  }

  /**
   * Perform an async HTTP request to EtherScan API
   * @param params
   * @returns {*}
   */
  async makeRequest(params) {

    // http://stackoverflow.com/a/34209399/315168
    let esc = encodeURIComponent;
    let query = Object.keys(params)
      .map(k => esc(k) + '=' + esc(params[k]))
      .join('&');

    const url = this.baseURL + "?" + query;
    // console.log('etherscan makeRequest calling:', url);
    const response = await fetch(url);
    // console.log('etherscan makeRequest raw response:', response);
    const data = await response.json();
    // console.log('etherscan makeRequest raw json:', data);

    if (data.error) {
      // {"jsonrpc":"2.0","error":{"code":-32010,"message":"Insufficient funds. Account you try to send transaction from does not have enough funds. Required 62914560000000000 and got: 37085440000000000.","data":null},"id":1}
      throw new APIError(data.error.message);
    }

    // console.log("API result", data);
    return data.result;
  }

  /**
   * Return account balance in wei.
   * @param address
   * @returns {*}
   */
  async getBalance(address) {
    let params = {
      apikey: this.apiKey,
      module: "account",
      action: "balance",
      address: address,
      tag: "latest",
    };
    return await this.makeRequest(params);
  }

  /**
   * Get sent transaction count, including transactions in memory pool.
   *
   * Also can be used as a nonce.
   *
   * @param address
   */
  async getTransactionCount(address) {
    let params = {
      apikey: this.apiKey,
      module: "proxy",
      action: "eth_GetTransactionCount",
      address: address,
      tag: "pending",
    };
    return await this.makeRequest(params);
  }

  /**
   * Push out a raw signed transaction
   *
   * @param data Transaction as hex
   * @return tx hash
   */
  async sendRaw(data) {

    if(!data.startsWith("0x")) {
      throw new Error("Data does not look like 0x hex string:" + data);
    }

    let params = {
      apikey: this.apiKey,
      module: "proxy",
      action: "eth_sendRawTransaction",
      hex: data,
      tag: "latest",
    };
    return await this.makeRequest(params);
  }

  async getGasPrice() {

    let params = {
      apikey: this.apiKey,
      module: "proxy",
      action: "eth_gasPrice",
    };
    return await this.makeRequest(params);
  }

  async getEthPrice() {
    let params = {
      apikey: this.apiKey,
      module: "stats",
      action: "ethprice",
    };
    return await this.makeRequest(params);
  }
}
