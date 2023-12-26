
import React, { Component } from 'react';

import axios from 'axios';
import Header from '../directives/header'
import Footer from '../directives/footer'
import Cookies from 'js-cookie';
import config from '../config/config'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import DeviceDetector from "device-detector-js";

const headers = {
    'Content-Type': 'application/json'
 };
 
export default class support extends Component {

    constructor(props){
        super(props);
        this.state={
            email : '',
            password : ""
        };
    
    }

    
    componentDidMount() {
     
    }
    render() {
        return (    

            

<>


              <div className="container">
              
        <div className="row">
            
            <Header />
            <div className="col-md-3"></div>
            <div className="col-md-6" style={{marginTop:'50px'}}>
                <div className="cryptorio-forms cryptorio-forms-dark text-center pt-5 pb-5">
                    <ToastContainer/>
                    <div className="logo"> 
                     {/* <img src="images/main-logo-header.png" alt="logo-image"/> */}
                    </div>
                    <h3 className="p-4">Login</h3>
                    <div className="cryptorio-main-form" id="login-bg">
                        <form onSubmit={this.handleSubmit} className="text-left">
                            <label for="email">Account Name</label>
                            <input type="text" id="email" name="email" placeholder="Your Email" onChange={this.handleChange}  value={this.state.email}/>
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" placeholder="Please Input Your Password" onChange={this.handleChange} value={this.state.password}/>

                            <input type="submit"  value="Log In" className="crypt-button-red-full"/>
                        </form>
                        <p className="float-left"><a href={`${config.baseUrl}signup`}>Sign Up</a></p>
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