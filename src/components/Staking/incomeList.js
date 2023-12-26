import React, { Component } from 'react';
import Header from '../../directives/header'
import axios from 'axios'
import config from '../../config/config'
import Cookies from 'js-cookie';
import ReactDatatable from '@ashvin27/react-datatable'
import 'react-confirm-alert/src/react-confirm-alert.css';
import toast, { Toaster } from 'react-hot-toast';
import Footer from '../../directives/footer';
export default class incomelist extends Component {
    constructor(props) {
        super(props)
        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));

        const { match: { params } } = this.props;
        this.id = params.id

        this.state = {
            token_amount: '',
            usd_amount: '',
            staking_period_id: '0',
            tokenPriceInUSD: 0,
            userIsClaim: 0,
            tokenPrice: 0,
            spinLoader: '0',
            claimAmount: 0,
            min_stakingclaim_amount: 0,
            sumtokenamount: 0,
            getStakingIncomeList: [],
            totalReemed: 0,
            isClaim: 0,
            getStakingPeriod: []
        };

        this.columns = [
            {
                key: "amount",
                text: "Amount",
            },

            {
                key: "usd_amount",
                text: "Amount($)",
                cell: (item) => {
                    return (
                        <span>${parseFloat(item.usd_amount).toFixed(6)}</span>
                    );
                }
            },

            {
                key: "created_date",
                text: "Date",
                cell: (item) => {
                    return (
                        <span>{item.created_date}</span>
                    );
                }
            },

        ];

        this.config = {
            page_size: 10,
            length_menu: [10, 20, 50],
            show_filter: true,
            show_pagination: true,
            pagination: 'advance',
            button: {
                excel: false,
                print: false

            }
        }


    }

    componentDidMount() {
        this.getStakingListIncomeAPI();
        this.getTokenPriceAPI()
        this.getUserProfile()
        this.getStakingListAPI()
    }

    async getUserProfile() {
        await axios({
            method: 'post',
            url: `${config.apiUrl}getuserprofile`,
            data: { "email": this.loginData.data.user_email, "user_id": this.loginData.data?.id },
            headers: { "Authorization": this.loginData?.Token },
        }).then(response => {
            if (response.data.success === true) {
                this.setState({
                    userIsClaim: response.data.response.is_claim,
                })
            }
        })
    }

    async getTokenPriceAPI() {
        await axios({
            method: 'post',
            url: `${config.apiUrl}getfeeDetails`,
            data: { "email": this.loginData.data.user_email, "user_id": this.loginData.data?.id },
            headers: { "Authorization": this.loginData?.Token },
        }).then(response => {
            if (response.data.success === true) {
                this.setState({
                    tokenPrice: parseFloat(response.data.response.token_price),
                    min_stakingclaim_amount: response.data.response.min_stakingclaim_amount,
                    tokenPriceInUSD: parseFloat(1 / response.data.response.token_price)
                })

            }
        })
    }

    async claimHandler(e) {
        e.preventDefault()
        if (this.loginData.data.user_email != 'vijeta.espsofttech@gmail.com' && parseFloat(this.state.claimAmount * this.state.tokenPrice).toFixed(2) < this.state.min_stakingclaim_amount) {
            toast.error(`Minimum redeem amount ${this.state.min_stakingclaim_amount} USD`)
        } else {
            const token_amount = parseFloat(parseFloat(this.state.sumtokenamount / 2) - parseFloat(this.state.totalReemed)).toFixed(2)
            const usd_token_amount = token_amount * this.state.tokenPrice
            await axios({
                method: 'post',
                url: `${config.apiUrl}updateStakingdailyIncome`,
                data: { 'email': this.loginData.data.user_email, token_amount: parseFloat(token_amount), usd_amount: usd_token_amount, "user_id": this.loginData.data.id, 'staking_id': this.id },
                headers: { "Authorization": this.loginData?.Token },
            }).then(response => {
                if (response.data.success === true) {
                    toast.success(response.data.msg)
                }
                this.componentDidMount()
            })
        }
    }

    async getStakingListAPI() {
        await axios({
            method: 'post',
            url: `${config.apiUrl}getStakingList`,
            data: { 'email': this.loginData.data.user_email, "user_id": this.loginData.data.id },
            headers: { "Authorization": this.loginData?.Token },
        }).then(response => {
            if (response.data.success === true) {
                const filters = response.data.response.filter(item => item.id == this.id)
                this.setState({
                    isClaim: filters[0].is_claim
                })

            }
        })
    }

    async getStakingListIncomeAPI() {
        await axios({
            method: 'get',
            url: `${config.apiUrl}/getStakingIncomeList?user_id=${this.loginData.data.id}&staking_id=${this.id}`,
            headers: { "Authorization": this.loginData?.Token },
        }).then(response => {
            if (response.data.success === true) {
                this.setState({
                    getStakingIncomeList: response.data.response,
                })

            }
        })
    }

    render() {
        return (
            <>
                <Header />
                <Toaster />
                <div className='container'>
                    <div className='bankdetail-table mb-5' id="bank_detail">
                        <h2 className="p-2 ml-3 Appheading">Income List</h2>
                        <ReactDatatable
                            config={this.config}
                            records={this.state.getStakingIncomeList}
                            columns={this.columns}
                        />
                    </div>
                </div>


                <Footer />
            </>
        )
    }
}