import React, { Component } from 'react';
import Header from '../../directives/header'
import Footer from '../../directives/footer'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import axios from 'axios';
import config from '../../config/config'

const headers = {
    'Content-Type': 'application/json'
};

export default class Password extends Component {

    constructor(props) {
        super(props)
        this.state = {
            currentpassword: '',
            confirmicon: 0,
            error: '',
            icon: 0,
            password: '',
            password2: ''
        }
        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
        this.wordAPI = this.wordAPI.bind(this);

    }

    componentDidMount() {
        if (!Cookies.get('loginSuccess')) {
            window.location.href = `${config.baseUrl}`
            return false;
        }
    }

    handleChange = e => {

        this.setState({
            [e.target.name]: e.target.value
        })
    }

    validatePassword = () => {
        var p = this.state
        let errors = [];
       

        if (p.password == '') {
            errors.push({ name: "password", err: "Password is Required!" });
        }
        if (p.password.length < 8) {
            errors.push({ name: "password", err: "Your password must be at least 8 characters" });
        }

        if (p.password.search(/[a-z]/) < 0) {
            errors.push({ name: "password", err: "Your password must contain at least one lower case letter." });
        }

        if (p.password.search(/[A-Z]/) < 0) {
            errors.push({ name: "password", err: "Your password must contain at least one upper case letter." });
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

    async wordAPI(e) {
        e.preventDefault();
        const isvalid = this.validatePassword()
        if (!isvalid) {
            this.setState({ spinLoader: '0' })
        } else {
            var data = {
                email: this.loginData.data.user_email,
                'user_id': this.loginData.data.id,
                currentPassword: this.state.currentpassword,
                password: this.state.password,
                password2: this.state.password2
            }

            await axios({
                method: 'post',
                url: `${config.apiUrl}/changePassword`,
                data: data,
                headers: { "Authorization": this.loginData?.Token },
            })
                .then(result => {

                    if (result.data.success === true) {

                        toast.success(result.data.msg, {
                            position: toast.POSITION.TOP_CENTER
                        });
                        setTimeout(() => {
                            window.location.href = `${config.baseUrl}login`
                            Cookies.remove('loginSuccess');

                        }, 1500);
                    }
                    else if (result.data.success === false) {
                        toast.error(result.data.msg, {
                            position: toast.POSITION.TOP_CENTER
                        });
                    }

                }).catch(err => {
                    console.log(err);
                    if (err == 'Error: Request failed with status code 403') {
                        toast.error('Session expired please re-login')
                    }

                });
        }
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
                <body class="crypt-dark">

                    <Header />
                    <ToastContainer />
                    <br />
                    <br />
                    <br />
                    <br />
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-3 col-md-2"></div>
                            <div class="col-lg-6 col-md-8">
                                <div class="cryptorio-forms cryptorio-forms-dark text-center pt-2 pb-4">
                              
                                    <h3 class="p-4">Change Login Password</h3>
                                    <div class="cryptorio-main-form">
                                        <form action="" class="text-left">
                                           
                                            <label for="email">Old Password </label>
                                            <div className='form-group d-flex'>
                                            <input type="password" id="password" name="currentpassword" className='changePassword' placeholder="Old password" onChange={this.handleChange} value={this.state.currentpassword} />
                                            </div>
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

                                            <input type="submit" onClick={this.wordAPI} value="Confirm Change" class="crypt-button-red-full" />
                                        </form>
                                     
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-2"></div>
                        </div>
                    </div>
                    <Footer />
                </body>
            </>
        )
    }
}