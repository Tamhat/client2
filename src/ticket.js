import React, { Component } from 'react';

import axios from 'axios';
import Header from './directives/header'
import Footer from './directives/footer'
import Cookies from 'js-cookie';
import config from './config/config'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { Link } from 'react-router-dom'
import ReactDatatable from '@ashvin27/react-datatable'
import ReactReadMoreReadLess from "react-read-more-read-less";
import Swal from 'sweetalert2'
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            title: '',
            Reason: "",
            users_list: []
        };

        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));

        this.columns = [

            {
                key: '#',
                text: 'Sr. No.',
                cell: (row, index) => index + 1
            },
            {
                key: "Ticket_number",
                text: "Number",
                sortable: true
            },
            {
                key: "title",
                text: "Title",
                sortable: true
            },
            {
                key: "reason",
                text: "Reason",
                sortable: true,
                cell: (item) => {
                    return (
                        <Tooltip title={item.reason} arrow enterTouchDelay={0}>
                            <Button style={{ color: '#fff' }}>{item.reason.substring(0, 5) + '...'}</Button>
                        </Tooltip>
                    )
                }
            },
            {
                key: "datetime",
                text: "Date",
                cell: (item) => {
                    return (
                        item.datetime.slice(0, 10)
                    );
                }
            },
            {
                key: "status",
                text: "Action",
                cell: (item) => {
                    return (
                        <>
                            {item.status === 0 ?
                                <>
                                    <p style={{ color: '#ffff00e3', display: "inline-block" }}>Pending</p>
                                    <a href={`${config.baseUrl}chat/${item.Ticket_number}`} data-toggle="tooltip" data-original-title="" style={{ margin: "20px" }} >
                                        <button type='button' className="btn-info" onClick={e => window.location.href = `${config.baseUrl}chat/${item.Ticket_number}`}>Chat</button>

                                    </a>

                                </>
                                : item.status === 1 ?
                                    <p style={{ color: 'green' }}>Closed</p> :
                                    item.status === 2 ?
                                        <p style={{ color: '#ff0e0ee0' }}>Rejected</p> :
                                        ''
                            }




                        </>
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
            },

        }

    }

    loading() {
        setTimeout(() => {
            window.location.reload()
        });
    }


    componentDidMount() {
        this.userDetails();
    }


    async userDetails() {

        var data = {
            user_id: this.loginData.data.id,
            "email": this.loginData?.data.user_email
        }
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }

        await axios.post(`${config.apiUrl}/getticket`, data, { headers: headers })
            .then(result => {

                if (result.data.success === true) {
                    this.setState({
                        users_list: result.data.response
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


    handleSubmit = event => {
        event.preventDefault();

        var data = {
            user_id: this.loginData.data.id,
            "email": this.loginData?.data.user_email,
            'user_id': this.loginData.data?.id,
            title: this.state.title,
            reason: this.state.reason
        }

        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }

        axios.post(`${config.apiUrl}/insertticket` + '?nocache=' + new Date().getTime(), data, { headers: headers })
            .then(async result => {

                if (result.data.success === true) {

                    await Swal.fire({
                        title: result.data.msg,
                        //   text: 'Login successful!',
                        icon: 'success',
                        width: 500,
                        confirmButtonColor: '#3085d6',
                        allowOutsideClick: false,
                        // showCancelButton: true,
                        confirmButtonText: 'Continue',
                        confirmButtonColor: "#e4d923",
                        // cancelButtonText: 'No, keep it'
                    });
                    this.setState({
                        title: '',
                        reason: ""
                    })
                    this.userDetails();
                }









            }).catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                } else {
                    this.setState({
                        msg: err.response.data?.msg
                    })
                }
                // toast.error(, {
                // position: toast.POSITION.TOP_CENTER
                // })
            })







    }

    
    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value,
            msg: ''
        })
    }



    render() {
        return (
            <>
              
                <div className="container">
                    <div className="row">
                        <Header />
                       
                        <div className="col-lg-3 col-md-2"></div>
                        <div className="col-lg-6 col-md-8" style={{ marginTop: '50px' }}>
                            <div className="cryptorio-forms cryptorio-forms-dark AppFormLeft text-center pt-3 pb-5">
                                <ToastContainer />
                                <div className="logo">
                                   
                                </div>
                                <h3 className="p-3">Ticket</h3>
                                <div className="cryptorio-main-form -form" id="login-bg">
                                    <form onSubmit={this.handleSubmit} className="text-left">
                                        <label for="email">Title Name</label>
                                        <input type="text" id="email" className='input-control' name="title" placeholder="Your Title" onChange={this.handleChange} value={this.state.title} required />
                                        <label for="password">Query</label>
                                        <textarea type="text" id="password" className='input-control' name="reason" placeholder="Enter you Query" onChange={this.handleChange} value={this.state.reason} required />
                                        <p style={{ textAlign: 'left', color: 'red' }}   >{this.state.msg} </p>
                                        <input type="submit" value="Submit" className="crypt-button-red-full" />
                                    </form>
                                </div>
                            </div>

                        </div>
                        <h5>Users</h5>

                    </div>
                    <div className="card-block -table mb-5 pb-5">
                        <div className="table-responsive">
                            <ReactDatatable
                                config={this.config}
                                records={this.state.users_list}
                                columns={this.columns}
                            />
                        </div>
                        <div className="col-md-3"></div>
                    </div>
                </div>
                <Footer />

            </>
        )
    }
}
