import React, { Component } from 'react';
import Header from '../../directives/header'
import Footer from '../../directives/footer'
import axios from 'axios'
import config from '../../config/config'
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import moment from 'moment'

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


const headers = {
    'Content-Type': 'application/json'
};
export default class Withdraw extends Component {

    constructor(props) {
        super(props)

        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
        this.href = window.location.href;
        this.coin_symbol = this.href.substring(this.href.lastIndexOf('/') + 1);
        this.state = {
            errorMsg: "",
            errorMsg1: "",
            cardNumber: '',
            cardExYear: '',
            cardExMonth: '',
            cardcvc: '',
            submitBtn: false,
            selectCoin: '',
            usd_amount: 0,
            buy_amount: 0,
            email_success_msg: '',
            email_err_msg: '',
            coinList: [],
            formStep: 0,
            account_name: '',
            account_number: '',
            ifsc_code: '',
            DataValue: 0,
            inr_amount: 0,
            selectoptions: [{ label: 'Select Bank', value: '' }],
            adminselectoptions: [{ label: 'Select Bank', value: '' }],
            fietcurrencyoptions: [{ label: 'Select Currency', value: '' }],
            getbankDetails: [],
            allbanks: [],
            modalOpen: false,
            my_wallet_inr_balance: 0,
            email_otp: '',
            withdraw_Fee_Percentage: 0,
            currencyselectedOptions: { label: '', value: '' },
            selectedOption: { label: 'Select Bank', value: '' },
            adminselectedOptions: { label: 'Select Bank', value: '' }

        }
        this.onChange = this.onChange.bind(this);
        this.filterSubmit = this.filterSubmit.bind(this);
        this.selectCoinDropdown = this.selectCoinDropdown.bind(this);

    }

    clickData(id) {
        if (id === 0) {
            this.setState({
                DataValue: 1
            })
        }
        else if (id === 1) {
            this.setState({
                DataValue: 0
            })
        }
    }

    MkdHandler(e) {
        const { name, value } = e.target
        const re = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
        if (re.test(value) || value == '') {
            this.setState(old => {
                return { ...old, [name]: value }
            })
        }
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

    async onChange(e) {
        if (e.target.name == 'selectCoin') {

            this.setState({
                [e.target.name]: this.state.coinList[e.target.value],
            })

            var symbl = this.state.coinList[e.target.value].symbol

            if (symbl == "BNB" || symbl == 'BUSD' || symbl === 'THETA') {
                // var data = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${symbl}&tsyms=USD`)
                var data = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbl}USDT`)

                var price = await data.json();

                this.setState({
                    usd_amount: parseFloat(price.price)

                })
            } else {

                // var data = await fetch(`https://min-api.cryptocompare.com/data/prices/${this.state.coinList[e.target.value].symbol}-USD/buy`);
                // var data = await fetch(`https://api.coinbase.com/v2/prices/${this.state.coinList[e.target.value].symbol}-USD/buy`);

                if (this.state.coinList[e.target.value].symbol == 'USDT') {
                    var valueCal = 1;
                }
                else if (this.state.coinList[e.target.value].symbol == 'WBTC') {
                    var data1 = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=WBTC&tsyms=USD`);
                    var price1 = await data1.json();

                    var valueCal = price1.USD;
                }
                else {
                    var data = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${this.state.coinList[e.target.value].symbol}USDT`);

                    var price = await data.json();
                    if (!price?.price) {
                        var valueCal = 0;
                    } else {
                        var valueCal = parseFloat(price?.price);
                    }
                }
                this.setState({
                    usd_amount: parseFloat(valueCal) * parseFloat(this.state.buy_amount),
                })
            }
        } else if (e.target.name == 'usd_amount') {
            if (!e.target.value) {
                e.target.value = 0;
            }
            if (e.target.value.indexOf('.') < 0) {
                if (e.target.value.charAt(0) == 0) {
                    var newVal = e.target.value.substring(1);
                    if (newVal) {
                        e.target.value = parseInt(newVal);
                    }
                }
            }

            this.setState({
                [e.target.name]: e.target.value
            })
            var symbl = this.state.selectCoin.symbol

            if (symbl == "BNB" || symbl == 'BUSD' || symbl === 'THETA') {
                // var data = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${this.state.selectCoin.symbol}`)

                var data = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${this.state.selectCoin.symbol}USDT`)

                var price = await data.json();

                if (symbl == "BNB") {
                    this.setState({
                        buy_amount: parseFloat(price.price) * parseFloat(e.target.value),
                    })
                } else if (symbl == "BUSD") {
                    this.setState({
                        buy_amount: parseFloat(price.price) * parseFloat(e.target.value),
                    })
                }
                else {
                    this.setState({
                        buy_amount: parseFloat(price.price) * parseFloat(e.target.value),
                    })
                }

            } else {
                // var data1 = await fetch(`https://api.coinbase.com/v2/prices/${this.state.selectCoin.symbol}-USD/buy`);

                var data1 = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${this.state.selectCoin.symbol}USDT`);

                var price = await data1.json();
                var valueCal = 1 / parseFloat(price?.price);

                this.setState({
                    buy_amount: parseFloat(valueCal) * parseFloat(e.target.value),
                })

            }
        }
        else if (e.target.name == 'buy_amount') {

            if (!e.target.value) {
                e.target.value = 0;
            }
            if (e.target.value.indexOf('.') < 0) {
                if (e.target.value.charAt(0) == 0) {
                    var newVal = e.target.value.substring(1);
                    if (newVal) {
                        e.target.value = parseInt(newVal);
                    }
                }
            }

            this.setState({
                [e.target.name]: e.target.value
            })
            var symbl = this.state.selectCoin.symbol

            if (symbl == "BNB" || symbl == 'BUSD' || symbl === 'THETA') {
                // var data = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${this.state.selectCoin.symbol}&tsyms=USD`)

                var data = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${this.state.selectCoin.symbol}USDT`)

                var price = await data.json();

                this.setState({
                    usd_amount: parseFloat(price.price) * parseFloat(e.target.value),
                })


            } else {
                // var data1 = await fetch(`https://api.coinbase.com/v2/prices/${this.state.selectCoin.symbol}-USD/buy`);
                var data1 = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${this.state.selectCoin.symbol}USDT`);

                var price = await data1.json();

                var valueCal = parseFloat(price?.price);


                this.setState({
                    usd_amount: parseFloat(valueCal) * parseFloat(e.target.value),
                })

            }
        }
        else {
            this.setState({
                [e.target.name]: e.target.value
            })
        }

        this.getUsdtPrice(e.target.value, 'usd')
    }


    getadminBankDetails() {
        axios.get(`${config.apiUrl}/getBankDetails?by=ADMIN`)
            .then(async result => {
                this.setState({})
                let array = [{ label: 'Select ADMIN Bank', value: '' }]
                // let array = []
                for (let x in result.data.response) {
                    let obj = {}
                    obj.label = result.data.response[x].bank_name
                    obj.value = result.data.response[x].id
                    array.push(obj)
                }
                this.setState({ adminselectoptions: array, adminselectedOptions: array[0], records: result.data.response })
                this.setState({
                    admin_account_number: result.data.response[0].account_number,
                    admin_bank_holdername: result.data.response[0].bank_holdername,
                    admin_bank_name: result.data.response[0].bank_name,
                    admin_ifsc_code: result.data.response[0].ifsc_code,
                    admin_explanation: result.data.response[0].withdraw_explanation,
                    id: result.data.response[0].id,
                })
                // console.log(result.data.response)
            }).catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                }
            })
    }

    getUserBankDetails() {

        axios.get(`${config.apiUrl}/getBankDetails?user_id=${this.loginData.data.id}`)
            .then(async result => {
                if (result.data && result.data.response) {
                    let array = [{ label: 'Select Bank', value: '' }]
                    for (let x in result.data.response) {
                        let obj = {}
                        obj.label = result.data.response[x].bank_name
                        obj.value = result.data.response[x].id
                        obj.currency = result.data.response[x].currency
                        array.push(obj)
                    }

                    this.setState({ selectoptions: array, allbanks: array, getbankDetails: result.data.response })
                }


            }).catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                }

            })
    }

    componentDidMount() {
        this.coinListAPI();
        this.getUserBankDetails()
        this.getUserUsdtBalance()
        this.getFees()
        this.getcurrencies()
        this.getadminBankDetails()

    }

    getcurrencies() {

        axios.get(`${config.apiUrl}/getcurrencies`)
            .then(async result => {
                if (result.data && result.data.response) {
                    let array = [{ label: 'Select Currency', value: '' }]
                    for (let x in result.data.response) {
                        let obj = {}
                        obj.label = result.data.response[x].symbol
                        obj.value = result.data.response[x].symbol
                        array.push(obj)
                    }

                    this.setState({ fietcurrencyoptions: array })
                }


            }).catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                }

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

    async getUserUsdtBalance() {
        if (this.loginData.data?.id) {
            var resData = await axios({
                method: 'post',
                url: `${config.apiUrl}/userwallet` + '?nocache=' + new Date().getTime(),
                headers: { "Authorization": this.loginData?.Token },
                data: { pair_id: 5, user_id: this.loginData.data?.id, "email": this.loginData?.data?.user_email }
            });


            if (resData.data.success == true) {
                var INR_balance = resData.data.response.filter(item => item.coin_id == 30);
                this.setState({ my_wallet_inr_balance: INR_balance[0].balance })


            }

        }
    }




    async coinListAPI() {
        await axios({
            method: 'get',
            url: `${config.apiUrl}/coinList` + '?nocache=' + new Date().getTime(),
        })
            .then(result => {
                if (result.data.success === true) {

                    var selectCooin = result.data.response.findIndex(i => i.symbol == this.coin_symbol);
                    if (selectCooin < 0) {
                        selectCooin = 0;
                    }
                    this.setState({
                        selectCoin: result.data.response[selectCooin],
                        coinList: result.data.response.filter(item => item.is_tradable == 1),
                    })
                }
                else if (result.data.success === false) {
                    this.setState({
                        coinList: [],
                    })
                }
            })
    }


    async modalOpencheck(e, type) {

        e.preventDefault();

        if (this.state.currencyselectedOptions.value == '') {
            this.setState({
                errorMsg: "Please Select Currency"
            })
        }

        else if (this.state.inr_amount == 0) {
            this.setState({
                errorMsg: "Please enter amount."
            })
        }
        else if (this.state.selectedOption.value == '') {
            this.setState({
                errorMsg: "Please Select Any Bank"
            })
        }




        else if (parseFloat(this.state.my_wallet_inr_balance) < parseFloat(this.state.inr_amount)) {

            toast.warn("Insufficient fund in your wallet!")
            this.setState({
                errorMsg: ""
            })
        }
        else {

            if (parseFloat(this.state.my_wallet_inr_balance) < parseFloat(this.state.inr_amount)) {
                toast.warn("Insufficient fund in your wallet!")
                this.setState({
                    errorMsg: ""
                })
                setTimeout(() => {
                    // this.props.history.push(`${config.baseUrl}withdraw`);
                    window.location.href = `${config.baseUrl}withdraw`
                }, 2000);

            }

            else if (this.state.inr_amount == 0) {
                this.setState({
                    errorMsg: "Please enter amount."
                })
            }

            else if (this.state.selectedOption.value == '') {
                this.setState({
                    errorMsg: "Please Select Any Bank"
                })
            }


            else {
                this.setState({
                    errorMsg: ""
                })
                const filter = this.state.getbankDetails.filter(item => item.id == this.state.selectedOption.value)

                await axios({
                    method: 'POST',
                    url: `${config.apiUrl}/withDrawcheckvalidation` + '?nocache=' + new Date().getTime(),
                    headers: { "Authorization": this.loginData?.Token },
                    data: {
                        'user_id': this.loginData.data?.id,
                        "email": this.loginData?.data.user_email,
                        "usdt_amount": this.state.usd_amount,
                        "inr_amount": this.state.inr_amount,
                        'currency': this.state.currencyselectedOptions.value,
                        "bank_holdername": filter[0].bank_holdername,
                        "account_number": filter[0].account_number,
                        "ifsc_code": filter[0].ifsc_code,
                        'bank_name': filter[0].bank_name
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

        }
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

    async finalSubmit(e) {
        e.preventDefault()
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }

        axios.post(`${config.apiUrl}/withdrawAuthentication`, { email: this.loginData.data?.user_email, 'user_id': this.loginData.data?.id, email_otp: this.state.email_otp, type: 'check_otp' }, { headers: headers })
            .then(async result => {

                if (result.data.success === true) {


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

    async filterSubmit(e) {
        e.preventDefault();
        if (parseFloat(this.state.my_wallet_inr_balance) < parseFloat(this.state.inr_amount)) {
            toast.warn("Insufficient fund in your wallet!")
            this.setState({
                errorMsg: ""
            })
            setTimeout(() => {
                window.location.href = `${config.baseUrl}withdraw`
            }, 2000);


        }

        else if (this.state.inr_amount == 0) {
            this.setState({
                errorMsg: "Please enter amount."
            })
        }


        else if (this.state.selectedOption.value == '') {
            this.setState({
                errorMsg: "Please Select Any Bank"
            })
        }

        else {
            this.setState({
                errorMsg: ""
            })

            const filter = this.state.getbankDetails.filter(item => item.id == this.state.selectedOption.value)


            await axios({
                method: 'POST',
                url: `${config.apiUrl}/withDrawrequest` + '?nocache=' + new Date().getTime(),
                headers: { "Authorization": this.loginData?.Token },
                data: {
                    'user_id': this.loginData.data?.id,
                    "email": this.loginData?.data.user_email,
                    "usdt_amount": this.state.usd_amount,
                    'currency': this.state.currencyselectedOptions.value,
                    "bank_holdername": filter[0].bank_holdername,
                    "inr_amount": this.state.inr_amount,
                    email_otp: this.state.email_otp,
                    "account_number": filter[0].account_number,
                    "ifsc_code": filter[0].ifsc_code,
                    "date": moment().format('YYYY-MM-DD'),
                    'bank_name': filter[0].bank_name
                }
            })
                .then(async result => {
                    if (result.data.success === true) {

                        this.setState({ modalOpen: false,usd_amount: 0,  selectedOption: { label: 'Select Bank', value: '' },
                        adminselectedOptions: { label: 'Select Bank', value: '' }, inr_amount: 0, email_otp: '', email_success_msg: '', email_err_msg: '' })
                        toast.success(result.data.msg, {
                            position: toast.POSITION.TOP_CENTER
                        });

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
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    }
                });
        }

    }


    handleChange2 = e => {
        this.setState({
            [e.target.name]: e.target.value,
            errorMsg: "",
            errorMsg1: "",
        })
    }

    handleChange3 = e => {
        if (!this.state.buy_amount) {
            this.setState({
                errorMsg: "Please enter amount."
            })
        }
        else if (!this.state.selectedOption && this.state.selectedOption.value) {
            this.setState({
                errorMsg: "Please Select Any Bank"
            })
        }
        else {
            this.setState({
                errorMsg: "",
                errorMsg1: "",
                formStep: 1
            })
        }
    }


    selectCoinDropdown(event) {

        var e = {
            target: {
                name: 'selectCoin',
                value: event.target.value
            }
        }
        this.onChange(e);
    }

    selecthandleChange(event) {
        let selectData = this.state.selectoptions.filter(i => i.value == event.target.value);
        this.setState({ selectedOption: selectData[0] })
    }

    adminselecthandleChange(event) {
        let selectData = this.state.adminselectoptions.filter(i => i.value == event.target.value);
        this.setState({ adminselectedOptions: selectData[0] })
        let filter = this.state.records.filter(item => item.id == event.target.value)
        this.setState({
            admin_account_number: filter[0].account_number,
            admin_bank_holdername: filter[0].bank_holdername,
            admin_bank_name: filter[0].bank_name,
            admin_ifsc_code: filter[0].ifsc_code,
            admin_explanation: filter[0].explanation,
            id: filter[0].id,
        })

    }

    currencyChangehandler(event) {
        let selectData = this.state.fietcurrencyoptions.filter(i => i.value == event.target.value)
        let selectData1 = this.state.allbanks.filter(i => i.currency == event.target.value)
        this.setState({ currencyselectedOptions: selectData[0], usd_amount: 0, inr_amount: 0, selectoptions: selectData1, selectedOption: selectData1[0] })
    }

    getUsdtPrice(amount, type) {
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }
        axios.get(`${config.apiUrl}/getadminUsdtValue?currency=${this.state.currencyselectedOptions.value}`).then(result => {
            if (result.data.success == true) {
                if (type == 'currency') {
                    this.setState({
                        inr_amount: parseFloat(amount / result.data.currencyPrice).toFixed(2)
                    })
                }

                else {
                    const currenyValue = result.data.currencyPrice
                    this.setState({
                        inr_amount: (parseFloat(amount) * currenyValue).toFixed(2)
                    })
                }
            }
        })
    }

    render() {

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
                                    <div class="row">
                                        <div class="col-sm-12 text-center">
                                            {this.state.coinList.map((item, i) => (
                                                (item.id == this.state.selectCoin.id) ?
                                                    <h2 class="buy_btc-head " >Withdraw INR
                                                    </h2> : ''
                                            ))}
                                        </div>
                                    </div>
                                    <h5 className='mb-3'>Available Balance : {this.state.my_wallet_inr_balance} INR</h5>
                                </div>

                                <div className="cryptorio-main-form" id="login-bg">
                                    <div className="steps" style={{ display: `${(this.state.formStep == 1) ? 'none' : 'block'}` }}>
                                        <div class="content-padding" >
                                            <div>
                                                <div class="quotes-view">
                                                    <div class="quotes-view-container">
                                                        <div class="qtyccy-selector text-left">
                                                            <select className="input-control" onChange={value => this.currencyChangehandler(value)} >
                                                                {this.state.fietcurrencyoptions.map(item => (
                                                                    item.value == '' ? <option value="" selected disabled hidden>Select Currency</option> :
                                                                        <option value={item.value} selected={this.state.currencyselectedOptions.value == item.value ? "selected" : ""}>{item.label}</option>
                                                                ))}
                                                            </select>


                                                        </div>&nbsp;
                                                        <div class="qtyccy-selector text-left">
                                                            <div className='row'>
                                                                <div className='col-md-4 col-sm-4 col-lg-4 col-4'>
                                                                    <label className='mb-1'>INR</label>
                                                                </div>
                                                                <div className='col-md-8 col-sm-8 col-lg-8 col-8'>
                                                                    <span className='fee_amount' style={{ float: 'right' }}>Fee :({parseFloat(parseFloat(this.state.inr_amount) * parseFloat(this.state.withdraw_Fee_Percentage) / 100).toFixed(3)})</span>
                                                                </div>
                                                            </div>

                                                            <div class="quantityWrapper text-left cs-special">
                                                                <span>

                                                                    <input type="text" min="0" disabled={this.state.currencyselectedOptions.value == '' ? true : false} inputmode="numeric" autocomplete="off" step="0.000001" name="inr_amount" class="inputField" for="amount"
                                                                        onKeyPress={(event) => { if (!/^\d*[.]?\d{0,1}$/.test(event.key)) { event.preventDefault(); } }} value={this.state.inr_amount} onChange={e => this.MkdHandler(e)} />
                                                                </span>
                                                            </div>

                                                        </div>&nbsp;
                                                        <div class="qtyccy-selector text-left">
                                                            <div className='row'>
                                                                <div className='col-md-4 col-sm-4 col-lg-4 col-4'>

                                                                </div>
                                                                <div className='col-md-8 col-sm-8 col-lg-8 col-8'>
                                                                    <span className='fee_amount' style={{ float: 'right' }}>You will get : ({(parseFloat(this.state.inr_amount) - parseFloat(parseFloat(this.state.inr_amount) * parseFloat(this.state.withdraw_Fee_Percentage) / 100).toFixed(3)).toFixed(2)})</span>
                                                                </div>
                                                            </div>
                                                        </div>&nbsp;
                                                        <div class="">
                                                            <select className="input-control" onChange={value => this.selecthandleChange(value)} >
                                                                {this.state.selectoptions.map(item => (
                                                                    item.value == '' ? <option value="" selected disabled hidden>Select Bank</option> :
                                                                        <option value={item.value} selected={this.state.selectedOption.value == item.value ? "selected" : ""}>{item.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        &nbsp;
                                                        <div class="">
                                                            <select className="input-control" onChange={value => this.adminselecthandleChange(value)} >
                                                                {this.state.adminselectoptions.map(item => (
                                                                    item.value == '' ? <option value="" selected disabled hidden>Select ADMIN Bank</option> :
                                                                        <option value={item.value} selected={this.state.adminselectedOptions.value == item.value ? "selected" : ""}>{item.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        &nbsp;
                                                        <div class="qtyccy-selector text-left">
                                                            <div className='row'>
                                                                <div className='col-lg-12'>
                                                                    <label className='mb-1'>Explanation</label>
                                                                    <textarea type='text' className="input-control" value={this.state.admin_explanation} disabled={true} />
                                                                </div>

                                                            </div>

                                                        </div>



                                                        <div className="mt-4">
                                                            <p style={{ color: 'red' }}>{this.state.errorMsg}</p>

                                                            <button type="button" onClick={e => this.modalOpencheck(e)} className='crypt-button-red-full' >Confirm</button>
                                                        </div>
                                                    </div>
                                                    <br />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="steps" style={{ display: `${(this.state.formStep == 1) ? 'block' : 'none'}` }}>
                                        <div class="content-padding" >
                                            <div>
                                                <div class="quotes-view">
                                                    <div class="quotes-view-container">
                                                        <h2>Bank Account Detail </h2>                                            <div>

                                                            <div class="qtyccy-selector cs-special">
                                                                <div class="quantityWrapper">
                                                                    <span inputmode="numeric" selected>
                                                                        <input type="text" name='account_name' autocomplete="off" value={this.state.account_name} onChange={this.handleChange2} class="inputField" />
                                                                    </span>
                                                                    <div class="quantity-input-label cs-subtext cs-special-subtext">Account Holder Name</div>
                                                                </div>

                                                            </div>
                                                        </div>&nbsp;
                                                        <div class="qtyccy-selector cs-special">
                                                            <div class="quantityWrapper">
                                                                <span>
                                                                    <input type="number" min="0" inputmode="numeric" autocomplete="off" name="account_number" class="inputField" for="amount"
                                                                        onChange={this.handleChange2} value={this.state.account_number} />
                                                                </span>
                                                                <div class="quantity-input-label cs-subtext cs-special-subtext">Account Number</div>
                                                            </div>


                                                        </div>&nbsp;

                                                        <div class="qtyccy-selector cs-special">
                                                            <div class="quantityWrapper">
                                                                <span inputmode="numeric" selected>

                                                                    <input type="text" name='ifsc_code' autocomplete="off" value={this.state.ifsc_code} onChange={this.handleChange2} class="inputField" />
                                                                </span>
                                                                <div class="quantity-input-label cs-subtext cs-special-subtext">IFSC Code</div>
                                                            </div>

                                                        </div>
                                                        <br />
                                                        <p style={{ color: 'red' }}>{this.state.errorMsg1}</p>

                                                        <div className="modal-footer">
                                                            <a href="javascript:void(0)" onClick={(e) => this.setState({
                                                                formStep: 0
                                                            })} style={{ float: 'left', color: '#ddddd' }}>Back</a>

                                                            <button type="button" onClick={this.filterSubmit} className='btn btn-primary form-control' >Confirm</button>


                                                        </div>
                                                    </div>

                                                    <br />


                                                </div>
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
                            </div>
                        </div>
                    </div>

                </div>

                <Footer />
                {/* // <!-- Modal --> */}
            </>
        )
    }
}