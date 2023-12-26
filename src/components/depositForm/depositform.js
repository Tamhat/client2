import React, { Component } from 'react';
import axios from 'axios';
import Header from '../../directives/header'
import Footer from '../../directives/footer'
import Cookies from 'js-cookie';
import config from '../../config/config'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select'
import { browserName, browserVersion } from "react-device-detect";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Swal from 'sweetalert2'
import imageCompression from 'browser-image-compression';
import moment from 'moment'
import Compress from "compress.js";
export default class login extends Component {
    constructor(props) {
        super(props);
        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
        this.state = {
            bank_name: '',
            amount: 0,
            usdt_amount: 0,
            account_number: '',
            deposit_status:'',
            webcontentlist: {},
            transaction_id: '',
            transaction_type: 'IMPS',
            address: '',
            receipt: '',
            receipt_name: '',
            date: new Date(),
            ip: '',
            city: '',
            country: '',
            lat: '',
            lon: '',
            browsername: '',
            browserversion: '',
            msg: '',
            spinLoader: '0',
            error: [],
            rememberMe: false,
            selectoptions: [{ label: 'Select Bank', value: '' }],
            adminselectoptions: [{ label: 'Select Bank', value: '' }],
            transactionTypes: [{ label: 'IMPS', value: 'IMPS' }, { label: 'NEFT', value: 'NEFT' }, { label: "RTGS", value: "RTGS" }, { label: "UPI", value: "UPI" }],
            fietcurrencyoptions: [{ label: 'Select Currency', value: '' }],
            getbankDetails: [],
            allbanks: [],
            admin_bank_name: '',
            admin_bank_holdername: '',
            admin_account_number: '',
            admin_ifsc_code: '',
            admin_explanation: '',
            deposit_Fee_Percentage: 0,
            selectedOption: { label: '', value: '' },
            currencyselectedOptions: { label: 'INR', value: 'INR' },
            adminselectedOptions: { label: 'Select Bank', value: '' }
        };
    }
    validateFunction = () => {
        var p = this.state
        let errors = [];
        // if (p.bank_name == '') {
        //     errors.push({ name: 'bank_name', err: "Bank Name is Required!" });
        // }
        if (this.state.getbankDetails.length == 0) {
            errors.push({ name: 'account_number', err: "Please Add Bank Detail first Then Deposit ↑" });
        }
        if (this.state.currencyselectedOptions.value == '') {
            errors.push({ name: 'currency', err: "Please Select Your Nation Currency!" });
        }
       
        if (this.state.selectedOption == undefined) {
            errors.push({ name: 'account_number', err: "Please Add Bank First Then Deposit!" });
        }
        if (this.state.selectedOption.value == '') {
            errors.push({ name: 'account_number', err: "Please Select Any Bank!" });
        }
        if (p.amount == '') {
            errors.push({ name: 'amount', err: "Amount is Required!" });
        }
        if (p.date == '') {
            errors.push({ name: "date", err: "Payment Date is Required!" });
        }
        if (p.adminselectedOptions.value == '') {
            errors.push({ name: "admin_bank_id", err: "admin bank is Required!" });
        }
        if (p.transaction_type == '') {
            errors.push({ name: "transaction_type", err: "Transaction Type is Required!" });
        }
        if (p.transaction_id == '') {
            errors.push({ name: "transaction_id", err: "Transaction ID is Required!" });
        }
        // if (p.receipt_name == '') {
        //     errors.push({ name: "receipt_name", err: "Payment Receipt is Required!" });
        // }
        if (errors.length > 0) {
            this.setState({ error: errors })
            return false;
        }
        this.setState({ error: '' })
        
        return true;
    }
    componentDidMount() {
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        const name = rememberMe ? localStorage.getItem('user') : '';
        const ifsc_code = rememberMe ? localStorage.getItem('pass') : '';
        this.setState({ name, rememberMe, ifsc_code });
        this.getLocation()
        this.getUserBankDetails()
        this.getadminBankDetails()
        this.getFees()
        this.getcurrencies()
        this.getWebContentData()
        this.getWallet()

    }

    getWallet=async ()=>{
        await axios({
            method: 'post',
            url: `${config.apiUrl}/userwallet`,
            headers: { "Authorization": this.loginData?.Token },
            data: { 'user_id': this.loginData.data?.id, "email": this.loginData?.data.user_email,"no_reload":true }
          })
            .then(async result => {
              if (result.data.success === true) {
                this.setState({
                    deposit_status: result.data.response.find(item => item.symbol == 'INR').is_deposit,
                })
        
              }
      
              else if (result.data.success === false) {
                toast.error(result.data.msg, {
                  position: toast.POSITION.TOP_CENTER
                });
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
              this.setState({ loader: false })
            })
    }

    getWebContentData = () => {

        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }
        axios.get(`${config.apiUrl}/getwebcontent`, {}, { headers: headers })
            .then(response => {

                if (response.data.success === true) {
                    this.setState({ webcontentlist: response.data.response })
                }

                else if (response.data.success === false) {

                }
            })

            .catch(err => {
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
                       
                        deposit_Fee_Percentage: result.data.response[2].fee_percentage,
                       
                    })
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
    handleSubmit = event => {
        event.preventDefault();
        var isvalid = this.validateFunction()
        this.setState({ spinLoader: '1' })
        if (!isvalid) {
            this.setState({ spinLoader: '0' })
        } else {
            const filter = this.state.getbankDetails.filter(item => item.id == this.state.selectedOption.value)
          
            if (this.loginData && this.loginData.data && this.loginData.data.id) {
            
                let formData = new FormData()
                formData.append('bank_name', filter[0].bank_name)
                formData.append('user_id', this.loginData.data.id)
                formData.append('email', this.loginData.data.user_email)
                formData.append('account_number', filter[0].account_number)
                formData.append('bank_holdername', filter[0].bank_holdername)
                formData.append('currency', this.state.currencyselectedOptions.value)
                formData.append('admin_bank_id', this.state.adminselectedOptions.value)
                formData.append('deposit_amount', this.state.amount)
                formData.append('transaction_type', this.state.transaction_type)
                formData.append('transaction_id', this.state.transaction_id)
                formData.append('date', moment(this.state.date).format('YYYY-MM-DD'))
                formData.append('receipt', this.state.receipt)
                formData.append('usdt_amount', parseFloat(this.state.usdt_amount).toFixed(2))
                let headers = {
                    'Authorization': this.loginData?.Token,
                    'Content-Type': 'application/json'
                }
                axios.post(`${config.apiUrl}/depositForm` + '?nocache=' + new Date().getTime(), formData, { headers: headers })
                    .then(async result => {
                        if (result.data.success === true) {
                            this.setState({ spinLoader: '0' })
                            await Swal.fire({
                                title: 'Your Request Submitted! money will come in within one day',
                                icon: 'success',
                                width: 500,
                                confirmButtonColor: '#3085d6',
                                allowOutsideClick: false,
                                confirmButtonText: 'Continue',
                                confirmButtonColor: "#e4d923",
                            });
                            this.props.history.push(`${config.baseUrl}dashboard`);
                            // window.location.href = `${config.baseUrl}dashboard`

                        }else{
                        
                            if (result.data.success === false) {
                              

                                toast.error(result.data.msg)
                                this.setState({
                                    

                                    spinLoader: '0'
    

                                })
                            }
                        }
                    }).catch(err => {
                        if (err == 'Error: Request failed with status code 403') {
                            toast.error('Session expired please re-login')
                        } else {
                            this.setState({
                                msg: err.response.data?.msg,
                                spinLoader: '0'
                            })
                        }
                      
                    })
            }
            else {
                toast.warn('Please Login First Your Account', {
                    position: toast.POSITION.TOP_CENTER
                });
                // toast.warn()
            }
        }
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
        console.log('selectData1', selectData1, this.state.allbanks, event.target.value)
        if (selectData1.length > 0) {
            this.setState({ currencyselectedOptions: selectData[0], usdt_amount: 0, amount: 0, selectoptions: selectData1, selectedOption: selectData1[0] })
        } else {
            toast.error('Please Add Bank Detail Then Request', {
                position: toast.POSITION.TOP_CENTER
            });
        }
    }

    handleChangeStart = (date) => {
        this.setState({
            date: date
        })
    }

    usdtHandler = e => {
        const { name, value } = e.target
        const re = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
        if (re.test(value) || value == '') {
            if (value == '') {
                this.setState(old => {
                    return { ...old, [name]: 0 ,['usdt_amount']:''}
                })
            } else {
                this.getUsdtPrice(value, 'usd')
                this.setState(old => {
                    return { ...old, [name]: value }
                })
            }
        }
    }

    handleChange = event => {
        const { name, value } = event.target
        const re = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
        if (name == 'transaction_type' || name == 'transaction_id') {
            this.setState(old => {
                return { ...old, [name]: value }
            })
        }
        else if (re.test(value) || value == '') {
            if (name == 'amount') {
                this.getUsdtPrice(value, 'currency')
            }
            this.setState(old => {
                return { ...old, [name]: value }
            })
        }
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
                        usdt_amount: parseFloat(amount / result.data.currencyPrice).toFixed(2)
                    })
                }
                
                else {
                    const currenyValue = result.data.currencyPrice
                    this.setState({
                        amount: (parseFloat(amount) * currenyValue).toFixed(2)
                    })
                }
            }
        })
    }

    fileuploadHandler = async(e) => {


        // var file = e.target.files[0]
        // if (file && file.type.indexOf("image") > -1) {
        // var file_name = file.name

        //  const options = {
        //     maxSizeMB: 1,
        //     maxWidthOrHeight: 1920,
        //     useWebWorker: true
        //   }
        // const compressedFile = await imageCompression(file, options);

        // this.setState({ 'receipt': compressedFile, 'receipt_name': file_name })
        // }else{
        //     toast.warning('only image file accept!')
        // }

        for (var i = 0; i < e.target.files.length; i++) {
            let file = e.target.files[i];
            // console.log(file);
            if(!file.type.includes('image')) {
               toast.error('Please choose image');
            }
            //  else if(file.size / (1024*1024) > 1) {
            //    toast.error('Please choose image of smaller size');
            // }
             else{
               
               var reader = new FileReader();
       
               reader.onload = function (e) {
                   var imgid = document.getElementById('blah')
                   console.log(e.target.result)
                   imgid.src = e.target.result
               };
       
               reader.readAsDataURL(file);
           
           const compress = new Compress();
           const files = [...e.target.files];
           compress.compress(files, {
            size: 1,
            quality: 0.75,
            maxWidth: 1920,
            maxHeight: 1920,
            resize: true
           }).then(modFiles => {              
         // modFiles are modified files with exif free and compressed       //  versions of user selected images
            let uploadableFiles = [];
          
         
            for (var i = modFiles.length - 1; i >= 0; i--) {
             let file = Compress.convertBase64ToFile(modFiles[i].data, modFiles[i].ext);
             let filename = Date.now() + modFiles[i].alt;
             let filetype = modFiles[i].ext;
             let filelastMod = files[i].lastModified;
             uploadableFiles.push(new File([file], filename, {type: filetype, lastModified: filelastMod}));
            }
             let img = new Image();
             let obj;
             this.setState({ receipt: uploadableFiles[0], receipt_name:uploadableFiles[0].name });
             img.onload = () => {
              obj = { width: img.width, height: img.height };
             
             }
           //   img.src = modFiles[i].prefix + modFiles[i].data;
           });
        }
    }
    }

    getLocation = e => {
        axios.get(`https://ipapi.co/json/?__cf_chl_jschl_tk__=pmd_TjdfQUFNDtY8uWKDkPep3E7Aj6nEL124fHJeLOsu8Gc-1631799864-0-gqNtZGzNAhCjcnBszQh9`).then(result => {
            this.setState({
                ip: result.data.ip,
                city: result.data.city,
                country: result.data.country,
                lat: result.data.latitude,
                lon: result.data.longitude,
                browsername: browserName,
                browserversion: browserVersion
            })
        })
    }
    
    getadminBankDetails() {
        axios.get(`${config.apiUrl}/getBankDetails?by=ADMIN`)
            .then(async result => {
                this.setState({})
                // let array = [{ label: 'Select Bank', value: '' }]
                let array = []
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
                    admin_explanation: result.data.response[0].explanation,
                    id: result.data.response[0].id,
                })
                console.log(result.data.response)
            }).catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                }
            })
    }

    createMarkup = () => {
        return { __html: this.state.webcontentlist.deposit_content };
    }

    render() {
        console.log(this.state.deposit_status)
        return (
            <>
               
                <div className='depositform'>
                    <div className="container">
                        <div className="row mt-5">
                            <Header />
                            <div className="col-md-6" >
                                <div className="cryptorio-forms  text-center AppFormLeft pt-4 pb-2 mb-5 deposite-forms">
                                    <ToastContainer />
                                    <h2 className="p-2 Appheading">Best In Coins Account</h2>
                                    <div className="cryptorio-main-form" id="login-bg">
                                        <form className="text-left">
                                            <div class="" style={{ margin: "8px 5px" }}>
                                                <label for="name" className='ml-1'>Select Bank</label>
                                                <select className="input-control" onChange={value => this.adminselecthandleChange(value)} >
                                                    {this.state.adminselectoptions.map(item => (
                                                        item.value == '' ? <option value="" selected disabled hidden>Select Bank</option> :
                                                            <option value={item.value} selected={this.state.adminselectedOptions.value == item.value ? "selected" : ""}>{item.label}</option>
                                                    ))}
                                                </select>
                                              
                                            </div>
                                            <label for="account_name">Name</label>
                                            <div className="form-group ">
                                                <input type='text' className="input-control" value={this.state.admin_bank_name} disabled={true} />
                                            </div>
                                            <label for="account_name">Holder Name</label>
                                            <div className="form-group ">
                                                <input type='text' className="input-control" value={this.state.admin_bank_holdername} disabled={true} />
                                            </div>
                                            <label for="account_name">Account No.</label>
                                            <div className="form-group ">
                                                <input type='text' className="input-control" value={this.state.admin_account_number} disabled={true} />
                                            </div>
                                            <label for="account_name">Ifsc code</label>
                                            <div className="form-group ">
                                                <input type='text' className="input-control" value={this.state.admin_ifsc_code} disabled={true} />
                                            </div>
                                            <label for="account_name">Explanation</label>
                                            <div className="form-group ">
                                                <textarea type='text' className="input-control" value={this.state.admin_explanation} disabled={true} />
                                            </div>


                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6" >
                                <div className="cryptorio-forms  text-center AppFormLeft pt-4 pb-2 mb-5 deposite-forms">
                                    <ToastContainer />
                                    {/* <div className="logo">
                                    <img src="images/main-logo-header.png" alt="logo-image" />
                                </div> */}
                                     <h2 className="p-2 Appheading">Deposit INR</h2><label  data-toggle="modal" data-target="#exampleModals">How to Deposit?</label>
                                    <div className="cryptorio-main-form" id="login-bg">
                                        <form onSubmit={this.handleSubmit} className="text-left">

                                            <div class="" style={{ margin: "8px 5px" }}>
                                                <label for="name" className='ml-1'>Select Fiat Currency</label>
                                                <a href={`${config.baseUrl}bankDetails`}>
                                                    <button type="button" class="btn btn-primary btn-sm pull-right addbank mb-2     "> <span>Add Bank<i class="fa fa-plus"></i></span></button>
                                                </a>
                                                <select className="input-control" onChange={value => this.currencyChangehandler(value)} >
                                                    {this.state.fietcurrencyoptions.map(item => (
                                                        item.value == '' ? <option value="" selected disabled hidden>Select Currency</option> :
                                                            <option value={item.value} selected={this.state.currencyselectedOptions.value == item.value ? "selected" : ""}>{item.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {this.state.error.length > 0 && this.state.error[0].name == 'currency' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}
                                            <label for="name" className='ml-2'>Select Your Bank</label>
                                            <div class="" style={{ margin: "8px 5px" }}>
                                                <select className="input-control" onChange={value => this.selecthandleChange(value)} >
                                                    {this.state.selectoptions.map(item => (
                                                        item.value == '' ? <option value="" selected disabled hidden>Select Bank</option> :
                                                            <option value={item.value} selected={this.state.selectedOption.value == item.value ? "selected" : ""}>{item.label}</option>
                                                    ))}
                                                </select>
                                             
                                            </div>
                                            {this.state.error.length > 0 && this.state.error[0].name == 'account_number' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}
                                            <div class="" style={{ margin: "8px 5px" }}>
                                                <label for="name" className='ml-1 mb-2'>Select Admin Bank</label>
                                                <select className="input-control" onChange={value => this.adminselecthandleChange(value)} >
                                                    {this.state.adminselectoptions.map(item => (
                                                        item.value == '' ? <option value="" selected disabled hidden>Select Bank</option> :
                                                            <option value={item.value} selected={this.state.adminselectedOptions.value == item.value ? "selected" : ""}>{item.label}</option>
                                                    ))}
                                                </select>
                                               
                                            </div>
                                            
                                            <div className='row'>
                                                <div className='col-md-6 col-sm-6 col-lg-6 col-6'>
                                                    <label for="account_name">Amount({this.state.currencyselectedOptions.value})</label>
                                                </div>
                                                <div className='col-md-6 col-sm-6 col-lg-6 col-6'>
                                                    <span className='fee_amount' style={{ float: 'right' }}>Fee :({parseFloat(parseFloat(this.state.amount) * parseFloat(this.state.deposit_Fee_Percentage) / 100).toFixed(3)})</span>
                                                </div>
                                            </div>
                                            <div className="form-group ">
                                            <input type='text' className="input-control" disabled={this.state.currencyselectedOptions.value == '' ? true : false} name="amount" placeholder="Amount" onChange={this.handleChange} value={this.state.amount} />
                                            {this.state.error.length > 0 && this.state.error[0].name == 'amount' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}
           
                                            </div>
                                            <label for="account_name">Date</label>
                                            <div className="form-group">
                                                <DatePicker
                                                    className="input-control"
                                                    autoComplete={false}
                                                    onChange={e => this.handleChangeStart(e)}
                                                    selected={this.state.date}
                                                    name="start_date"
                                                />
                                            </div>
                                            {this.state.error.length > 0 && this.state.error[0].name == 'date' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}
                                            
                                            <div class="" style={{ margin: "8px 5px" }}>
                                                <label for="name" className='ml-1 mb-2'>Select Transaction Type</label>
                                                <select className="input-control" name='transaction_type' onChange={e => this.handleChange(e)} >
                                                    {this.state.transactionTypes.map(item => (
                                                        item.value == '' ? <option value="" selected disabled hidden>Select Transaction</option> :
                                                            <option value={item.value} >{item.label}</option>
                                                    ))}
                                                </select>
                                                {this.state.error.length > 0 && this.state.error[0].name == 'transaction_type' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}
                                            </div>
                                            <label for="account_name">Transaction Id</label>
                                            <div className="form-group ">
                                                <input type='text' className="input-control" name="transaction_id" placeholder="transaction_id" onChange={this.handleChange} value={this.state.transaction_id} />
                                                {this.state.error.length > 0 && this.state.error[0].name == 'transaction_id' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}
                                            </div>
                                            <div className='col-sm-12'>
                                                <div className='row'>
                                                    <div className='col-lg-6 my-3'>
                                                        <div class="upload-btn-wrapper">
                                                            <button class="btn-upload">{this.state.receipt_name == '' ? `Upload File` : `${this.state.receipt_name.toString().substring(0, 5) + '...' + this.state.receipt_name.toString().substring(this.state.receipt_name.length - 5)}`}</button>
                                                            <input type="file" accept="image/png, image/gif, image/jpeg,application/pdf" name="receipt" onChange={e => this.fileuploadHandler(e)} />
                                                            {this.state.error.length > 0 && this.state.error[0].name == 'receipt_name' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className='col-lg-6'>
                                                        {this.state.spinLoader === '0' && this.state.deposit_status==1 ?
                                                            <button className="crypt-button-red-full mt-3" type="submit"  >
                                                                Submit
                                                            </button> :this.state.deposit_status==1 && this.state.spinLoader === '1'?
                                                             <button className="crypt-button-red-full" disabled>
                                                             Loading<i class="fa fa-spinner fa-spin validat"></i>
                                                         </button>:<button  className="crypt-button-red-full mt-3" type="submit"  disabled>
                                                                Disabled
                                                            </button >
                                                           
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <p style={{ textAlign: 'left', color: 'red' }}   >{this.state.msg} </p>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal fade" id="exampleModals" tabindex="-1" aria-labelledby="exampleModalLabels" aria-hidden="true">

                    <div className="steps" >
                        <div className="row">

                            <div className="col-12">
                                <div className="modal-dialog modal-dialog-centered" id="personal_model">
                                    <div className="modal-content" >
                                        <div className="modal-header">
                                            <h5 className="modal-title text-center" id="exampleModalLabels">Explanation</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">

                                            <div className="wrapper">

                                                <div className="infos">
                                                    <p>
                                                        <div dangerouslySetInnerHTML={this.createMarkup()} /></p>
                                                </div>


                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        )
    }
}