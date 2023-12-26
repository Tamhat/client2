import React, { Component } from 'react';

import axios from 'axios';
import Header from './directives/header'
import Cookies from 'js-cookie';
import config from './config/config'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

export default class Forgot extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
        };
        this.loginData=JSON.parse(!Cookies.get('loginSuccessAdmin') ? null : Cookies.get('loginSuccessAdmin'));

    }


    componentDidMount() {

    }


    handleSubmit = event => {
        event.preventDefault();
        const { email } = this.state;
        const data = this.state
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }

        axios.post(`${config.apiUrl}/forgot` + '?nocache=' + new Date().getTime(), data, { headers: headers }, { email })
            .then(result => {
            
                if (result.data.success === true) {
                    toast.success(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                    setTimeout(() => {

                        window.location.href = `${config.baseUrl}login`
                    }, 2000);
                }
                else if (result.data.success === false) {
                   
                    toast.warn(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER, theme: "light"
                    });

                    this.setState({
                        email: '',

                    })
                }
            }).catch(err => {
               
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                } else {
                    toast.warn(err.response.data?.msg, {
                        position: toast.POSITION.TOP_CENTER, theme: "colored"
                    })
                }
            })
    }



    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }



    render() {
        return (

            <>
            
                <div class="container pt-3">
                    <Header />
                    <ToastContainer theme="dark" />
                    <div class="row mt-5">
                        <div class="col-lg-3 col-md-1"></div>
                        <div class="col-lg-6 col-md-10">
                            <div class="cryptorio-forms cryptorio-forms-dark text-center AppFormLeft  pt-5 pb-5">
                                
                                <h3 class="pb-4">Forgot your password</h3>
                                <div class="cryptorio-main-form">
                                    <form onSubmit={this.handleSubmit} class="text-left">
                                        <p>Please enter the email address you'd like your password reset information sent to</p>
                                        <label for="email">Enter Email </label>
                                        <input type="text" id="email" className="input-control" name="email" placeholder="Your Email" onChange={this.handleChange} value={this.state.email} />
                                   
                                        <input type="submit" value="Request resent link" class="crypt-button-red-full" />
                                    </form>
                                    <p class="float-left"><a href={`${config.baseUrl}login`}>Back to login</a></p>
                                    
                                </div>
                            </div>
                        </div>
                        <div class="col-md-1"></div>
                    </div>
                </div>
       
                {/* <Footer /> */}

            </>
        )
    }
}