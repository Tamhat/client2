import React, { Component } from 'react';

import axios from 'axios';
import Header from '../directives/header'
import Footer from '../directives/footer'
import Cookies from 'js-cookie';
import config from '../config/config'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';


const headers = {
  'Content-Type': 'application/json'
};

export default class contact_us extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    this.loginData=JSON.parse(!Cookies.get('loginSuccessAdmin') ? null : Cookies.get('loginSuccessAdmin'));
     
  }


  componentDidMount() {

  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }


  handleSubmit = async (e) => {
    e.preventDefault()
    await axios({
      method: 'post',
      url: `${config.apiUrl}/insertcontact`,
      headers: {'Content-Type': 'application/json'},
      data: { "name": this.state.name, "email": this.state.email, "subject": this.state.subject, "comments": this.state.message }
    })
      .then(result => {
        if (result.data.success === true) {
          toast.success(result.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          })
          this.setState({
            name: '',
            email: '',
            subject: '',
            message: '',

          })
        }
        else if (result.data.success === false) {
          toast.error(result.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          })
        }
      }).catch(err => {
        if(err=='Error: Request failed with status code 403'){
          toast.error('Session expired please re-login')
      }
      });
  }






  render() {
    return (



      <>


        <Header />
        <ToastContainer />
        <div className="container">
          <div className="row mt-4 ">
            <div class="col-sm-12 text-center">
              <h1 className="History mb-3" style={{ marginTop: '50px' }}>CONTACT US</h1>
            </div>
          </div>
          <div className="row ">
            <div class="col-lg-3">
              {/* <iframe
                width="100%"
                height="350px;"
                frameBorder={0}
                style={{ border: 0 }}
                src="https://www.google.com/maps/embed/v1/place?q=place_id:ChIJaY32Qm3KWTkRuOnKfoIVZws&key=AIzaSyAf64FepFyUGZd3WFWhZzisswVx2K37RFY"
                allowFullScreen
              /> */}


            </div>
            <div class="col-lg-6">
              <main className="flexbox-col">

                <div className="form-wrapper">
                  <form id="form" method="post" name="emailform" action="email.php">


                    <div className="form-input-grid">
                      <div>
                        <p className="form-text ml-0">Name:</p>
                        <div className="form-input-wrapper flexbox-left">
                          <i className="uil uil-user"></i>
                          <input className="form-control" onChange={this.handleChange} id="name" name="name" type="text" placeholder="Enter  name" value={this.state.name} aria-label=""
                            required />
                        </div>
                      </div>
                      <div>
                        <p className="form-text ml-0">Subject:</p>
                        <div c88lassName="form-input-wrapper flexbox-left">
                          <i className="uil uil-asterisk"></i>
                          <input className="form-control" id="pword" onChange={this.handleChange} name="subject" type="text" value={this.state.subject} placeholder="Enter Subject" aria-label=""
                            required />
                        </div>
                      </div>
                    </div>
                    <div className="form-input-max">
                      <p className="form-text ml-0">Email:</p>
                      <div className="form-input-wrapper flexbox-left contact_us">
                        <i className="uil uil-at"></i>
                        <input type="email" className="form-control" name="email" onChange={this.handleChange} value={this.state.email} placeholder="Enter Email"
                        />
                      </div>
                    </div>
                    <div className="form-input-max">
                      <p className="form-text ml-0">Message* (Max 500)</p>
                      <div id="textarea" className="form-input-wrapper flexbox-left-start" >
                        <i className="uil uil-comment-dots"></i>
                        <textarea className="form-control" id="message" name="message" onChange={this.handleChange} value={this.state.message} placeholder="Your message" maxlength="500"
                          aria-label="" style={{ borderRadius: "0px" }} required></textarea>
                      </div>
                    </div>
                    <div className="form-input-max flexbox-left">
                      <div className="">
                        <button id="contact form-button" type="submit" disabled={!this.state.name || !this.state.subject || !this.state.email || !this.state.message} onClick={this.handleSubmit} className="btn btn-primary"><i className="fa fa-send"></i>
                          Send</button>
                      </div>
                    </div>
                  </form>
                </div>

              </main>

            </div>
<div className='col-lg-3'></div>

          </div>

        </div>

        <Footer />

      </>
    )
  }
}