import React, { Component, useState, Fragment, useEffect } from 'react';
import config from "../../config/config";
import ReactDatatable from '@ashvin27/react-datatable'
import Header from '../../directives/header';
import Footer from '../../directives/footer';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import copy from "copy-to-clipboard";


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

const loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));

const Staking = () => {

    const [form, setForm] = useState({ referralLink: '', Explation: '' })
    const [error, setError] = useState([])
    const [referralList, setReferrralList] = useState([])
    const [webcontentlist, setWebcontent] = useState({})

    useEffect(() => {
        getReferralIncomeList()
        getProfile()
        getWebContentData()
    }, [])

    const getWebContentData = () => {

        let headers = {
            'Authorization': loginData?.Token,
            'Content-Type': 'application/json'
        }
        axios.get(`${config.apiUrl}/getwebcontent`, {}, { headers: headers })
            .then(response => {

                if (response.data.success === true) {
                    setWebcontent(response.data.response)
                }

                else if (response.data.success === false) {

                }
            })

            .catch(err => {
            })

    }

    const getProfile = async () => {

        await axios({
            method: 'post',
            url: `${config.apiUrl}/getProfileData`,
            headers: { "Authorization": loginData?.Token },
            data: { 'user_id': loginData.data?.id, email: loginData?.data.user_email }
        })
            .then(result => {
                setForm((form) => {
                    return { ...form, ['referralLink']: `${config.websiteUrl}exc/signup/${result.data.response.referral_code}` }
                })
            })
            .catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                }
            })
    }

    const getReferralIncomeList = async () => {
        const res = await axios.get(`${config.apiUrl}/getReferralIncome?user_id=${loginData.data?.id}`)
        if (res.data.success == true) {
            setReferrralList(res.data.response)
        }
    }


    const columns = [
        {
            key: "referral_by",
            text: "Referred by",
            className: "name",

        },
        {
            key: "amount",
            text: "Amount",
            className: "name",
            cell: record => {
                return parseFloat(record.trx_type==6?record.usd_amount:record.amount).toFixed(12)
            }

        },
        {
            key: "symbol",
            text: "Symbol",
            className: "address",

        },
        {
            key: "referral_level",
            text: "Level",
            className: "address",

        },
        {
            key: "referral_percent",
            text: "Percentage",
            className: "postcode",

        },

    ];

    const copyToClipboard = (e) => {
        copy(form.referralLink);
        alert(`You have copied "${form.referralLink}"`);
    }

    const createMarkup = () => {
        return { __html: webcontentlist.referral_content };
    }


    return (
        <>
            <Header />
            <section className='personal-setting'>
                <div className="container py-5">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="stak-haed pt-5">
                                <h2>Referral Earning</h2>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="content-area  card bg-shadow">
                                <div className="card-innr">
                                    <div className="tab-content" id="profile-details">
                                        <div className="tab-pane fade show active" id="personal-data2">
                                            <form ><div className="row">

                                                <div className="col-md-12">
                                                    <div className="input-item input-with-label">
                                                        <label className="input-item-label">Referral link</label>
                                                        <input className="input-bordered " type="text" disabled id="" value={form.referralLink.replace('.exchange', '...')} name="referralLink" style={{ paddingRight: "35px" }} />
                                                        <i className='fa fa-copy icon-profile' onClick={e => copyToClipboard(e)} />
                                                        <a href={`mailto:?subject=${form.referralLink.replace('.exchange', '...')}&body=<BODY>`}><i className='fa fa-share-alt icon-profile' ></i></a>
                                                        {error.length > 0 && error[0].name == 'usd_amount' ? <div><span className='alert_validation'>{error[0].err}</span></div> : ''}
                                                    </div>
                                                </div>

                                                <div className="col-md-12">
                                                    <div className="input-item input-with-labels">
                                                        <label className="input-item-label">Explanation</label>

                                                        <div dangerouslySetInnerHTML={createMarkup()} />

                                                    </div>
                                                </div>
                                            </div>
                                                <div className="gaps-1x"></div>

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
                                                    records={referralList}
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