import React, { Component } from 'react';
import axios from 'axios';
import Header from '../directives/header'
import Cookies from 'js-cookie';
import config from '../config/config'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';



export default class VerifyMobile extends Component {

    constructor(props) {
        super(props);
        const { match: { params } } = this.props;
        this.user_id = params.user_id
        this.state = {
            sms_otp: '',
        };
    }


    componentDidMount() {

    }

    async sendOtp() {

    }


    handleSubmit = event => {
        event.preventDefault();

        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }

        axios.post(`${config.apiUrl}/verifyMobile` + '?nocache=' + new Date().getTime(), { user_id: this.user_id, sms_otp: this.state.sms_otp }, { headers: headers })
            .then(result => {
                // alert(' ALL field');
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
                    toast.error(err.response.data?.msg, {
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

                                <h3 class="pb-4">Mobile Verification</h3>
                                <div class="cryptorio-main-form">
                                    <form onSubmit={this.handleSubmit} class="text-left">
                                        <label for="email">Enter OTP</label>
                                        <input type="text" id="email" className="input-control" name="sms_otp" placeholder="Your OTP" onChange={this.handleChange} value={this.state.sms_otp} />
                                        <input type="submit" value="Submit" class="crypt-button-red-full" />
                                    </form>
                                    <p class="float-left"><a href={`${config.baseUrl}login`}>Back to login</a></p>

                                </div>
                            </div>
                        </div>
                        <div class="col-md-1"></div>
                    </div>
                </div>
            </>
        )
    }
}