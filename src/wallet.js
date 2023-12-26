import React, { Component } from 'react';
import axios from 'axios';
import config from './config/config'
import { Link, Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from './directives/header';
import Footer from './directives/footer';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import copy from 'copy-to-clipboard';
import moment from 'moment'
import Websocket from 'react-websocket';
import Loader from "react-loader-spinner";
import { confirmAlert } from 'react-confirm-alert';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Modal from 'react-modal';
import Countdown, { zeroPad } from 'react-countdown';
import 'react-tabs/style/react-tabs.css';
var QRCode = require('qrcode.react');

const headers = {
  'Content-Type': 'application/json'
};

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
}

export default class Wallet extends Component {

  constructor(props) {
    super(props);
    this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
    this.state = {
      getWalletList: [],
      getTxList: [],
      downloadList: [],
      getallTxList: [],
      platinxtransferHistory: [],
      allplatinxtransferHistory: [],
      walletAddress: '',
      allWalletData: [],
      switchchecked: false,
      getAddress: '',
      getAddressSingal: '',
      TotalBalanceIUSD: '',
      inr_price: 0,
      switch_loader: false,
      isTimerModalOpen: false,
      userKYC: '',
      tabId: 1,
      loader: false,
      refreshBtn: true,
      admin_mkd_amount: 0,
      admin_all_amount: 0,
    }
    this.walletList = this.walletList.bind(this);
  }
  componentDidMount() {
    if (!Cookies.get('loginSuccess')) {
      window.location.href = `${config.baseUrl}login`
      return false;
    }
    this.txListAPI()
    this.getuserKYC();
    this.liveInrUsdt()
    this.getPortfolio()
    this.walletList();
    this.coinListAPI();
    this.gettransferHistoryList()
    setTimeout(() => {
      this.updateWallet();
    }, 1000);
  }

  async coinListAPI() {
    await axios({
      method: 'get',
      url: `${config.apiUrl}/coinList` + '?nocache=' + new Date().getTime(),
    })
      .then(result => {
        if (result.data.success === true) {
          this.setState({
            coinList: result.data.response,
          })
        }
        else if (result.data.success === false) {
          this.setState({
            coinList: [],
          })
        }
      })
  }

  getuserKYC = async () => {

    var data = {
      user_id: this.loginData.data.id,
      // "email": this.loginData?.data?.user_email,
    }
    await axios({
      method: 'post',
      url: `${config.apiUrl}/getuserkyc`,
      headers: { "Authorization": this.loginData?.Token },
      data: data
    })
      .then(result => {
        // console.log(result.data.response);
        this.setState({
          userKYC: result.data.response
        })

      }).catch(err => {
        if (err == 'Error: Request failed with status code 403') {
          toast.error('Session expired please re-login')
        }

      })
  }

  async gettransferHistoryList() {
    const res = await axios.get(`${config.apiUrl}/transferHistory?user_id=${this.loginData.data?.id}`)
    if (res.data.success == true) {
      this.setState({ platinxtransferHistory: res.data.response,allplatinxtransferHistory:res.data.response })
    }
  }

  async walletList() {
    this.setState({ loader: true })
    if (this.state.refreshBtn == false) {
      return false;
    } else {
      this.updateWallet();
    }
    this.setState({
      refreshBtn: false
    })

    await axios({
      method: 'post',
      url: `${config.apiUrl}/userwallet` + '?nocache=' + new Date().getTime(),
      headers: { "Authorization": this.loginData?.Token },
      data: { 'user_id': this.loginData.data?.id, "email": this.loginData?.data.user_email }
    })
      .then(async result => {
        if (result.data.success === true) {
          this.setState({ loader: false })
          this.setState({
            getWalletList: result.data.response.filter(item => item.symbol != 'DAI'),
            allWalletData: result.data.response.filter(item => item.symbol != 'DAI')
          })

          var TotalBalanceIUSD = 0;
          this.setState({ switch_loader: true })
          var resData = result.data.response.filter(item => item.symbol != 'DAI');
          for (var i = 0; i < resData.length; i++) {
            if (resData[i].symbol !== 'USDT' && resData[i].coin_user_id == null) {
              var getData = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${resData[i].symbol}USDT`);
              var livePrice = await getData.json();
              if (parseFloat(livePrice.askPrice) > 0) {
                TotalBalanceIUSD += parseFloat(resData[i].balance) * parseFloat(livePrice.askPrice)
                resData[i].livePrice = parseFloat(resData[i].balance) * parseFloat(livePrice.askPrice) 
              } else {
                resData[i].livePrice = parseFloat(resData[i].balance)
              }
            }
            if (resData[i].symbol == 'USDT' && resData[i].coin_user_id == null) {
              TotalBalanceIUSD += parseFloat(resData[i].balance) 
              resData[i].livePrice = parseFloat(resData[i].balance)
            }
            if (resData[i].symbol !== 'USDT' && resData[i].coin_user_id != null) {
              const customliveprice = await this.livecoinPrice(resData[i].coin_id)
              // console.log('customlivepricecustomliveprice', customliveprice)
              TotalBalanceIUSD += parseFloat(resData[i].balance) * parseFloat(customliveprice);
              resData[i].livePrice = parseFloat(customliveprice)
            }
          }

          this.setState({
            switch_loader: false,
            getWalletList: resData,
            walletAddress: resData[0].public_key,
            // allWalletData: resData,
            // TotalBalanceIUSD: TotalBalanceIUSD,
            refreshBtn: true,
            loader: false
          })

        }

        else if (result.data.success === false) {
          toast.error(result.data.msg, {
            position: toast.POSITION.TOP_CENTER
          });
          this.setState({ loader: false, switch_loader: false, })
        }
      })

      .catch(err => {
        if (err == 'Error: Request failed with status code 403') {
          toast.error('Session expired please re-login')
        } else {
          toast.error(err.result?.data?.msg, {
            position: toast.POSITION.TOP_CENTER
          })
        }
        this.setState({ loader: false, switch_loader: false })
      })

  }
  async liveInrUsdt() {
    var lastprice = 0
    await axios({
      method: 'get',
      url: `${config.apiUrl}/liveInrUsdt`,
    }).then(async (response) => {
      lastprice = response.data.price
      return lastprice

    })
    this.setState({ inr_price: lastprice })
    return lastprice
  }

  async getPortfolio() {
    var lastprice = 0
    await axios({
      method: 'get',
      url: `${config.apiUrl}/getPortfolio?user_id=${this.loginData.data?.id}`,
    }).then(async (response) => {
      this.setState({ TotalBalanceIUSD: response?.data?.total_balance })
    })

  }


  async livecoinPrice(coin_id) {
    var lastprice = 0
    await axios({
      method: 'get',
      url: `${config.apiUrl}/getCoinlivePrice?left_coin_id=${coin_id}`,
    }).then(async (response) => {
      lastprice = 0
      if (response.data?.response?.price > 0) {
        lastprice = response.data.response.price
      }
      return lastprice

    })
    this.setState({ inr_price: lastprice })
    return lastprice
  }

  async txListAPI() {
    await axios({
      method: 'post',
      url: `${config.apiUrl}/trxHistory` + '?nocache=' + new Date().getTime(),
      data: {
        'user_id': this.loginData.data?.id,
        "email": this.loginData.data?.user_email,
        'from_date': this.state.from_date,
        'to_date': this.state.to_date,
        'coin': this.state.coin,
        'type': this.state.type,
      },
      headers: { "Authorization": this.loginData?.Token },
    })
      .then(result => {
        if (result.data.success === true) {
          let newarr = []
          if (result.data.response.length > 0) {
            for (let x in result.data.response) {
              let obj = result.data.response[x]
              obj.status = result.data.response[x].status == 0 ? 'Pending' : result.data.response[x].status == 1 ? 'Completed' : 'Rejected'
              newarr.push(obj)
            }
          }
          this.setState({
            downloadList: newarr,
            getTxList: result.data.response,
            getallTxList: result.data.response
          })
        }

        else if (result.data.success === false) {
          this.setState({
            getTxList: [],

          })
        }
      })

      .catch(err => {
        if (err == 'Error: Request failed with status code 403') {
          toast.error('Session expired please re-login')
        } else {

          toast.error(err.result?.data?.msg, {
            position: toast.POSITION.TOP_CENTER
          })
        }

      })

    setTimeout(() => {
      this.setState({
        submitBtn: false
      })
    }, 900);

  }
  async updateWallet() {

    await axios({
      method: 'post',
      url: `${config.apiUrl}/userwallet` + '?nocache=' + new Date().getTime(),
      headers: { "Authorization": this.loginData?.Token },
      data: { 'user_id': this.loginData.data?.id, "email": this.loginData?.data.user_email, 'refreshWallet': 'yes' }
    })
      .then(async result => {
        if (result.data.success === true) {
          // this.walletList();
        }
      })

  }
  depositaddress(id) {

    this.setState({
      getAddress: 1,
      getAddressSingal: id
    })
  }


  closebutton() {
    this.setState({
      getAddress: ''
    })
  }

  copyToClipboard(id) {
    copy(id);
    toast.success("Copied", {
      position: toast.POSITION.TOP_CENTER
    });

  }


  switchChange(e) {

    if (e.target.checked) {
      const filter = this.state.allWalletData.filter(item => item.balance > 0)

      this.setState({ switchchecked: true, getWalletList: filter })
    } else {
      this.setState({ switchchecked: false, getWalletList: this.state.allWalletData })
    }
  }

  checkTab(e, id) {
    this.setState({ tabId: id })
  }

  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
    if (e.target.value == 'Deposit') {
      const filter = this.state.getallTxList.filter((item) => item.trx_type_name == 'Deposit')
      this.setState({ getTxList: filter })
    } else if (e.target.value == 'Withdraw') {
      const filter = this.state.getallTxList.filter((item) => item.trx_type_name == 'Withdraw')
      this.setState({ getTxList: filter })
    } else if (e.target.name == 'selectcoin' && e.target.value) {
      const filter = this.state.getallTxList.filter((item) => item.symbol == e.target.value)
      this.setState({ getTxList: filter })
    }
    else {
      this.setState({ getTxList: this.state.getallTxList })
    }
  }

  downloadCSVFromJson = (filename, arrayOfJson) => {
    if (arrayOfJson.length > 0) {
      // convert JSON to CSV
      const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
      const header = Object.keys(arrayOfJson[0])
      let csv = arrayOfJson.map(row => header.map(fieldName =>
        JSON.stringify(row[fieldName], replacer)).join(','))
      csv.unshift(header.join(','))
      csv = csv.join('\r\n')

      // Create link and download
      var link = document.createElement('a');
      link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv));
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  searchFilter(e) {
    if (e.target.value) {
      const filter = this.state.allWalletData.filter(obj => Object.keys(obj).some(name => obj['symbol'].toUpperCase().includes(e.target.value.toUpperCase())))

      this.setState({ getWalletList: filter })
    } else {
      this.setState({ getWalletList: this.state.allWalletData })
    }
  }

  updateRejectAPI(e, id) {
    console.log('idid', id)
    e.preventDefault()
    let headers = {
      'Authorization': this.loginData?.Token,
      'Content-Type': 'application/json'
    }
    confirmAlert({
      title: 'Confirm to submit',
      message: 'Are you sure to Reject him.',
      buttons: [
        {
          label: 'Yes',
          onClick: () =>
            axios.post(`${config.apiUrl}/rejectrequest`, { usd_amount: id.usd_amount, "type": id.trx_type_name == 'Withdraw' ? "withdraw" : "deposit", 'id': id.id, "request_user_id": this.loginData.data?.id, "email": this.loginData.data?.user_email, "user_id": this.loginData.data?.id }, { headers: headers })
              .then(result => {

                if (result.data.success === true) {
                  toast.success(result.data.msg, {
                    position: toast.POSITION.TOP_CENTER
                  });

                  this.componentDidMount();

                }

                else if (result.data.success === false) {

                }
              })

              .catch(err => {
              })
        },
        {
          label: 'No',
        }
      ]
    });

  }


  refreshWallet() {
    this.walletList()
  }


  async getToCheckCoinVisible(symbol) {
    this.SingalCoin = symbol

    // if (this.SingalCoin == 'exch' || this.SingalCoin == 'Exch' || this.SingalCoin == 'Exchange') {
    //     return false;
    // } else {
    let data = {
      newcoin: symbol
    }
    await axios({
      method: 'post',
      url: `${config.apiUrl}/toCheckCoinVisible`,
      // headers: { "Authorization": this.loginData.message },
      data: data
    })
      .then(async result => {
        if (result.data.success === true) {

          this.setState({
            isTimerModalOpen: true,
            opening_date: result.data.response.opening_date,
            Comingsymbol: result.data.response.symbol
          })

        }

        else if (result.data.success === false) {
          this.setState({
            isTimerModalOpen: false
          })
          // <Link to={`${config.baseUrl}Exchange/${item.symbol == 'USDT' ? 'BTCUSDT' : `${item.symbol}`}`} className="action_anchore">Trade</Link>
          this.props.history.push(`${config.baseUrl}Exchange/${symbol == 'USDT' ? 'BTCUSDT' : `${symbol}`}`);

        }
      })

      .catch(err => {
        this.setState({
          isTimerModalOpen: false
        })
      })
    // }
  }

  closeISTimerModal = (e) => {
    this.setState({ isTimerModalOpen: false })

  }

  CountdownTimer({ days, hours, minutes, seconds, completed }) {
    if (completed) {
      // Render a completed state
      return "Starting";
    } else {
      // Render a countdowns
      var dayPrint = (days > 0) ? days + ' d' : '';

      return <span>{dayPrint} {zeroPad(hours)} h {zeroPad(minutes)} m {zeroPad(seconds)} s</span>;
    }
  };

  getTimeOfStartDate(dateTime) {
    var date = new Date(dateTime); // some mock date
    var milliseconds = date.getTime();
    return milliseconds;
  }

  getTimeOfStartDate(dateTime) {
    var date = new Date(dateTime); // some mock date
    var milliseconds = date.getTime();
    return milliseconds;
  }

  onChangeTransfer = (e) => {

    if (e.target.name == 'type' && e.target.value) {
      const filter = this.state.allplatinxtransferHistory.filter((item) => item.Type == e.target.value)
      this.setState({ platinxtransferHistory: filter })
    }
    else if (e.target.name == 'selectcoin' && e.target.value) {
      const filter = this.state.allplatinxtransferHistory.filter((item) => item.symbol == e.target.value)
      this.setState({ platinxtransferHistory: filter })
    }else{
      this.setState({ platinxtransferHistory:  this.state.allplatinxtransferHistory })
    }

  }
  render() {

    return (

      <>
        <Header />

        <ToastContainer />
        <div class="container pt-4">
          <h1 className="History headerMarginWallet">
            <div className="row fund_row mb-2">
              <div className="col-md-8">
                <h4>FUNDS AND TRANSFERS</h4>
              </div>
              <div className="col-md-4 text-right d-flex justify-content-end">
                {this.state.loader == false ? <button onClick={e => this.refreshWallet()} className="mr-2"><img src='img/refresh_icon.png' className='refresh_icon mb-1' /></button> : ""}
                <button className='btn btn-sm btn-primary' onClick={e => window.location.replace(`${config.baseUrl}transfer`)}>Send crypto to Best In Coins User</button>

              </div>

            </div>
            <div className='row fund_row'>
              <div className='col-sm-12'>
                <Tabs>
                  <TabList >
                    <div className='row'>
                      <div className='col-lg-6 col-md-6'>

                        <Tab onClick={e => this.checkTab(e, 1)}>Wallet</Tab>
                        <Tab onClick={e => this.checkTab(e, 2)}>Deposit/Withdraw History</Tab>
                        <Tab onClick={e => this.checkTab(e, 3)}>Transfer History</Tab>
                      </div>

                      <div className='col-lg-4 col-md-4'>
                        {(this.state.loader == false && this.state.switch_loader == false && this.state.tabId == 1) ? <div className='row'>
                          <div className='row'>
                            <div className='col-md-4 col-lg-4 '>
                              <label class="switch">
                                <input type="checkbox" onChange={e => this.switchChange(e)} />
                                <span class="slider round"></span>

                              </label>
                              <span className='Hide_Zero_account mt-3'>Hide Zero Balance</span></div>
                            <div className='col-md-2 col-lg-2 '>
                              <input className='wallet_search' type='text' placeholder='Search' onChange={e => this.searchFilter(e)} />
                            </div>
                          </div>
                        </div>
                          : ''}
                        {(this.state.tabId == 2) ?
                          <div className="col-lg-12 col-md-4">
                            <div className='row'>
                              <div className="col-lg-6 col-md-6"><div className="form-group">
                                <select className="form-select" aria-label="Default select example" onChange={e => this.onChange(e)} name="selectcoin" >
                                  <option selected value="">All</option>
                                  {this.state.coinList.map(item => (

                                    <option value={item.symbol}>{item.symbol}</option>

                                  ))}

                                  <i classname="fa fa-chevron-down"></i>
                                </select>
                              </div>
                              </div>
                              <div className="col-lg-6 col-md-6"><div className="form-group">
                                <select className="form-select" aria-label="Default select example" onChange={e => this.onChange(e)} name="order_type" >
                                  <option selected value="">All</option>
                                  <option value="Deposit">Deposit </option>
                                  <option value="Withdraw">Withdraw </option>

                                  <i classname="fa fa-chevron-down"></i>
                                </select>
                              </div>
                              </div>
                            </div>
                          </div> : ''}
                        {(this.state.tabId == 3) ?
                          <div className="col-lg-12 col-md-4">
                            <div className='row'>
                              <div className="col-lg-6 col-md-6"><div className="form-group">
                                <select className="form-select" aria-label="Default select example" onChange={e => this.onChangeTransfer(e)} name="selectcoin" >
                                  <option selected value="">All</option>
                                  {this.state.coinList.map(item => (

                                    <option value={item.symbol}>{item.symbol}</option>

                                  ))}

                                  <i classname="fa fa-chevron-down"></i>
                                </select>
                              </div>
                              </div>
                              <div className="col-lg-6 col-md-6"><div className="form-group">
                                <select className="form-select" aria-label="Default select example" onChange={e => this.onChangeTransfer(e)} name="type" >
                                  <option selected value="">All</option>
                                  <option value="Send">Send </option>
                                  <option value="Receive">Receive </option>

                                  <i classname="fa fa-chevron-down"></i>
                                </select>
                              </div>
                              </div>
                            </div>
                          </div> : ''}
                      </div>
                      {(this.state.tabId == 2) ?
                        <div className="col-lg-2 col-md-2">
                          <div className="form-group">
                            <button class="btn btn-primary " type='button' onClick={e => this.downloadCSVFromJson('transaction.csv', this.state.getTxList)} style={{ fontSize: "15px", padding: "7px 2px" }}><i class="fa fa-download"></i> Download</button>
                          </div></div> : ""}

                      {this.state.tabId == 1 ? <div className='col-lg-2 text-right'>
                        <div class="funds-portfolio">
                          <span class="funds-portfolio-title">Estimated Portfolio</span>
                          <span class="funds-portfolio-value" data-private="true">  {(this.state.TotalBalanceIUSD > 0 && this.state.TotalBalanceIUSD != '') ?
                            'USDT ' + parseFloat(this.state.TotalBalanceIUSD).toFixed(2) :
                            this.state.TotalBalanceIUSD == '0' ?
                              "$0" :
                              'Loading...'}</span>
                        </div>
                      </div> : ""}


                    </div>
                  </TabList>

                  <TabPanel>
                    <div class="container withdraw-history pl-0 pr-0">
                      <table class="table table-striped table-responsive-sm mt-0">
                        <thead>
                          <tr style={{ paddingBottom: "10" }}>
                            <th className="pl-5" scope="col">Coin</th>
                            <th scope="col">Available</th>
                            <th scope="col">In Order</th>
                            <th scope="col">Total</th>



                            <th scope="col" >Action</th>
                            <th scope="col"></th>

                            <th scope="col"></th>



                          </tr>
                        </thead>

                        {this.state.loader == false ? <tbody>
                          {this.state.getWalletList.map(item => (
                            <tr>

                              <th scope="row">
                                <div className="row">
                                  <div className="col-2 col-md-2">
                                    <img src={`${config.imageUrl}${item.icon}`} className="cryto_icons" />
                                  </div>
                                  <div className="col-8 col-md-8">
                                    <h4>{item.symbol}</h4>
                                    <p>{item.name}</p>
                                  </div>
                                </div>
                              </th>
                              <td>{parseFloat(item.balance).toFixed(6)}</td>
                              <td>{parseFloat(item.balanceInOrder).toFixed(6)}</td>


                              <td>{(parseFloat(parseFloat(item.balance)+parseFloat(item.balanceInOrder))).toFixed(6)}</td>
                              {item.is_deposit == 1 && this.state.userKYC.is_kyc_verify === "1" ? <td><Link to={item.symbol == 'INR' ? `${config.baseUrl}depositform` : `${config.baseUrl}depositcrypto/${item.symbol}`} className="action_anchore"><button className='btn btn-primary'>Deposit</button></Link></td> : <td> <button className='btn btn-danger' title={item.is_deposit === 0 ? 'Permission Disabled' : 'Please Complete Your KYC'}><i class="fa fa-lock" aria-hidden="true"></i></button></td>}
                              {item.is_tradable == 1 ? <td><button className='btn btn-primary' onClick={e => this.getToCheckCoinVisible(item.symbol)}>Trade</button></td> : <td> <button className='btn btn-danger' title={'Permission Disabled'}><i class="fa fa-lock" aria-hidden="true"></i></button></td>}
                              {item.is_withdraw == 1 ? <td><Link to={item.symbol == 'INR' ? `${config.baseUrl}withdraw` : `${config.baseUrl}withdrawcrypto/${item.symbol}`} className="action_anchore"><button className='btn btn-primary'>Withdraw</button></Link></td> : <td> <button className='btn btn-danger'><i class="fa fa-lock" title={'Permission Disabled'} aria-hidden="true"></i></button> </td>}
                            </tr>
                          ))}

                        </tbody> : <div className="text-center p-5 "><Loader
                          className='assets-spiner'
                          type="TailSpin"
                          color="#2565c7"
                          height={100}
                          width={100}
                        /></div>}
                      </table>
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <div class="container withdraw-history pl-0 pr-0">
                      <table class="table table-striped table-responsive-sm mt-0">
                        <thead>
                          <tr style={{ paddingBottom: "10" }}>
                            <th scope="col">Type</th>
                            <th scope="col">Amount</th>
                            <th scope="col">USDT Value</th>
                            <th scope="col">Symbol</th>
                            <th scope="col">Date/Time</th>
                            <th scope="col">Status</th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {this.state.getTxList.map(item => (
                            <tr>

                              <td className={(item.trx_type_name == 'Deposit') ? 'crypt-up' : 'crypt-down'}>{item.trx_type_name}</td>
                              <td>{parseFloat(item.amount).toFixed(12)}</td>
                              <td>{parseFloat(item.usd_amount).toFixed(6)}</td>
                              <td>{item.symbol}</td>
                              <td>{moment(item.datetime).format('lll')}</td>
                              <td className={item.status == 'Pending' ? 'yellow-color-class' : item.status == 'Completed' ? 'green-color-class' : 'red-color-class'}>{item.status}</td>
                              {item.status == 'Pending'
                                ?
                                <td>  <button className='btn btn-primary reject' onClick={e => this.updateRejectAPI(e, item)}>Reject</button> </td>
                                : <td></td>}
                            </tr>
                          ))}

                        </tbody>
                      </table>
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <div class="container withdraw-history pl-0 pr-0">
                      <table class="table table-striped table-responsive-sm mt-0">
                        <thead>
                          <tr style={{ paddingBottom: "10" }}>
                            <th className="pl-5" scope="col">from</th>
                            <th className="pl-5" scope="col">to</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Coin</th>
                            <th scope="col">Date</th>
                            <th scope="col">Type</th>
                          </tr>
                        </thead>

                        <tbody>
                          {this.state.platinxtransferHistory.map(item => (
                            <tr>

                              <td>{item.userfrom}</td>
                              <td>{item.userto}</td>
                              <td>{parseFloat(item.amount).toFixed(12)}</td>
                              <td>{item.symbol}</td>
                              <td>{moment(item.date).format('YYYY-MM-DD')}</td>
                              <td className={item.Type == 'Send' ? 'crypt-down' : 'crypt-up'}>{item.Type}</td>

                            </tr>
                          ))}

                        </tbody>
                      </table>
                    </div>
                  </TabPanel>
                </Tabs>

              </div>

            </div>

          </h1>
        </div>
        <Modal
          isOpen={this.state.isTimerModalOpen}
          onRequestClose={e => this.closeISTimerModal(e)}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <button className='btn_close-TIMER' onClick={e => this.closeISTimerModal(e)} style={{ float: 'right' }}>X</button>
          <div className=' time-modal'>
            <div className='row'>
              <div className='col-md-12'>
                <div className='timing_container'>
                  <h2>Comming Soon !!</h2>
                  <h5>The Coin <strong>{this.state.Comingsymbol}</strong>  Available for trade !!</h5>
                  <div className='timer'>

                    <Countdown
                      date={this.getTimeOfStartDate(this.state.opening_date)}
                      renderer={this.CountdownTimer}

                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <Footer />

      </>
    )
  }
}
