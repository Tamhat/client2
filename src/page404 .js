import React, { Component } from 'react';

import axios from 'axios';
import Header from './directives/header'
import Footer from './directives/footer'
import Cookies from 'js-cookie';
import config from './config/config'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

import { browserName, browserVersion } from "react-device-detect";

import Swal from 'sweetalert2'

const headers = {
    'Content-Type': 'application/json'
};

export default class page404 extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: "",
            msg: '',
            ip: '',
            city: '',
            country: '',
            lat: '',
            lon: '',
            browsername: '',
            browserversion: '',
            msg: '',
            spinLoader: '0',
            rememberMe: false,
        };
        this.loginData=JSON.parse(!Cookies.get('loginSuccessAdmin') ? null : Cookies.get('loginSuccessAdmin'));


    }


    componentDidMount() {
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        const email = rememberMe ? localStorage.getItem('user') : '';
        const password = rememberMe ? localStorage.getItem('pass') : '';
        this.setState({ email, rememberMe, password });
        this.getLocation()

    }




    handleSubmit = event => {
        event.preventDefault();
        const data = {
            email: this.state.email,
            password: this.state.password,
            ip: this.state.ip,
            city: this.state.city,
            country: this.state.country,
            lat: this.state.lat,
            lon: this.state.lon,
            browsername: this.state.browsername,
            browserversion: this.state.browserversion,
            confirmicon: 0
        }

        const { rememberMe } = this.state;
        localStorage.setItem('rememberMe', rememberMe);
        localStorage.setItem('user', rememberMe ? this.state.email : '');
        localStorage.setItem('pass', rememberMe ? this.state.password : '');

        axios.post(`${config.apiUrl}/login` + '?nocache=' + new Date().getTime(), data, { headers })
            .then(async result => {
           
                if (result.data.success === true) {
                
                    if (result.data.data.is_enable_factor === 1) {
                        Cookies.set('loginSuccessAuth', result.data,{ secure: config.Secure,HttpOnly:config.HttpOnly });
                        setTimeout(() => {
                            window.location.href = `${config.baseUrl}googleauthentication`
                        }, 2500);
                    }
                   
                    else if (result.data.data.email_auth === 1) {
                        Cookies.set('loginSuccessAuth', result.data,{ secure:config.Secure,HttpOnly:config.HttpOnly });
                        setTimeout(() => {
                            window.location.href = `${config.baseUrl}emailauthentication`
                        }, 2500);
                    }
                      else {
                        Cookies.set('loginSuccess', result.data,{ secure: config.Secure,HttpOnly:config.HttpOnly  });
                   
                        await Swal.fire({
                            title: 'Login successful!',
                            //   text: 'Login successful!',
                            icon: 'success',
                            width: 500,
                            confirmButtonColor: '#3085d6',
                            allowOutsideClick: false,
                            // showCancelButton: true,
                            confirmButtonText: 'Continue',
                            confirmButtonColor: "#e4d923",
                            // cancelButtonText: 'No, keep it'
                        });

                           window.location.href = `${config.baseUrl}dashboard`
                    }
                 }
            }).catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                } else {
                    this.setState({
                        msg: err.response.data?.msg
                    })
                }
                
            })


    }


    showconfirmPassword = async (id) => {
        if (id === 0) {

            this.setState({ confirmicon: 1 })
        }
        else if (id === 1) {

            this.setState({ confirmicon: 0 })
        }
    }

    handleChange = event => {
        const input = event.target;
        const value = input.type === 'checkbox' ? input.checked : input.value;

        this.setState({
            [input.name]: value,
            msg: ''
        });
     
    }

    getLocation = e => {
        // let apiKey = '1be9a6884abd4c3ea143b59ca317c6b2';


        // axios.get(`https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}`).then(result=>{

        axios.get(`https://ipapi.co/json/?__cf_chl_jschl_tk__=pmd_TjdfQUFNDtY8uWKDkPep3E7Aj6nEL124fHJeLOsu8Gc-1631799864-0-gqNtZGzNAhCjcnBszQh9`).then(result => {

            //   console.log(result)

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

    render() {
        return (



            <>
            
                <div className="container">

                    <div className="row">

                        <Header />
                        <div className="col-md-3"></div>
                        <div className="col-md-6" style={{ marginTop: '50px' }}>
                            <div className="cryptorio-forms cryptorio-forms-dark text-center AppFormLeft pt-4 pb-5">
                                <ToastContainer />
                              
                                <h2 className="p-2 Appheading">Login</h2>
                                <div className="cryptorio-main-form" id="login-bg">
                                    <form onSubmit={this.handleSubmit} className="text-left">

                                        <label for="email">Email</label>
                                        <input type="text" className="input-control" id="email" name="email" placeholder="Your Email" onChange={this.handleChange} value={this.state.email} />
                                        <label for="password">Password</label>
                                        <div className="form-group d-flex">
                                            <input type={this.state.confirmicon !== 0 ? 'password' : 'text'} id="password" className="input-control" name="password" placeholder="Please Input Your Password" onChange={this.handleChange} value={this.state.password} />
                                            <span onClick={this.state.confirmicon === 0 ? (e) => this.showconfirmPassword(0) : (e) => this.showconfirmPassword(1)} className='eye-show-login'>

                                                <i style={{ cursor: 'pointer' }} className={this.state.confirmicon !== 0 ? 'fa fa-eye' : 'fa fa-eye-slash'}></i></span>
                                        </div>
                                        <p style={{ textAlign: 'left', color: 'red' }}   >{this.state.msg} </p>
                                        <div class="row  mt-4 mb-4">
                                            <div class="col-md-6">
                                                <div class="form-check">

                                                    <input class="form-check-input" name="rememberMe" checked={this.state.rememberMe} type="checkbox" onChange={this.handleChange} value="" id="defaultCheck1" />&nbsp;
                                                    <label class="form-check-label" for="defaultCheck1">
                                                        Remember me
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="col-md-6 text-right">
                                                <a href="forgot">Forgot Password?</a>
                                            </div>
                                        </div>


                                        {this.state.spinLoader === '0' ?
                                            <button className="crypt-button-red-full" type="submit" disabled={!this.state.email || !this.state.password === ''} >
                                                Login
                                            </button> :
                                            <button className="crypt-button-red-full" disabled>
                                                Loading<i class="fa fa-spinner fa-spin validat"></i>
                                            </button>
                                        } </form>
                                    <p className="text-center">Don't have an account?<a href={`${config.baseUrl}signup`}> Create your account</a></p>
                                    {/* <p className="float-right"><a href={`${config.baseUrl}forgot`}>Forgot Password</a></p> */}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3"></div>

                    </div>
                </div>

            
                {/* <Footer /> */}

            </>
        )
    }
}