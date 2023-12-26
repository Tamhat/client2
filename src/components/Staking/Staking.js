import React, { Component, useState, Fragment, useEffect } from 'react';
import config from "../../config/config";
import ReactDatatable from '@ashvin27/react-datatable'
import Header from '../../directives/header';
import Footer from '../../directives/footer';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import moment from 'moment';
import { confirmAlert } from 'react-confirm-alert';

const configtable = {
    page_size: 10,
    length_menu: [10, 20, 50],
    show_pagination: true,
    pagination: 'advance',
    button: {
        // excel: true,
        // print: true,
        //  extra: true,
    }
}



const Staking = () => {
    const loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
    const [stakingRecords, setstakingRecords] = useState([{ amount: 3, period: 3, percentage: 5, income: 6, date: '06-05-2022' }])
    const [stakingPeriod, setstakingPeriod] = useState([])
    const [allstakingPeriod, setallstakingPeriod] = useState([])
    const [form, setForm] = useState({ amount: 0, period_id: 0, staking_duration: 0, user_id: loginData.data?.id, email: loginData.data?.user_email, coin_id: 0 })
    const [coinList, setcoinList] = useState([])
    const [error, setError] = useState([])
    const [loader, setLoader] = useState(false)
    const [Walletdata, setWalletdata] = useState([])

    useEffect(() => {

        if (loginData) {
            // getStakingPeriodBycoin()
            coinsList()
            getStakingPeriod()
            getstakingList()
        }

    }, [])

    // console.log('loginDataloginData',loginData)

    const getstakingList = async () => {
        let headers = {
            'Authorization': loginData?.Token,
            'Content-Type': 'application/json'
        }
        const getres = await axios.get(`${config.apiUrl}/getStakingData?user_id=${loginData.data?.id}`, { headers: headers })
        if (getres.data.success == true) {
            setstakingRecords(getres.data.response)
        }

    }

    const getStakingPeriodBycoin = async (coinid) => {
        const result = await axios.get(`${config.apiUrl}/getStakingPeriodbyCoin?coin_id=${coinid}`, {})
        if (result.data.success == true) {
            setstakingPeriod(result.data.response)
            setForm((form) => {
                return { ...form, ['period_id']: result.data.response[0].period_id }
            })

        }else{
            setForm((form) => {
                return { ...form, ['period_id']: 0 }
            })  
        }
    }

    const getStakingPeriod = async () => {
        const result = await axios.get(`${config.apiUrl}/getStakingPeriod`, {})
        if (result.data.success == true) {
            setallstakingPeriod(result.data.response)
            // setForm((form) => {
            //     return { ...form, ['period_id']: result.data.response[0].period_id }
            // })

        }
    }

    const handlerChange = (e) => {
        const { name, value } = e.target

        if (name == 'coin_id') {
            getStakingPeriodBycoin(value)
        }

        // console.log('name,value', name, value)
        setForm((form) => {
            return { ...form, [name]: value }
        })
    }


    const coinsList = async () => {
        setLoader(true)
        await axios({
            method: 'post',
            url: `${config.apiUrl}/userwallet`,
            headers: { "Authorization": loginData?.Token },
            data: { 'user_id': loginData.data?.id, "email": loginData?.data.user_email }
        })
            .then(result => {

                if (result.data.success === true) {
                    setcoinList(result.data.response)
                    setForm((form) => {
                        return { ...form, ['coin_id']: result.data.response[0].id }
                    })
                    getStakingPeriodBycoin(result.data.response[0].id)
                    setWalletdata(result.data.response)
                    setLoader(false)
                }

                else if (result.data.success === false) {
                    toast.error(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                    setLoader(false)
                }
            })

            .catch(err => {

                toast.error(err.result?.data?.msg, {
                    position: toast.POSITION.TOP_CENTER
                })
                setLoader(false)
            })
    }

    const validateForm = () => {
        let errors = [];

        let checkPeriod = []
        checkPeriod = stakingPeriod.filter(item => item.period_id == form.period_id)

        if (form.coin_id == 0) {
            errors.push({ name: 'coin_id', err: "Coin Symbol is Required!" });
        }

        if (form.amount == 0) {
            errors.push({ name: 'amount', err: "Enter Amount Required!" });
        }

        if (form.period_id == 0) {
            errors.push({ name: 'period_id', err: "Select Staking Period is Required!" });
        }

        if (form.staking_duration == 0) {
            errors.push({ name: 'staking_duration', err: "Select Staking Duration is Required!" });
        }

        if (checkPeriod.length > 0) {
            if (parseFloat(form.staking_duration) < parseFloat(checkPeriod[0].duration_from) || parseFloat(form.staking_duration) > parseFloat(checkPeriod[0].duration_to)) {
                errors.push({ name: 'staking_duration', err: "Select Staking Duration According  Selected Period!" });
            }
        }



        if (errors.length > 0) {

            setError(errors)

            return false;
        }
        setError([])
        return true;
    }

    const addStaking = async (e) => {
        e.preventDefault()
        const isvalid = validateForm()
        if (!isvalid) {
        } else {
            let headers = {
                'Authorization': loginData?.Token,
                'Content-Type': 'application/json'
            }

            const response = await axios.post(`${config.apiUrl}/addStaking`, form, { headers: headers })
            // console.log('response', response)
            if (response.data.success == true) {
                toast.success(response.data.msg, {
                    position: toast.POSITION.TOP_CENTER
                });
                setForm({ amount: 0, period_id: 0, staking_duration: 0, user_id: loginData.data?.id, email: loginData.data?.user_email })
                setError([])

            } else if (response.data.success == false) {
                toast.error(response.data.msg, {
                    position: toast.POSITION.TOP_CENTER
                });
                setForm({ amount: 0, period_id: 0, staking_duration: 0, user_id: loginData.data?.id, email: loginData.data?.user_email })
                setError([])
            }
            // getStakingPeriodBycoin()
            coinsList()
            getstakingList()
        }

    }

    // console.log('allstakingPeriod',allstakingPeriod)
    const columns = [
        {
            key: "amount",
            text: "Amount",
            className: "name",
            align: "left",

        },
        {
            key: "period",
            text: "Period",
            className: "name",
            align: "left",
            cell: record => {
                return (
                    <div className="users">
                        {allstakingPeriod && allstakingPeriod.length > 0 && allstakingPeriod.filter(items => items.id== record.period_id).map((item) => (
                            <div className="user"> {item.duration_from == 181 ? '5 Montn' : item.duration_from == 365 ? '1 Year' : item.duration_from == 731 ? '2 Year' : item.duration_from == 1096 ? '3 Year' : item.duration_from == 1461 ? '4 Year' : `${item.duration_from} Days`}
                                -
                                {item.duration_to == 180 ? '5 Month' : item.duration_to == 364 ? '11 Month' : item.duration_to == 730 ? '2 year' : item.duration_to == 1095 ? '3 year' : item.duration_to == 1460 ? '4 year' : item.duration_to == 2920 ? '5 year' : `${item.duration_to} Days`}</div>
                        ))}
                    </div>
                );
            }

        },
        {
            key: "percentage",
            text: "Percentage",
            className: "address",
            align: "left",

        },
        {
            key: "staking_duration",
            text: "Duration",
            className: "address",
            align: "left",

        },
        {
            key: "income",
            text: "Income",
            className: "postcode",
            cell: record => {
                return (
                    record.totalIncome == null ? 0 : parseFloat(record.totalIncome).toFixed(5)
                )
            }

        },
        {
            key: "date",
            text: "Date",
            className: "rating",
            align: "left",
            cell: record => {
                return (
                    moment(record.date).format('YYYY-MM-DD')
                )
            }

        },
        {
            key: "coin_symbol",
            text: "Coin",
            className: "rating",
            align: "left",

        },

        {
            key: "action",
            text: "Action",
            className: "action",
            width: 100,
            align: "left",

            cell: record => {
                return (
                    <>
                        {record.status == 1 ?

                            <button className="btn btn-primary btn-sm" onClick={e => withdrawincome(e, record)}>Withdraw</button>

                            : <kbd class="bg-success">Complete</kbd>
                        }
                        &nbsp;&nbsp;


                    </>
                );
            }
        }
    ];


    const withdrawincome = async (e, data) => {
        let headers = {
            'Authorization': loginData?.Token,
            'Content-Type': 'application/json'
        }
        confirmAlert({
            title: 'Confirm to submit',
            message: 'Are you sure and want to Withdraw or Break staking',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () =>
                        await axios.post(`${config.apiUrl}/withdrawStakingIncome`, { email: loginData.data?.user_email, staking_id: data.id, user_id: data.user_id }, { headers: headers })
                            .then(result => {

                                if (result.data.success === true) {
                                    toast.success(result.data.msg, {
                                        position: toast.POSITION.TOP_CENTER
                                    });

                                    getstakingList()
                                    coinsList()
                                    setForm({ amount: 0, period_id: 0, staking_duration: 0, user_id: loginData.data?.id, email: loginData.data?.user_email, coin_id: 0 })
                                }

                                else if (result.data.success === false) {

                                }
                            })

                            .catch(err => {
                                if (err == 'Error: Request failed with status code 403') {
                                    toast.error('Session expired please re-login')
                                }
                            })
                },
                {
                    label: 'No',
                }
            ]
        });


    }

    return (
        <>
            <Header />
            <section className='personal-setting'>
                <div className="container py-5">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="stak-haed pt-5">
                                <h2>Staking Earning</h2>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="content-area  card bg-shadow">
                                <div className="card-innr">
                                    <div className="tab-content" id="profile-details">
                                        <div className="tab-pane fade show active" id="personal-data2">
                                            <form onSubmit={e => addStaking(e)}><div className="row">
                                                <div className="col-md-12">
                                                    <div className="input-item input-with-label">
                                                        <label className="input-item-label">Staking Coin</label><label className='pl-5'>Balance:{Walletdata.length > 0 ? Walletdata.find(item => item.id == form.coin_id)?.balance : ''}</label>
                                                        <select onChange={e => handlerChange(e)} name="coin_id" className="form-control">
                                                            {form.coin_id == 0 ? <option value={0} name='coin_id'>Staking Coins Loading...</option> :
                                                                coinList && coinList.length > 0 && coinList.map(item => {
                                                                    return (
                                                                        <option selected={form.coin_id==item.id} value={item.id} name='coin_id'>
                                                                            {item.symbol}
                                                                        </option>
                                                                    )
                                                                })}

                                                        </select>
                                                        {error.length > 0 && error[0].name == 'coin_id' ? <div><span className='alert_validation'>{error[0].err}</span></div> : ''}

                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="input-item input-with-label">
                                                        <label className="input-item-label">Amount</label>
                                                        <input className="input-bordered" type="number" onChange={e => handlerChange(e)} id="" value={form.amount} name="amount" />
                                                        {error.length > 0 && error[0].name == 'amount' ? <div><span className='alert_validation'>{error[0].err}</span></div> : ''}
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="input-item input-with-label">
                                                        <label className="input-item-label">Staking period (APR)</label>
                                                        <select onChange={e => handlerChange(e)} name='period_id' className="form-control">
                                                            {form.period_id == 0 ? <option value={form.period_id} name='period_id'>Select staking period</option> :
                                                                stakingPeriod && stakingPeriod.length > 0 && stakingPeriod.map(item => {
                                                                    return (
                                                                        <option value={item.period_id} >
                                                                            {item.duration_from == 181 ? '5 Montn' : item.duration_from == 365 ? '1 Year' : item.duration_from == 731 ? '2 Year' : item.duration_from == 1096 ? '3 Year' : item.duration_from == 1461 ? '4 Year' : `${item.duration_from} Days`}
                                                                            -
                                                                            {item.duration_to == 180 ? '5 Month' : item.duration_to == 330 ? '11 Month' : item.duration_to == 730 ? '2 year' : item.duration_to == 1095 ? '3 year' : item.duration_to == 1460 ? '4 year' : item.duration_to == 2920 ? '5 year' : `${item.duration_to} Days`}
                                                                            ({parseFloat(item.percentage).toFixed(6)}%)
                                                                        </option>
                                                                    )
                                                                })}


                                                        </select>
                                                        {error.length > 0 && error[0].name == 'period_id' ? <div><span className='alert_validation'>{error[0].err}</span></div> : ''}

                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="input-item input-with-label">
                                                        <label className="input-item-label">Duration in Day</label>
                                                        <input className="input-bordered" type="text" onChange={e => handlerChange(e)} id="" value={form.staking_duration} name="staking_duration" />
                                                        {error.length > 0 && error[0].name == 'staking_duration' ? <div><span className='alert_validation'>{error[0].err}</span></div> : ''}

                                                    </div>
                                                </div>

                                            </div>
                                                <div className="gaps-1x"></div>
                                                <div className="d-sm-flex justify-content-between align-items-center">
                                                    <button className="btn btn-primary btn-reset w-100 mt-3" disabled="" id="staking_btn">Staking</button>
                                                    <div className="gaps-2x d-sm-none">
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className='content-area'>
                                <div className=' staking'>

                                    <div className='row'>
                                        <div className="card-block">
                                            <div className="table-responsive">
                                                <ReactDatatable
                                                    config={configtable}
                                                    records={stakingRecords}
                                                    columns={columns}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}


export default Staking