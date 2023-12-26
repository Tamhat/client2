import React, { Component } from 'react';
import Header from '../../directives/header'
import Footer from '../../directives/footer'
import axios from 'axios'
import config from '../../config/config'
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Loader from "react-loader-spinner";


import copy from 'copy-to-clipboard';
var QRCode = require('qrcode.react');



const headers = {
    'Content-Type': 'application/json'
};
export default class deposit extends Component {

    constructor(props) {
        super(props)

        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
        const { match: { params } } = this.props;
        this.coin_symbol = params.coin_id
        this.state = {
            getWalletList: [],
            selectWithdrawWallet: [],
            selectWalletType: [],
            selectedAddress: '',
            user_id: this.loginData.data?.id,
            coin_id: '',
            balance: 0,
            trx_type: 1,
            loader: false,
            trx_fee: 0.00,
            withdrawaddress: ''
        }
        this.walletSubmit = this.walletSubmit.bind(this)
        this.onChange = this.onChange.bind(this)

    }

    componentDidMount() {
        this.walletList()
    }

    chainonChange(e) {

        if (e.target.value == 0 || e.target.value == 1) {
            var address = this.state?.selectWithdrawWallet.public_key
        }
        else if (e.target.value == 2) {
            var address = this.state?.selectWithdrawWallet.bnb_publickey
        } else {
            var address = this.state?.selectWithdrawWallet.trc_publickey
        }

        this.setState({
            selectedAddress: address
        })
    }
    onChange(e) {

        this.setState({
            [e.target.name]: e.target.value
        })

        if (e.target.name === 'coin_id') {
            const wallet = this.state.getWalletList[e.target.value]
            let wallettypes = []
            if (['ETH', 'TRX', 'BTC', 'XRP', 'BCH', 'LTC', 'BNB'].includes(wallet.symbol)) {
                wallettypes.push({ label: 'Main-net', value: 0 })
            }
            if (wallet.contract !== null && wallet.Bnb_contract !== null && wallet.Trc_contract !== null) {
                wallettypes.push({ label: 'ERC-20', value: 1 }, { label: 'BEP-20', value: 2 }, { label: 'TRC-20', value: 3 })
            }
            else if (wallet.contract !== null && wallet.Bnb_contract !== null && wallet.Trc_contract == null) {
                wallettypes.push({ label: 'ERC-20', value: 1 }, { label: 'BEP-20', value: 2 })
            }
            else if (wallet.contract !== null && wallet.Bnb_contract == null && wallet.Trc_contract !== null) {
                wallettypes.push({ label: 'ERC-20', value: 1 }, { label: 'TRC-20', value: 3 })
            }
            else if (wallet.contract == null && wallet.Bnb_contract !== null && wallet.Trc_contract !== null) {
                wallettypes.push({ label: 'BEP-20', value: 2 }, { label: 'TRC-20', value: 3 })
            }
            else if (wallet.contract !== null && wallet.Bnb_contract == null && wallet.Trc_contract == null) {
                wallettypes.push({ label: 'ERC-20', value: 1 })
            }
            else if (wallet.contract == null && wallet.Bnb_contract !== null && wallet.Trc_contract == null) {
                wallettypes.push({ label: 'BEP-20', value: 2 })
            }
            else if (wallet.contract == null && wallet.Bnb_contract == null && wallet.Trc_contract !== null) {
                wallettypes.push({ label: 'TRC-20', value: 3 })
            }



            if (wallettypes.length > 0 && wallettypes[0].value == 3) {
                var address = this.state.getWalletList[e.target.value].trc_publickey
            } else if (wallettypes.length > 0 && wallettypes[0].value == 0) {
                var address = this.state.getWalletList[e.target.value].public_key
            }
            else if (wallettypes.length > 0 && wallettypes[0].value == 2) {
                var address = this.state.getWalletList[e.target.value].bnb_publickey
            }
            else {
                var address = this.state.getWalletList[e.target.value].public_key
            }

            this.setState({
                selectWithdrawWallet: this.state.getWalletList[e.target.value],
                selectWalletType: wallettypes,
                selectedAddress: address
            })
        }
    }

    async walletList() {
        this.setState({ loader: true })
        await axios({
            method: 'post',
            headers: { "Authorization": this.loginData?.Token },
            url: `${config.apiUrl}/userwallet` + '?nocache=' + new Date().getTime(),
            data: { 'user_id': this.loginData.data?.id,"email": this.loginData?.data.user_email }
        })
            .then(result => {
                if (result.data.success === true) {

                    var selectCooin = result.data.response.findIndex(i => i.symbol == this.coin_symbol);
                    console.log('selectCooin',selectCooin)
                    if (selectCooin < 0) {
                        selectCooin = 0;
                    }
                    let selectedcoinWallet = result.data.response[selectCooin]
                    let wallettypes = []

                    if (['ETH', 'TRX', 'BTC', 'XRP', 'BCH', 'LTC', 'BNB'].includes(selectedcoinWallet.symbol)) {
                        wallettypes = [{ label: 'Main-net', value: 0 }]
                    }

                    if (selectedcoinWallet.contract !== null && selectedcoinWallet.Bnb_contract !== null && selectedcoinWallet.Trc_contract !== null) {
                        wallettypes.push({ label: 'ERC-20', value: 1 }, { label: 'BEP-20', value: 2 }, { label: 'TRC-20', value: 3 })
                    }
                    else if (selectedcoinWallet.contract !== null && selectedcoinWallet.Bnb_contract !== null && selectedcoinWallet.Trc_contract == null) {
                        wallettypes.push({ label: 'ERC-20', value: 1 }, { label: 'BEP-20', value: 2 })
                    }
                    else if (selectedcoinWallet.contract !== null && selectedcoinWallet.Bnb_contract == null && selectedcoinWallet.Trc_contract !== null) {
                        wallettypes.push({ label: 'ERC-20', value: 1 }, { label: 'TRC-20', value: 3 })
                    }
                    else if (selectedcoinWallet.contract == null && selectedcoinWallet.Bnb_contract !== null && selectedcoinWallet.Trc_contract !== null) {
                        wallettypes.push({ label: 'BEP-20', value: 2 }, { label: 'TRC-20', value: 3 })
                    }
                    else if (selectedcoinWallet.contract !== null && selectedcoinWallet.Bnb_contract == null && selectedcoinWallet.Trc_contract == null) {
                        wallettypes.push({ label: 'ERC-20', value: 1 })
                    }
                    else if (selectedcoinWallet.contract == null && selectedcoinWallet.Bnb_contract !== null && selectedcoinWallet.Trc_contract == null) {
                        wallettypes.push({ label: 'BEP-20', value: 2 })
                    }
                    else if (selectedcoinWallet.contract == null && selectedcoinWallet.Bnb_contract == null && selectedcoinWallet.Trc_contract !== null) {
                        wallettypes.push({ label: 'TRC-20', value: 3 })
                    }
                    // console.log('wallettypes', wallettypes)


                    if (wallettypes.length > 0 && wallettypes[0].value == 3) {
                        var address = selectedcoinWallet.trc_publickey
                    } else if (wallettypes.length > 0 && wallettypes[0].value == 0) {
                        var address = selectedcoinWallet.public_key
                    }
                    else if (wallettypes.length > 0 && wallettypes[0].value == 2) {
                        var address = selectedcoinWallet.bnb_publickey
                    }
                    else {
                        var address = selectedcoinWallet.public_key
                    }


                    this.setState({
                        getWalletList: result.data.response,
                        selectWithdrawWallet: result.data.response[selectCooin],
                        selectWalletType: wallettypes,
                        selectedAddress: address
                    })

                    this.setState({ loader: false })

                }

                else if (result.data.success === false) {
                    toast.error(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                    this.setState({ loader: false })
                }
            })

            .catch(err => {

                toast.error(err.result?.data?.msg, {
                    position: toast.POSITION.TOP_CENTER
                })
                this.setState({ loader: false })
            })

    }

    //===================================   withdraw   ====================

    async walletSubmit() {
        this.state.coin_id = this.state.selectWithdrawWallet.coin_id
        await axios({
            method: 'post',
            url: `${config.apiUrl}/userwithdraw` + '?nocache=' + new Date().getTime(),
            data: this.state
        })
            .then(result => {
                if (result.data.success === true) {

                    toast.success(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                    this.setState({
                        balance: '',
                        withdrawaddress: ''
                    })
                    this.walletList()
                }

                else if (result.data.success === false) {
                    toast.error(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                }
            })

            .catch(err => {
                if (err.request) { } if (err.response) {
                    toast.error(err.response.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                }
            });

    }

    copyToClipboard(id) {
        copy(id);

        toast.success("Copied", {
            position: toast.POSITION.TOP_CENTER
        });


    }

    render() {
        // console.log('selectWithdrawWallet',this.state.selectWithdrawWallet)
        return (
            <>

                <Header />
                <ToastContainer />


                <div className="container">
                    <div className="row">
                        <h1 className="History headerMarginWallet">Deposit</h1>
                    </div>
                    <div className="row sm-gutters">

                        {this.state.loader == false ?
                            <div className="col-lg-12 p-0">
                                <div className="withdraw-panel">
                                   
                                    <div className="row">
                                        <div className="col-12 col-md-6">
                                            <div className="coin-panel">
                                                <div className="mt-3 mb-2">
                                                    <label for="exampleInputEmail1" className="form-label">Select Currency</label>
                                                    <select className="form-select" id="email"
                                                        onChange={this.onChange}
                                                        aria-label="Default select example" name="coin_id">
                                                        {this.state.getWalletList.map((item, i) => (
                                                            (this.state.selectWithdrawWallet.symbol == item.symbol) ?
                                                                <option value={i} selected={true}>{item.symbol}</option>
                                                                :
                                                                <option value={i} selected={false}>{item.symbol}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {this.state.selectWalletType.length > 0 ? <div className="mt-3 mb-2">
                                                    <label for="exampleInputEmail1" className="form-label">Select Chain</label>
                                                    <select className="form-select" id="email"
                                                        onChange={e => this.chainonChange(e)}
                                                        aria-label="Default select example" name="coin_id">
                                                        {this.state.selectWalletType.map((item, i) => (
                                                            (this.state.selectWalletType[0].label == item.label) ?
                                                                <option value={item.value} selected={true}>{item.label}</option>
                                                                :
                                                                <option value={item.value} selected={false}>{item.label}</option>
                                                        ))}
                                                    </select>
                                                </div> : ''}

                                                <h6 style={{ display: "flex" }}><p className="balance_coin">Total Balance : </p>{parseFloat(this.state.selectWithdrawWallet.balance).toFixed(6)} {this.state.selectWithdrawWallet.symbol}</h6 >
                                                <div class="withdraw_notice">
                                                    <h4><i class="fas fa-lightbulb-on"></i>Deposit Notice</h4>
                                                    <p>1. If you have deposited, please pay attention to the text messages, site letters and emails we send to you.</p>
                                                    <p>2. Coins will be deposited after 1 network confirmations.</p>
                                                    <p>3. Until 2 confirmations are made, an equivalent amount of your assets will be temporarily unavailable for withdrawals.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-6 d-flex justify-content-center align-items-center">
                                            {this.state?.selectWithdrawWallet?.is_deposit == 1 ? <div class="address_panel">
                                                <div className="deposit-qr-code">
                                                    <QRCode value={`${this.state?.selectedAddress}`} />
                                                </div>
                                                <form action="" class="text-left">
                                                    <label for="email" style={{ color: '#fff' }}>Address</label>
                                                    <input type="text" id="wallet_id" name="text" value={this.state?.selectedAddress} placeholder="Address" />
                                                    <span className="deposit-copy-btn">
                                                        <i onClick={this.copyToClipboard.bind(this, this.state?.selectedAddress)} class="far fa-copy" style={{ float: 'right', cursor: 'pointer' }}></i>
                                                    </span>
                                                  
                                                    <h5>Send only {this.state?.selectWithdrawWallet?.symbol} to this deposit address.</h5>
                                                    <p>Sending coin or token other than {this.state?.selectWithdrawWallet?.symbol} to this address may result in the loss of your deposit.</p>


                                                </form>


                                            </div> : <form action="" class="text-left"> <label for="email" style={{ color: '#fff' }}>Currently Deposit Disabled</label> </form>}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="crypt-market-status" style={{ display: 'none' }}>
                                        <div>

                                            {/* <!-- Nav tabs --> */}
                                            <ul className="nav nav-tabs" >
                                                <li role="presentation"><a href="#closed-orders" className="active" data-toggle="tab">Recent Withdrawal History</a></li>
                                                <li role="presentation"><a href="#active-orders" data-toggle="tab">Withdrawal Error Message</a></li>

                                            </ul>


                                            {/* <!-- Tab panes --> */}
                                            <div className="tab-content">
                                                <div role="tabpanel" className="tab-pane active" id="closed-orders">
                                                    <div className="row sm-gutters">
                                                        <div className="col-12 col-sm-12 col-md-12">
                                                            <div className="crypt-market-status mt-4">
                                                                <div>


                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <table className="table table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th scope="col">Coin</th>
                                                                <th scope="col">Status</th>
                                                                <th scope="col">Amount</th>
                                                                <th scope="col">Date</th>
                                                                <th scope="col">Information</th>

                                                            </tr>
                                                        </thead>
                                                    </table>
                                                    <div className="no-orders text-center p-160"><img src="images/empty.svg" alt="no-orders" /></div>
                                                </div>
                                                <div role="tabpanel" className="tab-pane" id="active-orders">
                                                    <div className="crypt-market-status mt-4">
                                                        <div>


                                                        </div>
                                                    </div>
                                                    <table className="table table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th scope="col">Date</th>
                                                                <th scope="col">Coin</th>
                                                                <th scope="col">Amount</th>
                                                                <th scope="col">Error Message</th>

                                                            </tr>
                                                        </thead>
                                                    </table>
                                                    <div className="no-orders text-center p-160"><img src="images/empty.svg" alt="no-orders" /></div>
                                                </div>


                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div> : <Loader
                                className='assets-spiner'
                                type="TailSpin"
                                color="#2565c7"
                                height={100}
                                width={100}
                            />}
                    </div>
                </div>
                <br /><br />

                <Footer />
                {/* <!-- Modal --> */}
            </>
        )
    }
}