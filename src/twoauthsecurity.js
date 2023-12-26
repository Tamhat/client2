import React, { Component } from 'react';
import axios from 'axios';
import Header from './directives/header'
import Footer from './directives/footer'
import config from './config/config'
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { browserName, browserVersion } from "react-device-detect";
const headers = {
    'Content-Type': 'application/json'
};

export default class twoauthsecurity extends Component {

    constructor(props) {
        super(props)
        this.state = {
            SecretKey: '',
            enableTwoFactor: "",
            user_id: '',
            spinloader: '0',
            ip: '',
            city: '',
            country: '',
            lat: '',
            lon: '',
            browsername: '',
            browserversion: ''
        };
   
        this.loginData = (!Cookies.get('loginSuccessAuth')) ? [] : JSON.parse(Cookies.get('loginSuccessAuth'));
        this.twoAuthenticationVerifyAPI = this.twoAuthenticationVerifyAPI.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    componentDidMount() {
        this.getLocation()
    }

    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    getLocation = async (e) => {
        // let apiKey = '1be9a6884abd4c3ea143b59ca317c6b2';


        // axios.get(`https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}`).then(result=>{

        axios.get(`https://ipapi.co/json/?__cf_chl_jschl_tk__=pmd_TjdfQUFNDtY8uWKDkPep3E7Aj6nEL124fHJeLOsu8Gc-1631799864-0-gqNtZGzNAhCjcnBszQh9`).then(result => {

            axios.get(`https://ipinfo.io/${result.data.ip}?token=ea220bd92fff15`).then(result => {

                //   console.log(result)

                this.setState({
                    ip: result.data.ip,
                    city: result.data.city,
                    country: result.data.country,
                    lat: '',
                    lon: '',
                    browsername: browserName,
                    browserversion: browserVersion
                })
            })
        })
    }
    //==================================  twoupdateAuthentication ========================

    async twoAuthenticationVerifyAPI(e) {
        e.preventDefault()
        this.setState({
            spinloader: '1'
        })
        await axios({
            method: 'post',
            url: `${config.apiUrl}/twoAuthenticationVerify`,
            headers: { "Authorization": this.loginData?.Token },
            data: {
                "user_id": this.loginData.data.id,
                email: this.loginData.data?.user_email,
                'SecretKey': this.state.SecretKey,
                'enableTwoFactor': 1,
                google_otp_login:true,
                ip: this.state.ip,
                city: this.state.city,
                country: this.state.country,
                lat: this.state.lat,
                lon: this.state.lon,
                browsername: this.state.browsername,
                browserversion: this.state.browserversion,
            }
        }).then(result => {
            if (result.data.logindata.email_auth === 1) {
                Cookies.set('loginSuccessAuth', this.loginData,{ secure: config.Secure,HttpOnly:config.HttpOnly });
                setTimeout(() => {
                    window.location.href = `${config.baseUrl}emailauthentication`
                }, 2500);
            }
            // else if (result.data.logindata.sms_auth === 1) {
            //     Cookies.set('loginSuccessAuth', this.loginData,{ secure: config.Secure,HttpOnly:config.HttpOnly });
            //     setTimeout(() => {
            //         window.location.href = `${config.baseUrl}smsauthentication`
            //     }, 2500);
            // }
             else {
                Cookies.set('loginSuccess', this.loginData,{ secure: config.Secure ,HttpOnly:config.HttpOnly});
             
                toast.success('Login succesfull!', {
                    position: toast.POSITION.TOP_CENTER
                });

                
                setTimeout(() => {
                    window.location.href = `${config.baseUrl}dashboard`
                }, 2500);

               
            }

        }).catch(err => {
            if (err == 'Error: Request failed with status code 400') {
                toast.error('Wrong secretkey entered', {
                    position: toast.POSITION.TOP_CENTER
                })
                this.setState({
                    spinloader: '0'
                })
            } else if (err == 'Error: Request failed with status code 403') {
                toast.error('Session expired please re-login')
            }
            else {
                toast.error('unexpcted internal error!', {
                    position: toast.POSITION.TOP_CENTER
                })
            }
        })
    }


    render() {

        return (

            <>

              
                <div className="container">

                    <div className="row">

                        <Header />
                        <div className="col-md-3"></div>
                        <div className="col-md-6" style={{ marginTop: '50px' }}>
                            <div className="cryptorio-forms cryptorio-forms-dark  AppFormLeft text-center pt-5 pb-5">
                                <ToastContainer />
                                <div className="logo">
                                  
                                </div>
                                <h3 className="p-4">
                                    <span >
                                        Google Authentication <br />
                                        <small style={{ fontSize: "17px" }}>Please type code to continue</small>
                                    </span></h3>

                                <div className="cryptorio-main-form" id="login-bg">
                                    <form onSubmit={this.handleSubmit} className="text-left">
                                        <label for="email">Secret Key</label>
                                        <input type="text" id="email" className='input-control' name="SecretKey" placeholder="Your Secret Key" onChange={this.handleChange} value={this.state.SecretKey} />
                                        {this.state.spinloader === '0' ?
                                            <button className="crypt-button-red-full" type="submit" onClick={this.twoAuthenticationVerifyAPI}  >
                                                Submit
                                            </button> :
                                            <button className="crypt-button-red-full" disabled>
                                                Loading<i class="fa fa-spinner fa-spin validat"></i>
                                            </button>
                                        }       </form>
                                  
                                    <p className="float-right"><a href={`${config.baseUrl}forgot`}>Forgot Password</a></p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3"></div>

                    </div>
                </div>
                <Footer />
            </>
        )
    }
}