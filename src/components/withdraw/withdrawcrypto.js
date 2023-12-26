import React, { Component } from 'react';
import Header from '../../directives/header'
import Footer from '../../directives/footer'

import axios from 'axios'
import config from '../../config/config'
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

import Modal from 'react-modal';
import Loader from "react-loader-spinner";
const headers = {
    'Content-Type': 'application/json'
};

const modalcustomStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};
export default class withdraw extends Component {

    constructor(props) {
        super(props)

        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
        const { match: { params } } = this.props;
        this.coin_symbol = params.coin_id
        this.state = {
            errorMsg: "",
            errorMsg1: "",
            email_success_msg: '',
            email_err_msg: '',
            modalOpen: false,
            email_otp: '',
            loader: false,
            getWalletList: [],
            selectWalletType: [],
            withdrawtype: 0,
            selectWithdrawWallet: [],
            user_id: this.loginData.data?.id,
            "email": this.loginData?.data.user_email,
            coin_id: '',
            balance: 0,
            trx_type: 1,
            trx_fee: 0.00,
            to_address: ''
        }

        this.onChange = this.onChange.bind(this)

    }

    componentDidMount() {
        this.walletList()
        this.getFees()
    }

    getFees = async e => {
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }

        await axios.get(`${config.apiUrl}/getfees`, { headers: headers })
            .then(result => {

                if (result.data.success === true) {
                    this.setState({
                        withdraw_Fee_Percentage: result.data.response[3].fee_percentage,
                    })

                }
            })
    }

    chainonChange(e) {

        this.setState({
            withdrawtype: e.target.value
        })
    }


    onChange(e) {

        this.setState({
            [e.target.name]: e.target.value,
        })

        setTimeout(() => {

            if (e.target.name === 'coin_id') {
                const wallet = this.state.getWalletList.find(item => item.id == e.target.value)
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
             
                if (wallettypes.length > 0) {
                    var withdrawtype = wallettypes[0].value
                }
                else {
                    var withdrawtype = 0
                }

                this.setState({
                    selectWithdrawWallet: this.state.getWalletList.find(item => item.id == e.target.value),
                    selectWalletType: wallettypes,
                    withdrawtype: withdrawtype,

                })
            }
        }, 100);

    }

    async walletList() {
        this.setState({ loader: true })
        await axios({
            method: 'post',
            url: `${config.apiUrl}/userwallet`,
            headers: { "Authorization": this.loginData?.Token },
            data: { 'user_id': this.loginData.data?.id , "email": this.loginData?.data?.user_email}
        })
            .then(result => {
                if (result.data.success === true) {

                    var selectCooin = result.data.response.findIndex(i => i.symbol == this.coin_symbol);
                    if (selectCooin < 0) {
                        selectCooin = 0;
                    }
                    let selectedcoinWallet = result.data.response[selectCooin]
                    let wallettypes = []
                    if (['ETH', 'TRX', 'BTC'].includes(selectedcoinWallet.symbol)) {
                        wallettypes.push({ label: 'Main-net', value: 0 })
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

                    if (wallettypes.length > 0) {
                        var withdrawtype = wallettypes[0].value
                    }
                    else {
                        var withdrawtype = 0
                    }

                    this.setState({
                        getWalletList: result.data.response,
                        withdrawtype: withdrawtype,
                        selectWalletType: wallettypes,
                        selectWithdrawWallet: result.data.response[selectCooin],
                        coin_id: result.data.response[selectCooin].id
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

    async withdrawSubmit(e) {
        e.preventDefault()

        await axios({
            method: 'post',
            headers: { "Authorization": this.loginData?.Token },
            url: `${config.apiUrl}/cryptowithdraw` + '?nocache=' + new Date().getTime(),
            data: {
                coin_id: this.state.coin_id,
                balance: this.state.balance,
                withdrawtype: this.state.withdrawtype,
                'user_id': this.loginData.data?.id,
                "to_address": this.state.to_address,
                "email": this.loginData?.data.user_email,
            }
        })
            .then(result => {
                if (result.data.success === true) {
                    this.setState({ modalOpen: false, balance: 0, to_address: '', email_otp: '', email_success_msg: '', email_err_msg: '' })

                    toast.success(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });

                    this.walletList()
                }

                else if (result.data.success === false) {
                    console.log('false')
                    toast.error(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                    this.setState({ modalOpen: false, balance: 0, to_address: '', email_otp: '', email_success_msg: '', email_err_msg: '' })
                }
            })

            .catch(err => {
                if (err.request) { } if (err.response) {
                    console.log('error')
                    toast.error(err.response.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                    this.setState({ modalOpen: false, balance: 0, to_address: '', email_otp: '', email_success_msg: '', email_err_msg: '' })
                }
            });

    }


    async finalSubmit(e) {
        e.preventDefault()
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }

        axios.post(`${config.apiUrl}/withdrawAuthentication`, { email: this.loginData.data?.user_email, 'user_id': this.loginData.data?.id, email_otp: this.state.email_otp, type: 'check_otp' }, { headers: headers })
            .then(async result => {

                if (result.data.success === true) {

                    this.withdrawSubmit(e)
                } else if (result.data.success == false) {
                    this.setState({ email_err_msg: result.data.msg, email_success_msg: '' })
                    // email_success_msg
                }

            }).catch(err => {

                if (err == 'Error: Request failed with status code 403') {
                    toast.error("session expired please re-login", {
                        position: toast.POSITION.TOP_CENTER
                    });
                } else {
                    console.log(err)
                    toast.error(err.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                }

            })


    }

    async modalOpencheck(e, type) {

        e.preventDefault();

        this.setState({
            errorMsg: ""
        })

        await axios({
            method: 'POST',
            url: `${config.apiUrl}/cryptowithdrawvalidation`,
            headers: { "Authorization": this.loginData?.Token },
            data: {
                'user_id': this.loginData.data?.id,
                "email": this.loginData?.data.user_email,
                'coin_id': this.state.coin_id,
                'balance': this.state.balance
            }
        })
            .then(async result => {
                if (result.data.success === true) {
                    this.setState({ modalOpen: false, email_otp: '', email_success_msg: '', email_err_msg: '' })
                    this.requestFunction(e, type)
                }

            })
            .catch(err => {
                this.setState({ modalOpen: false, email_otp: '', email_success_msg: '', email_err_msg: '' })
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                } else {
                    toast.error(err.response.data?.msg, {
                        position: toast.POSITION.TOP_CENTER
                    })

                }
            });

    }

    requestFunction(e, type) {
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }
        axios.post(`${config.apiUrl}/withdrawAuthentication`, { email: this.loginData.data?.user_email, 'user_id': this.loginData.data?.id, type: 'send_otp' }, { headers: headers })
            .then(async result => {

                if (result.data.success === true) {
                    this.setState({ modalOpen: true })
                
                    if (type == 'resend') {
                        this.setState({
                            email_success_msg: 'We have resend varification code on your e-mail please check!!',
                            email_err_msg: ''
                        })
                    } else {
                        this.setState({
                            email_success_msg: result.data.msg,
                            email_err_msg: ''
                        })
                    }

                } else if (result.data.success == false) {
                    toast.error(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                    this.setState({ email_err_msg: result.data.msg, email_success_msg: '' })
                    // email_success_msg
                }

            }).catch(err => {

                if (err == 'Error: Request failed with status code 403') {
                    toast.error("session expired please re-login", {
                        position: toast.POSITION.TOP_CENTER
                    });
                }else {
                    console.log(err)
                    toast.error(err.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                }

            })
    }

    handleChange(e) {
        const { name, value } = e.target
        const re = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
        if (name == 'email_otp') {
            if (re.test(value) || value == '') {
                this.setState(old => {
                    return { ...old, [name]: value }
                })
            }
        } else {
            this.setState(old => {
                return { ...old, [name]: value }
            })
        }

    }

    render() {

        return (
            <>

                <Header />
                <div className="container">
                    <ToastContainer />
                    <div className="row">
                        <h1 className="History headerMarginWallet">Withdraw</h1>
                    </div>
                    <div className="row sm-gutters">

                        {this.state.loader == false ? <div className="col-lg-12 p-0">
                            <div className="withdraw-panel">
                                {/* <h6>Select Currency</h6> */}
                                <div className="row">
                                    <div className="col-12 col-md-6">
                                        <div className="coin-panel">
                                            <div className="mt-3 mb-2">
                                                <label for="exampleInputEmail1" className="form-label">Select Currency</label>
                                                <select className="form-select" id="email"
                                                    onChange={e => this.onChange(e)}
                                                    aria-label="Default select example" name="coin_id">
                                                    {this.state.getWalletList.map((item, i) => (
                                                        (this.state.selectWithdrawWallet.symbol == item.symbol) ?
                                                            <option value={item.coin_id} selected={true}>{item.symbol}</option>
                                                            :
                                                            <option value={item.coin_id} selected={false}>{item.symbol}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {this.state?.selectWalletType.length > 0 ? <div className="mt-3 mb-2">
                                                <label for="exampleInputEmail1" className="form-label">Select Chain</label>
                                                <select className="form-select" id="email"
                                                    onChange={e => this.chainonChange(e)}
                                                    aria-label="Default select example" name="coin_id">
                                                    {this.state.selectWalletType.map((item, i) => (
                                                     
                                                        (this.state.selectWalletType[0].value == item.value) ?
                                                            <option value={item.value} selected={true}>{item.label}</option>
                                                            :
                                                            <option value={item.value} selected={false}>{item.label}</option>
                                                    ))}
                                                </select>
                                            </div> : ''}
                                            <h6 style={{ display: "flex" }}><p className="balance_coin">Available Balance : </p>  {parseFloat(this.state.selectWithdrawWallet.balance).toFixed(6)} {this.state.selectWithdrawWallet.symbol}</h6 >
                                            <div className="withdraw_notice">
                                                <h4><i className="fas fa-lightbulb-on"></i>Withdraw Notice</h4>
                                                <p>1. Funds can only been withdrawn from your account.

                                                </p>
                                                <p>3. Do not withdraw directly to a crowdfund or ICO address, as your account will not be credited with tokens from such sales.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                                        {this.state?.selectWithdrawWallet?.is_withdraw == 1 ? <div className="address_panel">
                                            <form action="" className="text-left m-3">
                                                <label for="email" style={{ color: "#fff" }}>Recipient's {this.state.selectWithdrawWallet.symbol} Address</label>
                                                <input type="text" id="email" placeholder="Address" name="to_address" onChange={this.onChange}
                                                    value={this.state.to_address} />
                                            </form>

                                            <form action="" className="text-left m-3">
                                                <label for="email" style={{ color: "#fff" }}>Amount</label>
                                                <input type="number" id="email" name="balance" onChange={this.onChange}
                                                    value={this.state.balance} placeholder="Amount" />
                                                <p style={{ textAlign: "left" }}>Available: {parseFloat(this.state.selectWithdrawWallet.balance).toFixed(6)} {this.state.selectWithdrawWallet.symbol}</p>
                                                <p style={{ textAlign: "right" }}>Network Fee : {parseFloat(this.state.selectWithdrawWallet.withdraw_fee).toFixed(6)} {this.state.selectWithdrawWallet.symbol}</p>
                                                <p style={{ textAlign: "right" }}>The receiver will get :  {(parseFloat(this.state.balance).toFixed(6)) - (parseFloat(this.state.selectWithdrawWallet.withdraw_fee).toFixed(6))} {this.state.selectWithdrawWallet.symbol}</p>

                                            </form>
                                            <button type="submit" disabled={!this.state.to_address || !this.state.balance} onClick={e => this.modalOpencheck(e)} className="save-setup btn btn-primary">Withdraw</button>

                                        </div> : <form action="" class="text-left"> <label for="email" style={{ color: '#fff' }}>Currently Withdraw Disabled</label> </form>}
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

                <div>
                    <Modal
                        isOpen={this.state.modalOpen}
                        onRequestClose={e => this.setState({ modalOpen: false })}
                        style={modalcustomStyles}
                        contentLabel="Example Modal"
                    >
                        <div class="modal-content" style={{ backgroundColor: '#242e3e' }}>
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLongTitle">Email Verification</h5>
                                <button type="button" style={{ color: 'rgb(42 118 135)' }} class="close" onClick={e => this.setState({ modalOpen: false })} data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="table-responsive pl-5 pr-5">
                                <form onSubmit={e => this.finalSubmit(e)} className="text-left">
                                    <label for="email">Enter Code</label>
                                    <input type="text" id="email" name="email_otp" placeholder="Your Code" onChange={e => this.handleChange(e)} value={this.state.email_otp} />
                                    <p style={{ textAlign: 'left', color: 'rgb(218 150 1)' }}   >{this.state.email_success_msg} </p>
                                    <p style={{ textAlign: 'left', color: 'red' }}>{this.state.email_err_msg}</p>
                                    <span onClick={e => this.modalOpencheck(e, 'resend')} id="resend_otp"   >Resend  Code</span>
                                    <input type="submit" disabled={!this.state.email_otp} value="Submit" className="crypt-button-red-full" />
                                </form>
                            </div>
                            <div class="modal-footer">


                            </div>
                        </div>


                    </Modal>
                </div>

                <Footer />
                {/* <!-- Modal --> */}
            </>
        )
    }
}