import React, { Component } from "react";
import axios from "axios";
import Header from "./directives/header";
import Footer from "./directives/footer";
import Cookies from "js-cookie";
import config from "./config/config";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import ips from "ip";
import {
  browserName,
  browserVersion,
  TabletView,
  AndroidView,
  IOSView,
} from "react-device-detect";
import Swal from "sweetalert2";

export default class login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      msg: "",
      ip: "",
      city: "",
      country: "",
      lat: "",
      lon: "",
      browsername: "",
      browserversion: "",
      msg: "",
      spinLoader: "0",
      rememberMe: false,
    };
    this.loginData = !Cookies.get("loginSuccess")
      ? []
      : JSON.parse(Cookies.get("loginSuccess"));
  }

  componentDidMount() {
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    const email = rememberMe ? localStorage.getItem("user") : "";
    const password = rememberMe ? localStorage.getItem("pass") : "";
    this.setState({ email, rememberMe, password });
    this.getLocation();
    if (this.loginData && this.loginData.data && this.loginData.data.id) {
      window.location.href = `${config.baseUrl}dashboard`;
    }
  }

  /*=====================================Function for Submit login form ==============================*/
  handleSubmit = (event) => {
    event.preventDefault();
    const data = {
      email: this.state.email,
      password: this.state.password,
      ip: this.state.ip,
      city: this.state.city,
      country: this.state.country,
      lat: this.state.lat,
      lon: this.state.lon,
      browsername: this.state.browsername,
      browserversion: this.state.browserversion,
      confirmicon: 0,
    };

    const { rememberMe } = this.state;
    localStorage.setItem("rememberMe", rememberMe);
    localStorage.setItem("user", rememberMe ? this.state.email : "");
    localStorage.setItem("pass", rememberMe ? this.state.password : "");

    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };

    axios
      .post(
        `${config.apiUrl}/login` + "?nocache=" + new Date().getTime(),
        data,
        { headers: headers }
      )
      .then(async (result) => {
        if (result.data.success === true) {
          if (result.data.data.is_enable_factor === 1) {
            Cookies.set("loginSuccessAuth", result.data, {
              secure: config.Secure,
              HttpOnly: config.HttpOnly,
            });
            setTimeout(() => {
              window.location.href = `${config.baseUrl}googleauthentication`;
            }, 2000);
          } else if (result.data.data.email_auth === 1) {
            Cookies.set("loginSuccessAuth", result.data, {
              secure: config.Secure,
              HttpOnly: config.HttpOnly,
            });
            setTimeout(() => {
              window.location.href = `${config.baseUrl}emailauthentication`;
            }, 2000);
          } 
          
           else {
            Cookies.set("loginSuccess", result.data, {
              secure: config.Secure,
              HttpOnly: config.HttpOnly,
            });

            await Swal.fire({
              title: "Login successful!",
              icon: "success",
              width: 500,
              confirmButtonColor: "#3085d6",
              allowOutsideClick: false,
              confirmButtonText: "Continue",
            });

            window.location.href = `${config.baseUrl}dashboard`;
           }
        }
      })
      .catch((err) => {
        console.log("result.data.data", err.response.data.type);
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        } else {
          if (err.response.data.type == "mobile") {
            // setTimeout(() => {
            //   window.location.href = `${config.baseUrl}mobieVerify/${err.response.data.user_id}`;
            // }, 2000);
          }
          this.setState({
            msg: err.response.data?.msg,
          });
        }
      });
  };

  /*==============================  hide/unhide password on input fields  ===================================  */

  showconfirmPassword = async (id) => {
    if (id === 0) {
      this.setState({ confirmicon: 1 });
    } else if (id === 1) {
      this.setState({ confirmicon: 0 });
    }
  };

  handleChange = (event) => {
    const input = event.target;
    const value = input.type === "checkbox" ? input.checked : input.value;

    this.setState({
      [input.name]: value,
      msg: "",
    });
  };

  /*============================== function for get locations and ip address and browser detail  ===================================  */

  getLocation = async (e) => {
    axios
      .get(
        `https://ipapi.co/json/?key=1Z7RbQoN0mVBi7iHQI32JPkUkCFs7DNU1BiOrGjZ7izCB8erBo`
      )
      .then((result) => {
        axios
          .get(`https://ipinfo.io/${result.data.ip}?token=ea220bd92fff15`)
          .then((result) => {
            var userAgent = window.navigator.userAgent,
              platform = window.navigator.platform,
              macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
              windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
              iosPlatforms = ["iPhone", "iPad", "iPod"],
              os = null;

            if (macosPlatforms.indexOf(platform) !== -1) {
              os = "Mac OS";
            } else if (iosPlatforms.indexOf(platform) !== -1) {
              os = "iOS";
            } else if (windowsPlatforms.indexOf(platform) !== -1) {
              os = "Windows";
            } else if (/Android/.test(userAgent)) {
              os = "Android";
            } else if (!os && /Linux/.test(platform)) {
              os = "Linux";
            }

            this.setState({
              ip: result.data.ip,
              city: result.data.city,
              country: result.data.country,
              lat: "",
              lon: "",
              browsername: os,
              browserversion: browserVersion,
            });
          });
      });
  };

  render() {
    return (
      <div className="container login-page">
        <div className="row">
          <Header />
          <div className="col-lg-3 col-md-1"></div>
          <div className="col-lg-6 col-md-10" style={{ marginTop: "50px" }}>
            <div className="cryptorio-forms cryptorio-forms-dark text-center AppFormLeft pt-4 pb-5">
              <ToastContainer />
              <h2 className="p-2 Appheading c000">Login</h2>
              <div className="cryptorio-main-form" id="login-bg">
                <form onSubmit={this.handleSubmit} className="text-left">
                  <label for="email">Email</label>
                  <input
                    type="text"
                    className="input-control"
                    id="email"
                    name="email"
                    // placeholder="Your Email"
                    onChange={this.handleChange}
                    value={this.state.email}
                  />
                  <label for="password">Password</label>
                  <div className="form-group d-flex">
                    <input
                      type={this.state.confirmicon !== 0 ? "password" : "text"}
                      id="password"
                      className="input-control"
                      name="password"
                      // placeholder="Please Input Your Password"
                      onChange={this.handleChange}
                      value={this.state.password}
                    />
                    <span
                      onClick={
                        this.state.confirmicon === 0
                          ? (e) => this.showconfirmPassword(0)
                          : (e) => this.showconfirmPassword(1)
                      }
                      className="eye-show-login"
                    >
                      <i
                        style={{ cursor: "pointer" }}
                        className={
                          this.state.confirmicon !== 0
                            ? "fa fa-eye"
                            : "fa fa-eye-slash"
                        }
                      ></i>
                    </span>
                  </div>
                  <p style={{ textAlign: "left", color: "red" }}>
                    {this.state.msg}{" "}
                  </p>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          name="rememberMe"
                          checked={this.state.rememberMe}
                          type="checkbox"
                          onChange={this.handleChange}
                          value=""
                          id="defaultCheck1"
                        />
                        &nbsp;
                        <label class="form-check-label" for="defaultCheck1">
                          Remember me
                        </label>
                      </div>
                    </div>
                    <div class="col-md-6 text-right">
                      <a href="forgot">Forgot Password?</a>
                    </div>
                  </div>
                  {this.state.spinLoader === "0" ? (
                    <button
                      className="crypt-button-red-full"
                      style={{ background: "rgb(45 212 191)" }}
                      type="submit"
                      disabled={
                        !this.state.email || !this.state.password === ""
                      }
                    >
                      Login
                    </button>
                  ) : (
                    <button
                      className="crypt-button-red-full c000"
                      disabled
                      style={{ background: "rgb(45 212 191)" }}
                    >
                      Loading<i class="fa fa-spinner fa-spin validat"></i>
                    </button>
                  )}{" "}
                </form>
                <p className="text-center c000">
                  Don't have an account?
                  <a href={`${config.baseUrl}signup`} className="c000">
                    {" "}
                    Create your account
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-1"></div>
        </div>
      </div>
    );
  }
}
