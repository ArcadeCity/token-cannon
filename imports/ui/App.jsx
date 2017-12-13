import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import Web3 from 'web3'

import { isAddress, getEthUsd, fetchAddressBalance, grabTransactionsForAddress } from '../misc/ethtools'
import settings from '../../settings.json'

// App component - represents the whole app
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

    // Load eth price
    try {
      ethPrice = await getEthUsd();
      console.log('Got ethPrice:', ethPrice);
      this.setState({ethPrice});
    } catch (error) {
      console.error('Error fetching ethPrice:', error);
    }
  }

  async fromWei (value) {
    const localWeb3 = new Web3(window.web3.currentProvider);
    return localWeb3.eth.fromWei(value)
  }


  async loadTargets() {

    try {
      // await Meteor.callPromise('transactions.loadTargets', '0x7ef8873220958ea400d505a9c92d6ae24f34d55e');
      Meteor.call('transactions.loadTargets', '0x7ef8873220958ea400d505a9c92d6ae24f34d55e')
    } catch (error) {
      console.error('Error loading targets', error);
    }

  }


  //
  // async loadTargetsOld() {
  //   console.log('Loading targets...')
  //   transactions = await grabTransactionsForAddress('0x7ef8873220958ea400d505a9c92d6ae24f34d55e')
  //   console.log('Transactions:', transactions)
  //   this.setState({transactions});
  // }

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
    console.log(this.state)
    // console.log('Address:', this.readWeb3WalletAddress())
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
            {!this.state.transactions ? (
              <button
                onClick={this.loadTargets.bind(this)}
                type="button"
                style={{marginTop: '30px'}}
                className="btn btn-lg btn-primary">Load Targets</button>
            ) : (
              <div style={{margin: '40px 0 20px'}}>
                <h4 style={{marginBottom: '20px'}}>Pending Bonuses</h4>
                {transactions.map((t, n) => (
                  <div key={n}>
                    <p>
                      TxID: <a href={`https://etherscan.io/tx/${t.hash}`} target="_blank">{t.hash}</a>
                      <br />
                      Amount: {web3.fromWei(parseInt(t.value))} ETH
                      <br />
                      From: {t.from}
                      <br />
                      <button
                        onClick={this.loadTargets.bind(this)}
                        type="button"
                        style={{marginTop: '15px'}}
                        className="btn btn-primary">Send {web3.fromWei(parseInt(t.value)) * 85000} ARCD</button>
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

export default App
