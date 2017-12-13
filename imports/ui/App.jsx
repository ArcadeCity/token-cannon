import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import Web3 from 'web3'
import { withTracker } from 'meteor/react-meteor-data'

import { Transactions } from '../api/transactions'
import { TOKEN_ABI, TOKEN_ADDRESS, CROWDSALE_ADDRESS, isAddress, getEthUsd, fetchAddressBalance, grabTransactionsForAddress, grabTokenInfo } from '../misc/ethtools'
import settings from '../../settings.json'

let abi = require('human-standard-token-abi')

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      transactions: null
    }
  }

  async componentWillMount() {
    // Get eth price here because we consider it constant and don't need to
    // change or reload it during the lifetime of this component being mounted,
    // hence it lives in state.
    EthTools.setUnit('ether');
    let ethPrice;

    // Load eth price and ARCD token info for shits and giggles
    try {
      ethPrice = await getEthUsd();
      console.log('Got ethPrice:', ethPrice);
      this.setState({ethPrice});
      grabTokenInfo()
    } catch (error) {
      console.error('Error fetching ethPrice:', error);
    }
  }

  async fromWei (value) {
    const localWeb3 = new Web3(window.web3.currentProvider);
    return localWeb3.eth.fromWei(value)
  }


  loadTargets() {
    Meteor.call('transactions.loadTargets', CROWDSALE_ADDRESS) // 0x7ef8873220958ea400d505a9c92d6ae24f34d55e
  }

  sendTransaction(tx) {
    console.log('From transaction ', tx)
    let arcdToSend = parseInt(tx.value.c[0]) / 10000 * 85000
    let arcdToReallySend = arcdToSend * 1000000000000000000
    console.log('Sending ' + arcdToSend + ' ARCD to ' + tx.from + ' --- ' + arcdToReallySend)
    let token = web3.eth.contract(abi).at(TOKEN_ADDRESS)
    console.log('token hm:', token)

    token.transfer(tx.from, arcdToReallySend, function (error, result) {
      if(!error) {
        console.log(result)
        Meteor.call('transactions.updateTx', tx, result)
      } else {
        console.log('error! :):):):(:(:(')
        console.error(error);
      }

    })

    //
    // web3.eth.sendTransaction({
    //   from: web3.eth.accounts[0],
    //   value: arcdToSend,
    //   to: tx.from,
    //   gas: '60000',
    //   data: null,
    // }, function(error, response) {})
  }

  async componentWillReceiveProps() {
    // Load user's eth balance
    try {
      const
        ethAddress = Meteor.user() && Meteor.user().ethereum && Meteor.user().ethereum.address,
        ethBalance = (ethAddress && await fetchAddressBalance(ethAddress)) || 0;
      console.log("Got ethBalance:", ethBalance);
      this.setState({ethBalance});
    } catch (error) {
      console.error('Error fetching ethBalance:', error);
    }
  }

  async readWeb3WalletAddress() {
    // event.preventDefault();

    if (!(window.web3 && window.web3.currentProvider)) {
      console.error('web3 not detected');
      return alert('Error connecting to Metamask, is it installed?');
    }

    const localWeb3 = new Web3(window.web3.currentProvider);

    if (!(localWeb3.eth && localWeb3.eth.accounts.length && localWeb3.eth.accounts[0])) {
      console.error('web3 detected but web3.eth.defaultAccount is missing');
      return alert('Unable to read wallet address. Please login to Metamask then reload page.');
    }

    const account = localWeb3.eth.accounts[0];
    console.log('Detected wallet address from web3:', account);
    return account;
  }

  render() {
    console.log('State: ', this.state)
    console.log('Props: ', this.props)

    // Must already be running inside an ETH browser such as Metamask.
    if (typeof web3 === 'undefined') {
      return (
        <div className="container">
          <div className="row justify-content-md-center">
            <div className="col-md-6" style={{margin: '40px 0'}}>
              <h2 style={{marginBottom: '25px'}}>Token Cannon</h2>
              <div>
                Please install an Ethereum browser such as Metamask
                to use this application.
                <br /><br />
                Note that Metamask does not
                currently work on mobile devices. Try using Chrome on a
                desktop computer.
                <br /><br /><br />
                <center><a href="https://metamask.io/" target="_blank"><img src={"/download-metamask.png"} style={{maxWidth: 400}}/></a></center>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-md-8" style={{margin: '40px 0'}}>
            <h2 style={{marginBottom: '25px'}}>Token Cannon</h2>
            <p>Sends Arcade Tokens (ARCD) to a list of target Ethereum addresses.</p>
            <p>Currently targets purchaser addresses from the <a href="https://etherscan.io/address/0x7ef8873220958ea400d505a9c92d6ae24f34d55e" target="_blank">Arcade City token sale contract</a>.</p>
            {!this.props.txs ? (
              <button
                onClick={this.loadTargets.bind(this)}
                type="button"
                style={{marginTop: '30px'}}
                className="btn btn-lg btn-primary">Load Targets</button>
            ) : (
              <div style={{margin: '40px 0 20px'}}>

                <button
                  onClick={this.loadTargets.bind(this)}
                  type="button"
                  style={{marginTop: '30px'}}
                  className="btn btn-lg btn-primary">Load More Targets</button>

                <hr />

                <h4 style={{marginBottom: '20px'}}>Pending Bonuses</h4>
                {this.props.txs.map((t, n) => (
                  <div key={n}>
                    <p>
                      TxID: <a href={`https://etherscan.io/tx/${t.hash}`} target="_blank">{t.hash}</a>
                      <br />
                      Amount: {parseInt(t.value.c[0]) / 10000} ETH
                      <br />
                      From: {t.from}
                      <br />
                      BlockNumber: {t.blockNumber}
                      <br />
                      {t.status === 'sent' ? (
                        <p style={{color: 'green', fontWeight: 'bold', fontSize: '16px'}}>SENT!</p>
                      ) : (
                        <button
                          onClick={() => this.sendTransaction(t)}
                          type="button"
                          style={{marginTop: '15px'}}
                          className="btn btn-primary">Send {parseInt(t.value.c[0]) / 10000 * 85000} ARCD</button>
                        )}
                    </p>
                    <hr />
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }
}

export default withTracker(props => {
  Meteor.subscribe('transactions');

  return {
    txs: Transactions.find().fetch(),
  };
})(App)
