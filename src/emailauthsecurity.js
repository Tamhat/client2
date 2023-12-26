import React, { Component } from "react";
import axios from "axios";
import Header from "./directives/header";
import Footer from "./directives/footer";
import config from "./config/config";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { browserName, browserVersion } from "react-device-detect";
const headers = {
  "Content-Type": "application/json",
};

export default class twoauthsecurity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email_otp: "",
      msg: "",
      spinloader: "0",
      ip: "",
      city: "",
      country: "",
      lat: "",
      lon: "",
      browsername: "",
      browserversion: "",
    };
    this.loginData = !Cookies.get("loginSuccessAuth")
      ? []
      : JSON.parse(Cookies.get("loginSuccessAuth"));
    this.twoAuthenticationVerifyAPI =
      this.twoAuthenticationVerifyAPI.bind(this);
    this.handleChange = this.handleChange.bind(this);

    console.log("abc", this.loginData);
  }

  componentDidMount() {
    this.EmailAuthenticationAPI("send");
    this.getLocation();
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  getLocation = async (e) => {
    // let apiKey = '1be9a6884abd4c3ea143b59ca317c6b2';

    // axios.get(`https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}`).then(result=>{

    axios
      .get(
        `https://ipapi.co/json/?__cf_chl_jschl_tk__=pmd_TjdfQUFNDtY8uWKDkPep3E7Aj6nEL124fHJeLOsu8Gc-1631799864-0-gqNtZGzNAhCjcnBszQh9`
      )
      .then((result) => {
        axios
          .get(`https://ipinfo.io/${result.data.ip}?token=ea220bd92fff15`)
          .then((result) => {
            //   console.log(result)

            this.setState({
              ip: result.data.ip,
              city: result.data.city,
              country: result.data.country,
              lat: "",
              lon: "",
              browsername: browserName,
              browserversion: browserVersion,
            });
          });
      });
  };

  //==================================  twoupdateAuthentication ========================

  async EmailAuthenticationAPI(e, type) {
    await axios({
      method: "post",
      url: `${config.apiUrl}/emailotp`,
      // headers: { "Authorization": this.loginData?.message },
      data: {
        email: this.loginData?.data?.user_email,
        user_id: this.loginData.data?.id,
        email_auth: 1,
      },
      headers: { Authorization: this.loginData?.Token },
    })
      .then((response) => {
        if (response.data.otp === true) {
          if (type == "resend") {
            toast.success("we have resend verification code on your email", {
              position: toast.POSITION.TOP_CENTER,
            });
          } else {
            this.setState({
              msg: response.data.msg,
            });
          }
        } else if (response.data.success == false) {
          toast.error(response.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
          this.setState({
            spinloader: "0",
          });
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        } else {
          toast.error("unexpected internal error!", {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      });
  }

  async twoAuthenticationVerifyAPI(e) {
    e.preventDefault();
    this.setState({
      spinloader: "1",
    });
    await axios({
      method: "post",
      url: `${config.apiUrl}/emailotp`,
      headers: { Authorization: this.loginData?.Token },
      data: {
        email: this.loginData?.data?.user_email,
        email_otp: this.state.email_otp,
        user_id: this.loginData.data?.id,
        email_otp_login: true,
        email_auth: "1",
        ip: this.state.ip,
        city: this.state.city,
        country: this.state.country,
        lat: this.state.lat,
        lon: this.state.lon,
        browsername: this.state.browsername,
        browserversion: this.state.browserversion,
      },
    })
      .then((response) => {
         if (
          response.data.success === true &&
          response.data.otp_match == this.state.email_otp
        ) {
          toast.success("Login succesfull!", {
            position: toast.POSITION.TOP_CENTER,
          });
          this.setState({
            spinloader: "0",
          });
          Cookies.set("loginSuccess", this.loginData, {
            secure: config.Secure,
            HttpOnly: config.HttpOnly,
          });
          setTimeout(() => {
            window.location.href = `${config.baseUrl}dashboard`;
          }, 2500);
        } else if (response.data.success == false) {
          toast.error(response.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
          this.setState({
            spinloader: "0",
          });
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 400") {
          toast.error("Wrong code entered", {
            position: toast.POSITION.TOP_CENTER,
          });
        } else if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        } else {
          toast.error("unexpcted internal error!", {
            position: toast.POSITION.TOP_CENTER,
          });
        }
        this.setState({
          spinloader: "0",
        });
      });
  }

  render() {
    return (
      <>
        <div className="container">
          <div className="row">
            <Header />
            <div className="col-md-3"></div>
            <div className="col-md-6" style={{ marginTop: "50px" }}>
              <div className="cryptorio-forms cryptorio-forms-dark text-center pt-5 pb-5">
                <ToastContainer />
                <div className="logo"></div>
                <h3 className="p-4">
                  <span>
                    Email authentication <br />
                    <small style={{ fontSize: "17px" }}>
                      Please type code to continue
                    </small>
                  </span>
                </h3>

                <div className="cryptorio-main-form  AppFormLeft" id="login-bg">
                  <form onSubmit={this.handleSubmit} className="text-left">
                    <label for="email">Verification code</label>
                    <input
                      type="text"
                      className="input-control"
                      id="email"
                      name="email_otp"
                      placeholder="Your verification code"
                      onChange={this.handleChange}
                      value={this.state.email_otp}
                    />
                    <p style={{ textAlign: "left", color: "rgb(45 212 191)" }}>
                      {this.state.msg}{" "}
                    </p>
                    <label
                      onClick={(e) => this.EmailAuthenticationAPI(e, "resend")}
                      id="resend_otp"
                    >
                      Resend Code
                    </label>

                    {this.state.spinloader === "0" ? (
                      <button
                        className="crypt-button-red-full"
                        type="submit"
                        onClick={this.twoAuthenticationVerifyAPI}
                      >
                        Submit
                      </button>
                    ) : (
                      <button className="crypt-button-red-full" disabled>
                        Loading<i class="fa fa-spinner fa-spin validat"></i>
                      </button>
                    )}
                  </form>

                  <p className="float-right">
                    <a href={`${config.baseUrl}forgot`}>Forgot Password</a>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
}
