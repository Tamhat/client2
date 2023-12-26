import React, { Component } from 'react';
import Header from './directives/header'
import Footer from './directives/footer'
import config from './config/config'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
const headers = {
    'Content-Type': 'application/json'
};
export default class moreAnnouncement extends Component {

    constructor(props) {
        super(props)
        this.state = {
            notification_list: [],
            userorder: [],
            devicelistData: [],
            TotalBalanceIUSD: 0,
            getData: '',
            showMe: true
        }
        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));

        this.notificationDetails = this.notificationDetails.bind(this)

    }


    componentDidMount() {
        if (!Cookies.get('loginSuccess')) {
            window.location.href = `${config.baseUrl}`
            return false;
        }

        this.notificationDetails();
    }

    async notificationDetails() {

        await axios.get(`${config.apiUrl}/getusernotification`, {}, { headers })
            .then(result => {

                if (result.data.success === true) {
                    this.setState({
                        notification_list: result.data.response
                    })
                }

                else if (result.data.success === false) {

                }
            })

            .catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                }
            })
    }
    render() {

        return (
            <>
                <Header />
                <div class="container-fluid">
                    <div class="row sm-gutters" style={{ marginBottom: "20px" }}>
                        <div class="col-12 col-md-8">
                            <div>
                                <div class="crypt-market-status_more mt-4" style={{ wordBreak: "break-all" }}>
                                    <div class="balance-detail">
                                        <div class="row">
                                            <div class="col-sm-6">
                                                <h4 class="pt-2 pb-2 pl-2">Announcement</h4>
                                            </div>
                                            <div class="col-sm-6 text-right">
                                            </div>
                                        </div>

                                    </div>
                                    {this.state.notification_list.map(item => (

                                        <div class="Announcement-list">
                                            <a data-bn-type="link" href="javascript:void(0)" rel="noopener noreferrer" text-decoration="none" class="">
                                                <div class="LinesEllipsis  ">{item.title} : {item.description} <wbr />
                                                </div>
                                                <div class="text-right">{item.datetime.slice(0, 10)}</div></a>

                                        </div>

                                    ))}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />                            {/* <!-- Modal --> */}
            </>
        )
    }
}