import React, { Component } from 'react';
import Header from '../../directives/header'
import Footer from '../../directives/footer'
import axios from 'axios'
import config from '../../config/config'
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import Loader from "react-loader-spinner";
import Modal from 'react-modal';
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

export default class Transfer extends Component {

    constructor(props) {
        super(props)

        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
        this.href = window.location.href;
        this.coin_symbol = this.href.substring(this.href.lastIndexOf('/') + 1);
        this.state = {
            getWalletList: [],
            selectWithdrawWallet: [],
            coin_id: '',
            loader: false,
            modalOpen: false,
            amount: '',
            transfer_user_email: '',
            error: []
        }

    }



    changeHandler(e) {
        const re = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;

        if (re.test(e.target.value) || e.target.value == '' && e.target.name == 'amount') {
            this.setState({
                [e.target.name]: e.target.value
            })
        }

        if (e.target.name != 'amount') {
            this.setState({
                [e.target.name]: e.target.value
            })
        }

        // console.log('e.target.value',e.target.value,this.state.getWalletList,this.state.getWalletList.find(item=>item.id==e.target.value))


        if (e.target.name === 'coin_id') {

            this.setState({
                selectWithdrawWallet: this.state.getWalletList.find(item=>item.id==e.target.value),
            })
        }

    }


    componentDidMount() {
        this.getFees()
        this.walletList()
    }


    async walletList() {

        await axios({
            method: 'get',
            url: `${config.apiUrl}/coinList`,
            // data: { 'user_id': this.loginData.data?.id }
        })
            .then(result => {
                if (result.data.success === true) {

                    var selectCooin = result.data.response.findIndex(i => i.symbol == this.coin_symbol && i.is_transfer==1);
                //  console.log('selectCooin',result.data.response[0])
                    if (selectCooin < 0) {
                        selectCooin = 0;
                    }
                    this.setState({
                        getWalletList: result.data.response.filter(item=>item.is_transfer==1),
                        selectWithdrawWallet: result.data.response.filter(item=>item.is_transfer==1)[selectCooin],
                        coin_id: result.data.response.filter(item=>item.is_transfer==1)[selectCooin].id
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

    validateForm = () => {
        let errors = [];

        if (this.state.coin_id == '') {
            errors.push({ name: 'coin_id', err: "Coin Symbol is Required!" });
        }


        if (this.state.transfer_user_email == '') {
            errors.push({ name: 'transfer_user_email', err: "Enter Transfer User Email Address!" });
        }

        if (this.state.amount == '') {
            errors.push({ name: 'amount', err: "Enter Amount Required!" });
        }


        if (errors.length > 0) {

            this.setState({ error: errors })

            return false;
        }
        this.setState({ error: [] })

        return true;
    }

    async filterSubmit(e) {
        e.preventDefault()
        const isvalid = this.validateForm()
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }
        if (!isvalid) {

        } else {

            axios.post(`${config.apiUrl}/transferAmount`,
                {
                    email: this.loginData.data?.user_email,
                    transfer_user_email: this.state.transfer_user_email,
                    'user_id': this.loginData.data?.id,
                    email_otp:this.state.email_otp,
                    coin_id: this.state.coin_id,
                    amount: this.state.amount
                },
                { headers: headers })
                .then(async result => {

                    if (result.data.success === true) {
                        toast.success(result.data.msg, {
                            position: toast.POSITION.TOP_CENTER
                        });
                        this.setState({
                            amount: '', transfer_user_email: ''
                        })

                    } else if (result.data.success == false) {
                        toast.error(result.data.msg, {
                            position: toast.POSITION.TOP_CENTER
                        });
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


    }

    requestFunction(e, type) {
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }
        e.preventDefault()
        const isvalid = this.validateForm()
        if (!isvalid) {

        } else {
            confirmAlert({
                title: 'Confirm to submit',
                message: 'Are you sure to transfer amount to Best In Coins user',
                buttons: [
                    {
                        label: 'Yes',
                        onClick: async () =>
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
                    },
                    {
                        label: 'No',
                    }
                ]
            });

        }
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

                    this.setState({ email_err_msg: result.data.msg, email_success_msg: '', modalOpen:false})

                    this.filterSubmit(e)
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
//console.log('this.state.selectWithdrawWallet',this.state.selectWithdrawWallet)
        return (
            <>

                <Header />
                <div className="container">
                    <ToastContainer />
                    <div class="row">
                        <div class="col-lg-3 col-md-1"></div>
                        <div class="col-lg-6 col-md-10">
                            <div class="cryptorio-forms buy_crypto_form AppFormLeft cryptorio-forms-dark text-center pt-5 pb-3" style={{ marginTop: '120px' }}>

                                <div class="col-sm-12 ">

                                    <div class="col-sm-12 text-center">


                                        <h2 class="buy_btc-head " >Send crypto to Best In Coins User
                                        </h2>


                                    </div>
                                </div>


                                {this.state.loader == false ? <div className="cryptorio-main-form" id="login-bg">
                                    <div className="steps" style={{ display: `${(this.state.formStep == 1) ? 'none' : 'block'}` }}>
                                        <div class="content-padding" >
                                            <form onSubmit={e => this.requestFunction(e)}>
                                                <div class="quotes-view">
                                                    <div class="quotes-view-container">
                                                        <div class="qtyccy-selector text-left">
                                                            <div className='row'>
                                                                <div className='col-md-4 col-sm-4 col-lg-4 col-4'>
                                                                    <label className=''>Select Coin</label>
                                                                </div>
                                                            </div>
                                                            <select className="input-control" name='coin_id' onChange={e => this.changeHandler(e)} >
                                                                {this.state.getWalletList?.map((item, i) => (
                                                                    (this.state.selectWithdrawWallet?.symbol == item.symbol) ?
                                                                        <option value={item.id} selected={true}>{item.symbol}</option>
                                                                        :
                                                                        <option value={item.id} selected={false}>{item.symbol}</option>
                                                                ))}
                                                            </select>
                                                            {this.state.error.length > 0 && this.state.error[0].name == 'coin_id' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}

                                                        </div>&nbsp;
                                                        <div class="qtyccy-selector text-left">
                                                            <div className='row'>
                                                                <div className='col-md-6 col-sm-6 col-lg-6 col-6'>
                                                                    <label className=''> User E-mail</label>
                                                                </div>
                                                                <div className='col-md-6 col-sm-6 col-lg-6 col-6'>

                                                                </div>
                                                            </div>

                                                            <div class="quantityWrapper text-left cs-special">
                                                                <span>
                                                                    <input type="email" name='transfer_user_email' onChange={e => this.changeHandler(e)} value={this.state.transfer_user_email} min="0" class="inputField" />
                                                                </span>
                                                            </div>
                                                            {this.state.error.length > 0 && this.state.error[0].name == 'transfer_user_email' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}

                                                        </div>&nbsp;
                                                        <div class="qtyccy-selector text-left">
                                                            <div className='row'>
                                                                <div className='col-md-6 col-sm-6 col-lg-6 col-6'>
                                                                    <label className=''>Amount</label>
                                                                </div>
                                                                <div className='col-md-6 col-sm-6 col-lg-6 col-6'>

                                                                </div>
                                                            </div>

                                                            <div class="quantityWrapper text-left cs-special">
                                                                <span>
                                                                    <input type="text" name='amount' onChange={e => this.changeHandler(e)} value={this.state.amount} min="0" class="inputField" />
                                                                </span>
                                                            </div>
                                                            {this.state.error.length > 0 && this.state.error[0].name == 'amount' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}

                                                        </div>

                                                        <div className="mt-4">
                                                            <button type="submit" className='crypt-button-red-full' >Confirm</button>
                                                        </div>
                                                    </div>

                                                    <br />

                                                </div>
                                            </form>
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
                    </div>
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
                                    <form className="text-left">
                                        <label for="email">Enter Code</label>
                                        <input type="text" id="email" name="email_otp" placeholder="Your Code" onChange={e => this.handleChange(e)} value={this.state.email_otp} />
                                        <p style={{ textAlign: 'left', color: 'rgb(218 150 1)' }}   >{this.state.email_success_msg} </p>
                                        <p style={{ textAlign: 'left', color: 'red' }}>{this.state.email_err_msg}</p>
                                        <span onClick={e => this.modalOpencheck(e, 'resend')} id="resend_otp"   >Resend  Code</span>
                                        <input type="submit" onClick={e => this.finalSubmit(e)} disabled={!this.state.email_otp} value="Submit" className="crypt-button-red-full" />
                                    </form>
                                </div>
                                <div class="modal-footer">


                                </div>
                            </div>


                        </Modal>
                    </div>
                </div>

                <Footer />
                {/* // <!-- Modal --> */}
            </>
        )
    }
}