import React, { Component } from 'react';

import axios from 'axios';
import Header from './directives/header'
import Cookies from 'js-cookie';
import config from './config/config'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

const headers = {
    'Content-Type': 'application/json'
};

export default class Resetpassword extends Component {

    constructor(props) {
        super(props);
        this.state = {
            password: '',
            password2: '',
            confirmicon: 0,
            error: '',
            icon: 0,
        };
        this.loginData = JSON.parse(!Cookies.get('loginSuccessAdmin') ? null : Cookies.get('loginSuccessAdmin'));

        const { match: { params } } = this.props;
        this.token = params.token
    }


    componentDidMount() {

    }

    validatePassword = () => {
        var p = this.state
        let errors = [];


        if (p.password == '') {
            errors.push({ name: "password", err: "Password is Required!" });
        }

        if (p.password.search(/[a-z]/) < 0) {
            errors.push({ name: "password", err: "Your password must contain at least one lower case letter." });
        }
        if (p.password.search(/[A-Z]/) < 0) {
            errors.push({ name: "password", err: "Your password must contain at least one upper case letter." });
        }

        if (p.password.length < 8) {
            errors.push({ name: "password", err: "Your password must be at least 8 characters" });
        }
        if (p.password.search(/[a-z]/i) < 0) {
            errors.push({ name: "password", err: "Your password must contain at least one letter." });
        }
        if (p.password.search(/[0-9]/) < 0) {
            errors.push({ name: "password", err: "Your password must contain at least one digit." });
        }

        if (p.password2 == '') {
            errors.push({ name: "password2", err: "Confirm Password is Required!" });
        }

        if (p.password2 !== p.password) {
            errors.push({ name: "password2", err: "Confirm Password not match!" });
        }

        if (errors.length > 0) {

            this.setState({ error: errors })

            return false;
        }
        this.setState({ error: '' })

        return true;
    }


    handleSubmit = event => {
        event.preventDefault();
        const isvalid = this.validatePassword()
        if (!isvalid) {
            this.setState({ spinLoader: '0' })
        } else {
            const { password, password2 } = this.state;

            let headers = {
                'Authorization': this.loginData?.Token,
                'Content-Type': 'application/json'
            }
            axios.post(`${config.apiUrl}/resetpassword`, { token: this.token, password: password, password2: password2 }, { headers: headers })
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
                        toast.error(result.data.msg, {
                            position: toast.POSITION.TOP_CENTER
                        });

                    }
                }).catch(err => {
                    if (err == 'Error: Request failed with status code 403') {
                        toast.error('Session expired please re-login')
                    } else {
                        toast.error(err.response.data?.msg, {
                            position: toast.POSITION.TOP_CENTER
                        });
                        //  setTimeout(() => {

                        //     window.location.href = `${config.baseUrl}login`
                        // }, 2000);
                    }

                })
        }
    }



    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    showPassword = async (id) => {
        if (id === 0) {

            this.setState({ icon: 1 })
        }
        else if (id === 1) {

            this.setState({ icon: 0 })
        }
    }

    showconfirmPassword = async (id) => {
        if (id === 0) {

            this.setState({ confirmicon: 1 })
        }
        else if (id === 1) {

            this.setState({ confirmicon: 0 })
        }
    }

    render() {
        return (
            <>

                <div class="container">
                    <Header />
                    <ToastContainer />
                    <div class="row">
                        <div class="col-md-3"></div>
                        <div class="col-md-6" style={{ marginTop: '50px' }}>
                            <div class="cryptorio-forms cryptorio-forms-dark AppFormLeft text-center pt-5 pb-5">
                                
                                <h3 class="p-4">Forgot your password</h3>
                                <div class="cryptorio-main-form">
                                    <form onSubmit={this.handleSubmit} class="text-left">

                                        <label for="password">Password</label>
                                        <div className="form-group d-flex">
                                            <input type={this.state.icon === 0 ? 'password' : 'text'} id="password" className="input-control" name="password" placeholder="8-20 letters and numbers" onChange={this.handleChange} value={this.state.password} />
                                            <span onClick={this.state.icon === 0 ? (e) => this.showPassword(0) : (e) => this.showPassword(1)} className='eye-show-signup-login'>

                                                <i className={this.state.icon === 0 ? 'fa fa-eye' : 'fa fa-eye-slash'}></i></span>

                                        </div>
                                        {this.state.error.length > 0 && this.state.error[0].name == 'password' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}
                                        <label for="confirm-password">Confirm Password</label>
                                        <div className="form-group d-flex">
                                            <input type={this.state.confirmicon === 0 ? 'password' : 'text'} id="confirm-password" className="input-control" name="password2" placeholder="8-20 letters and numbers" onChange={this.handleChange} value={this.state.password2} />
                                            <span onClick={this.state.confirmicon === 0 ? (e) => this.showconfirmPassword(0) : (e) => this.showconfirmPassword(1)} className='eye-show-signupconfirm-login'>

                                                <i className={this.state.confirmicon === 0 ? 'fa fa-eye' : 'fa fa-eye-slash'}></i></span>
                                        </div>
                                        {this.state.error.length > 0 && this.state.error[0].name == 'password2' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}

                                        <input type="submit" value="Change Password" class="crypt-button-red-full" />
                                    </form>
                                    <p class="float-left"><a href={`${config.baseUrl}login`}>Back to login</a></p>
           
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3"></div>
                    </div>
                </div>
                {/* <Footer /> */}
            </>
        )
    }
}