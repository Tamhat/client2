import React, { Component } from 'react';
import axios from 'axios';
import config from '../../config/config'
import Cookies from 'js-cookie';
import Header from '../../directives/header';
import Footer from '../../directives/footer';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
var QRCode = require('qrcode.react');

const headers = {
    'Content-Type': 'application/json'
};

export default class ReferralUserList extends Component {

    constructor(props) {
        super(props);
        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
        this.state = {
            ReferralUsersList: [],
        }
    }

    componentDidMount() {
        if (!Cookies.get('loginSuccess')) {
            window.location.href = `${config.baseUrl}login`
            return false;
        }
        this.getReferralLIst()
    }

    async getReferralLIst() {
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }
        const response = await axios.post(`${config.apiUrl}/getReferraluserList`,{ email: this.loginData.data?.user_email, user_id: this.loginData.data?.id }, { headers: headers })
        if (response.data.success == true) {
            this.setState({ ReferralUsersList: response.data.response })
        }
    }


    render() {

        return (
            <>
                <Header />

                <ToastContainer />

                <div class="container pt-4">

                    <h1 className="History headerMarginWallet">

                        <div className='row fund_row'>
                            <div className='col-sm-12'>
                                <Tabs>
                                    <TabList>
                                        <div className='row'>
                                            <div className='col-lg-6 col-md-6 mb-3'>
                                                <h3>My Referral Users</h3>
                                            </div>
                                            <div className='col-lg-6 col-md-6 text-right mb-3'>
                                            </div>
                                        </div>
                                    </TabList>

                                    <TabPanel>
                                        <div class="container withdraw-history pl-0 pr-0">
                                            <table class="table table-striped table-responsive-sm mt-0">
                                                <thead>
                                                    <tr style={{ paddingBottom: "10" }}>

                                                        <th scope="col">Name</th>
                                                        <th scope="col">E-mail</th>

                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.ReferralUsersList.map(item => (
                                                        <tr>
                                                            <td>{item.username}</td>
                                                            <td>{item.email}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabPanel>

                                </Tabs>

                            </div>

                        </div>

                    </h1>
                </div>

                <div className="modal fade" id="exampleModals" tabindex="-1" aria-labelledby="exampleModalLabels" aria-hidden="true">

                    <div className="steps" >
                        <div className="row">

                            <div className="col-12">
                                <div className="modal-dialog modal-dialog-centered" id="personal_model">
                                    <div className="modal-content" >
                                        <div className="modal-header">
                                            <h5 className="modal-title text-center" id="exampleModalLabels">Add Coin/Token for listing</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">

                                            <div className="wrapper">

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Token/Coin Name</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <input type="text" className="form-control" name="coin_name" onChange={e => this.handleChange(e)} value={this.state.coin_name} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Symbol</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <input type="text" className="form-control" name="coin_symbol" onChange={e => this.handleChange(e)} value={this.state.coin_symbol} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Icon</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">

                                                            </div>
                                                            <input type="file" name='coin_icon' onChange={e => this.handleImagePreviewAvatar1(e)} className="form-control" aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Ethereum Contract</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <input type="text" className="form-control" name="eth_contract" onChange={e => this.handleChange(e)} value={this.state.eth_contract} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Binance Contract</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <input type="text" className="form-control" name="bnb_contract" onChange={e => this.handleChange(e)} value={this.state.bnb_contract} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" onClick={e => this.addCoin(e)} className="btnNext btn btn-outline-success">Confirm</button>
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
