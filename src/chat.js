import React, { Component } from 'react';

import axios from 'axios';
import Header from './directives/header'
import Footer from './directives/footer'
import Cookies from 'js-cookie';
import config from './config/config'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import socketIOClient from "socket.io-client";
import ReactDatatable from '@ashvin27/react-datatable'
import moment from 'moment'
import Swal from 'sweetalert2'
const ENDPOINT = config.socketUrl;
const socket = socketIOClient(ENDPOINT, { transports: ['websocket', 'polling', 'flashsocket'] });


export default class Ticket extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sendmessage: '',
            message: []
        };

        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));

        this.userChat = this.userChat.bind(this);

        const { match: { params } } = this.props;
        this.ticket_id = params.id



    }

    componentDidMount() {

        const username = this.loginData.data?.user_name
        const user_id = this.loginData.data?.id

        socket.on("connect", () => {
        })

        socket.emit('joinRoom', JSON.stringify({
            username: username,
            user_id: user_id,
            room: this.ticket_id
        }));

        socket.on('roomUsers', ({ room, users, chatHistory }) => {
            console.log(room)
            console.log(users)
            if (chatHistory) {
                this.setState({
                    message: chatHistory
                })
            }
            console.log(chatHistory)


        });

        socket.on('message', (message) => {
            console.log('adminmessage', message);
            this.setState({
                message: message.text,
                sendmessage: ''
            })

            // Scroll down

        });

    }


    async userChat(e) {
        e.preventDefault()
        var data = {
            ticket_id: this.ticket_id,
            sender: this.loginData.data?.id,

            receiver: 0,
            message: this.state.sendmessage
        }

        // console.log('dadad',data)

        socket.emit('chatMessage', JSON.stringify({
            ticket_id: this.ticket_id,
            sender: this.loginData.data?.id,
            receiver: 0,
            message: this.state.sendmessage
        }));

    }

    handleChange = (e) => {
        // console.log(e.target)
        this.setState({
            [e.target.name]: e.target.value,
            msg: ''
        })
    }

    async getChat() {
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }
        var data = {
            ticket_id: this.ticket_id,
        }
        await axios.post(`${config.apiUrl}/getchat`, data, { headers: headers },)
            .then(result => {


                if (result.data.success === true) {
                    // this.setState({
                    //     message: result.data.response
                    // })

                }

                if (result.data.success === false) {

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


                <div className="container">

                    <div className="row">

                        <Header />

                    </div>

                    <div className="card-block">

                        <div className="messageBox">
                            <h3 className="text-center">Ticket Number {this.ticket_id}</h3>
                            <hr className='ticLine' />
                            {this.state.message.map(item => (

                                (item.receiver > 0) ?


                                    <div className="leftBox">
                                        <div className="msgreceive">{item.message}
                                            <div className='lefttimeBox'>{moment(item.datetime).format('lll')}</div>
                                        </div>

                                    </div> :
                                    <div className="rightBox">
                                        <div className="msgsend">{item.message}
                                            <div className='righttimeBox'>{moment(item.datetime).format('lll')}</div>
                                        </div>

                                    </div>

                            ))}
                        </div>

                        <div className="sendBox">
                            <hr />
                            <div className="form-group">
                                <form onSubmit={e => this.userChat(e)}>
                                    <div className="row">

                                        <div className="col-md-11">
                                            <textarea type="text" placeholder="Input message here..." name='sendmessage' onChange={e => this.handleChange(e)} value={this.state.sendmessage} className="form-control" />&nbsp;
                                        </div>
                                        <div className="col-md-1">
                                            <button type="submit" disabled={this.state.sendmessage == '' ? true : false} className="send-btn ">
                                                <img src='images/send.png' />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="col-md-3"></div>

                        </div>
                    </div>

        
                    {/* <Footer /> */}
                </div>
            </>
        )
    }
}