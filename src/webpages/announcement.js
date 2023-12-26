import React, { Component } from 'react';
import axios from 'axios';
import Header from '../directives/header'
import Footer from '../directives/footer'

import config from '../config/config'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';


const headers = {
    'Content-Type': 'application/json'
};

export default class announcement extends Component {

    constructor(props) {
        super(props);
        this.state = {
            notification_list: []
        };
    }


    componentDidMount() {
        this.notificationDetails()
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

    downloadFile(file) {
        if (file == null || file == '' || file == undefined) {
            alert('No file Added')
        } else {
            window.open(`${config.imageUrl}${file}`)
        }
     }

    createMarkup = (data) => {
        return { __html: data };
    }


    render() {

        return (

            <>

                <Header />
                <ToastContainer />
                <div class="container">
                    <div class="row">
                        <h1 class="History mb-3" style={{ marginTop: '70px' }}>ANNOUNCEMENTS</h1>

                        <main class="flexbox-col">
                            {this.state.notification_list.map((item, i) => (
                                <div className="annoucement">
                                    <div className="annouce-file">
                                        <img src="images/favicon.png" className="" />
                                        <h2 data-bn-type="text" className="">{item.title} &nbsp;({item.datetime.slice(0, 10)})</h2>
                                        <button className='btn btn-primary ml-2' onClick={e => this.downloadFile(item.file)}>Open File</button>
                                    </div>
                                    <div classname="css-6f91y1">
                                        <div classname="css-ktxhrn">
                                            <p classname="css-qinc3w"><div dangerouslySetInnerHTML={this.createMarkup(item.description)} /> &nbsp;
                                            </p>
                                        </div>
                                    </div>
                                </div>))}

                        </main>
                    </div>

                </div>

                <Footer />

            </>
        )
    }
}