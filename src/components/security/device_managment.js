import React, { Component } from 'react';
import Header from '../../directives/header'
import Footer from '../../directives/footer'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import axios from 'axios';
import config from '../../config/config'

export default class DeviceManagment extends Component {

    constructor(props) {
        super(props)
        this.state = {
            devicelistData: []
        }

        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
    }
    componentDidMount() {
        if (!Cookies.get('loginSuccess')) {
            window.location.href = `${config.baseUrl}`
            return false;
        }
        this.DeviceList();
    }


    async DeviceList() {
        axios({
            method: 'post',
            url: `${config.apiUrl}/getDeviceDetail`,
            headers: { "Authorization": this.loginData?.Token },
            data: { "user_id": this.loginData.data.id, }
        }).then(response => {
            if (response.data.success === true) {
                this.setState({
                    devicelistData: response.data.response
                })

            }
        })
    }


    render() {

        return (
            <>
                <body className="crypt-dark">
                    <br />
                    <br />
                    <br />
                    <br />

                    <Header />
                    <ToastContainer />
                    <div class="container">
                        <div class="row">
                            <h1 class="History">Device Management</h1>
                        </div>
                        <div class="row sm-gutters pt-5">
                            <p className="mt-3">These devices are currently allowed to access your account</p>

                            <div class="col-lg-12 p-0">
                             
                                <div>
                                    <div class="crypt-market-status_device">
                                        <div>
                                         

                                            {/* <!-- Tab panes --> */}
                                            <div class="tab-content">
                                                <div role="tabpanel" class="tab-pane active" id="closed-orders">
                                                    <div class="row sm-gutters">
                                                        <div class="col-12 col-sm-12 col-md-12">
                                                            <div class="crypt-market-status_manage mt-4">
                                                                <div>


                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <table class="table table-striped table-responsive-sm">
                                                        <thead>
                                                            <tr>
                                                                <th scope="col">Device</th>
                                                                <th scope="col">Date</th>
                                                                <th scope="col">Location</th>
                                                                <th scope="col">IP Address</th>

                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {this.state.devicelistData.map(item => (

                                                                <tr>

                                                                    <td>{item.browsername} {item.browserversion}</td>
                                                                    <td>{item.datetime}</td>
                                                                    <td>{item.city} {item.country}</td>
                                                                    <td>{item.ip_address}</td>

                                                                </tr>
                                                            ))}

                                                        </tbody>
                                                    </table>

                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <br /><br />


                    <Footer />
                </body>
            </>
        )

    }
}