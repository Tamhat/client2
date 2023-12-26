import React, { Component } from 'react';
import Header from '../../directives/header'
import Footer from '../../directives/footer'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import axios from 'axios';
import config from '../../config/config'
import Swal from 'sweetalert2'

export default class verify extends Component {

  constructor(props) {
    super(props);
    this.state = {
      twoAuthenticationData: '',
      enableTwoFactor: 0,
      SecretKey: '',
      form_step: 1
    }
    this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
    this.otps = JSON.parse(localStorage.getItem('otps')) ? JSON.parse(localStorage.getItem('otps')) : { sms_otp: 0, email_otp: 0 }
    this.twoAuthenticationVerifyAPI = this.twoAuthenticationVerifyAPI.bind(this);

  }


  componentDidMount() {
    this.twoAuthenticationAPI()

  }

  handleChange = e => {

    this.setState({
      [e.target.name]: e.target.value
    })
  }




  formatInput = (e) => {
    // Prevent characters that are not numbers ("e", ".", "+" & "-") 
    let checkIfNum;
    if (e.key !== undefined) {
      // Check if it's a "e", ".", "+" or "-"
      checkIfNum = e.key === "e" || e.key === "." || e.key === "+" || e.key === "-";
    }
    else if (e.keyCode !== undefined) {
      // Check if it's a "e" (69), "." (190), "+" (187) or "-" (189)
      checkIfNum = e.keyCode === 69 || e.keyCode === 190 || e.keyCode === 187 || e.keyCode === 189;
    }
    return checkIfNum && e.preventDefault();
  }


  async twoAuthenticationAPI() {
    await axios({
      method: 'post',
      url: `${config.apiUrl}/getQR`,
      // headers: { "Authorization": this.loginData?.message },
      data: { "user_id": this.loginData.data.id }
    }).then(response => {
      if (response.data.success === true) {
        this.setState({
          twoAuthenticationData: response.data.response
        })
      }
    })
  }




  async twoAuthenticationVerifyAPI() {
    if (this.state.twoAuthenticationData?.is_enable_google_auth_code == 1) {
      var googleAuthStatus = 0
    } else {
      var googleAuthStatus = 1
    }

    await axios({
      method: 'post',
      url: `${config.apiUrl}/twoAuthenticationVerifyenabledisable`,
      headers: { "Authorization": this.loginData?.Token },
      data: {
        'user_id': this.loginData.data.id, email: this.loginData.data?.user_email,
        'SecretKey': this.state.SecretKey,
        'enableTwoFactor': googleAuthStatus,
        sms_otp: this.otps.sms_otp,
        email_otp: this.otps.email_otp
      }
    }).then(async response => {

      if (response.data.success === true) {

        if (googleAuthStatus == 1) {
          await Swal.fire({
            title: 'Authentication has been Enabled successfully!',
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
          this.props.history.push(`${config.baseUrl}security`);
          // window.location.href = `${config.baseUrl}security`
          this.loginData.data.is_enable_factor = this.state.enableTwoFactor;
          Cookies.set('loginSuccess', this.loginData, { secure: config.Secure, HttpOnly: config.HttpOnly });

        }
        else if (googleAuthStatus == 0) {
          await Swal.fire({
            title: 'Authentication has been Disabled successfully!',
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
          this.props.history.push(`${config.baseUrl}security`);
          // window.location.href = `${config.baseUrl}security`
          this.loginData.data.is_enable_factor = this.state.enableTwoFactor;
          Cookies.set('loginSuccess', this.loginData, { secure: config.Secure, HttpOnly: config.HttpOnly });

        }

      }

    }).catch(err => {
      if (err == 'Error: Request failed with status code 403') {
        toast.error('Session expired please re-login')
      } else {
        toast.error('Wrong secretkey entered', {
          position: toast.POSITION.TOP_CENTER
        })
      }
    })
  }



  render() {
    console.log('this.otps',this.otps)

    return (
      <>
        <body className="crypt-dark">
          <br />
          <br />
          <br />
          <br />
          <Header />
          <ToastContainer />
          <div className="container pt-5">
            <div className="stepwizard col-md-offset-3">
              <div className="stepwizard-row setup-panel">
                <div className="stepwizard-step">
                  <a type="button" className={`btn ${this.state.form_step == 1 ? 'btn-primary' : 'btn-default'} btn-circle`} onClick={e => this.setState({ form_step: 1 })}>1</a>
                  <p>Download App</p>
                </div>
                <div className="stepwizard-step">
                  <a type="button" className={`btn ${this.state.form_step == 2 ? 'btn-primary' : 'btn-default'} btn-circle`} onClick={e => this.setState({ form_step: 2 })}>2</a>
                  <p>Scan QR Code</p>
                </div>
                <div className="stepwizard-step">
                  <a type="button" className={`btn ${this.state.form_step == 3 ? 'btn-primary' : 'btn-default'} btn-circle`} onClick={e => this.setState({ form_step: 3 })}>3</a>
                  <p>Backup Key</p>
                </div>
                <div className="stepwizard-step">
                  <a type="button" className={`btn ${this.state.form_step == 4 ? 'btn-primary' : 'btn-default'} btn-circle`} onClick={e => this.setState({ form_step: 4 })}>4</a>
                  <p>Enabled Google authenticator</p>
                </div>
              </div>
            </div>

            <form role="form" action="" method="post">

              {this.state.form_step == 1 ? <div className="row setup-content" id="step-1">
                <div className="col-xs-6 col-md-offset-3">
                  <div className="col-md-12">
                    <h3> Step 1</h3>
                    <p>Download and install the Google Authenticator app</p>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <a onClick={e => window.open('https://apps.apple.com/us/app/google-authenticator/id388497605')}>
                          <img src="https://i.stack.imgur.com/xHgSL.png" className="app-button" />
                        </a>
                      </div>
                      <div className="col-12 col-md-6">
                        <a onClick={e => window.open('https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en_IN&gl=US')}>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/1200px-Google_Play_Store_badge_EN.svg.png" className="app-button" />
                        </a>
                      </div>
                    </div>
                    <button className="btn btn-primary nextBtn btn-lg pull-right" type="button" onClick={e => this.setState({ form_step: 2 })}>Next</button>
                  </div>
                </div>
              </div> : ''}
              {this.state.form_step == 2 ? <div className="row setup-content" id="step-2">
                <div className="col-xs-6 col-md-offset-3">
                  <div className="col-md-12">
                    <h3> Step 2</h3>
                    <p>Scan this QR code in the Google Authenticator app</p>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <a >

                          <img src={this.state.twoAuthenticationData.QR_code} className="QR-codes" />
                        </a>
                      </div>
                      <div className="col-12 col-md-6">
                        <p className="para-step">If you are unable to scan the QR code, please enter this code manually into the app.</p>

                        <p>{this.state.twoAuthenticationData.google_auth_code}</p>
                      </div>
                    </div>
                    <button className="btn btn-primary prevBtn btn-lg pull-left" type="button" onClick={e => this.setState({ form_step: 1 })}>Previous</button>
                    <button className="btn btn-primary nextBtn btn-lg pull-right" type="button" onClick={e => this.setState({ form_step: 3 })}>Next</button>
                  </div>
                </div>
              </div> : ''}
              {this.state.form_step == 3 ? <div className="row setup-content" id="step-3">
                <div className="col-xs-6 col-md-offset-3">
                  <div className="col-md-12">
                    <h3> Step 3</h3>
                    <p>Please save this Key on paper. This Key will allow you to recover your Google Authenticator in case of phone loss.</p>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <a >
                          <img src="http://www.isd477.org/uploaded/PHS/notepad.png" className="note-pad-icons" />
                        </a>
                      </div>
                      <div className="col-12 col-md-6">
                        <p className="para-step">Resetting your Google Authentication requires opening a support ticket and takes at least 7 days to process.</p>

                        <p>{this.state.twoAuthenticationData.google_auth_code}</p>
                      </div>
                    </div>
                    <button className="btn btn-primary prevBtn btn-lg pull-left" type="button" onClick={e => this.setState({ form_step: 2 })}>Previous</button>
                    <button className="btn btn-primary nextBtn btn-lg pull-right" type="button" onClick={e => this.setState({ form_step: 4 })}>Next</button>
                  </div>
                </div>
              </div> : ''}
              {this.state.form_step == 4 ? <div className="row setup-content" id="step-4">
                <div className="col-xs-6 col-md-offset-3 w-100">
                  <div className="col-md-12">
                    <h3> Step 4</h3>
                    <p>Enable Google Authenticator</p>

                    <input type="text" onChange={this.handleChange}
                      name="SecretKey" className="form-control mt-3" onKeyDown={this.formatInput} value={this.state.SecretKey} />
                    <button className="btn btn-success btn-lg pull-right" type="button" disabled={!this.state.SecretKey} onClick={this.twoAuthenticationVerifyAPI}>Verify</button>

                    <button className="btn btn-primary prevBtn btn-lg pull-left" type="button" onClick={e => this.setState({ form_step: 3 })}>Previous</button>
                    {/* <button className="btn btn-success btn-lg pull-right" type="submit" onClick={this.twoAuthenticationVerifyAPI}>Submit</button> */}
                  </div>
                </div>
              </div> : ''}
            </form>

          </div>

          <Footer />
        </body>
      </>
    )

  }
}