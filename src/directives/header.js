import React, { Component } from "react";
import { Link } from "react-router-dom";
import config from "../config/config";
import Cookies from "js-cookie";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import logo from "../assets/logo/logo.png";

const headers = {
  "Content-Type": "application/json",
};
export default class Header extends Component {
  constructor(props) {
    super(props);
    this.loginData = !Cookies.get("loginSuccess")
      ? []
      : JSON.parse(Cookies.get("loginSuccess"));
    this.state = {
      webcontentlist: "",
      dropShow: 0,
      dropShow1: 0,
      showLanguage: false,
      profile_image: "",
    };
  }

  componentDidMount() {
    this.webContentAPI();
    this.getProfile();
  }

  buttonClick(id) {
    if (id === 0) {
      this.setState({
        dropShow: 1,
      });
    } else if (id === 1) {
      this.setState({
        dropShow: 0,
      });
    }
  }

  buttonClick1(id) {
    if (id === 0) {
      this.setState({
        dropShow1: 1,
      });
    } else if (id === 1) {
      this.setState({
        dropShow1: 0,
      });
    }
  }

  async logout(e) {
    e.preventDefault();
    await axios({
      method: "post",
      url: `${config.apiUrl}/logout`,
      headers: { Authorization: this.loginData?.Token },
      data: {
        user_id: this.loginData.data?.id,
        email: this.loginData?.data.user_email,
      },
    })
      .then((result) => {
        if (result.data.success === true) {
          window.location.href = `${config.baseUrl}login`;
          Cookies.remove("loginSuccess");
        } else if (result.data.success === false) {
          toast.error(result.data.msg);
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        }
        this.setState({
          getCountriesList: [],
        });
      });
  }

  //================================================  getwebcontent API integrate  =============

  async webContentAPI() {
    axios
      .get(
        `${config.apiUrl}/getwebcontent` + "?nocache=" + new Date().getTime(),
        {},
        { headers }
      )
      .then((response) => {
        if (response.data.success === true) {
          this.setState({
            webcontentlist: response.data.response,
          });
        } else if (response.data.success === false) {
        }
      })

      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        }
      });
  }

  async getProfile() {
    if (this.loginData.data?.user_email) {
      await axios({
        method: "post",
        url: `${config.apiUrl}/getProfileData`,
        headers: { Authorization: this.loginData?.Token },
        data: {
          user_id: this.loginData.data?.id,
          email: this.loginData?.data.user_email,
        },
      })
        .then((result) => {
          if (
            result.data.success === true &&
            result.data.response.is_login == 1
          ) {
            this.setState({
              profile_image: result.data.response.profile_image,
            });
          } else if (
            result.data.success === true &&
            result.data.response.is_login == 0
          ) {
            window.location.href = `${config.baseUrl}login`;
            Cookies.remove("loginSuccess");
          }
        })
        .catch((err) => {
          if (err == "Error: Request failed with status code 403") {
            toast.error("Session expired please re-login");
          }
          this.setState({
            getCountriesList: [],
          });
        });
    }
  }

  render() {
    return (
      <>
        <header className="crypt-header">
          <div class="container-full-width">
            <ToastContainer />
            <div class="">
              <div className="row"></div>
              <div class="row align-items-center">
                <div class="col-sm-2  text-left">
                  <div class="row">
                    <div class="col-lg-12">
                      <div class="crypt-logo">
                        <a href={`${config.websiteUrl}`}>
                          <img className="lg:w-16 md:w-12 w-10 md:sl-py-4 sl-py-2" src={logo} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="col-xl-10 col-lg-10 col-md-10 p-0"
                  id="moblie_view_translate"
                >
                  <i class="menu-toggle fas fa-bars pe-7s-menu "></i>
                  <div className="d-none d-md-block d-lg-block">
                    {Cookies.get("loginSuccess") ? (
                      <ul class="crypt-heading-menu fright">
                        <li>
                          <Link to={`${config.baseUrl}dashboard`}>
                            <i class="fas fa-tachometer-alt"></i>Dashboard
                          </Link>
                        </li>

                        <li>
                          <Link to={`${config.baseUrl}Exchange`}>
                            <i class="fab fa-stack-exchange"></i>Exchange
                          </Link>
                        </li>
                        <li className="nav">
                          <a className="dropbtn">
                            <i class="fas fa-wallet"></i>Wallet
                          </a>
                          <div class="dropdown-content">
                            <Link to={`${config.baseUrl}wallet`}>Wallet </Link>
                            <Link to={`${config.baseUrl}withdraw`}>
                              Withdraw INR
                            </Link>
                            <Link to={`${config.baseUrl}depositform`}>
                              Deposit INR
                            </Link>
                            <Link to={`${config.baseUrl}transfer`}>
                              Transfer
                            </Link>
                          </div>
                        </li>
                        <li>
                          <Link to={`${config.baseUrl}staking`}>
                            <i class="fas fa-money-check"></i>Staking
                          </Link>
                        </li>
                        <li className="nav">
                          <a className="dropbtn">
                            <i class="fas fa-money-check"></i>Referral
                          </a>
                          <div class="dropdown-content">
                            <Link to={`${config.baseUrl}referral`}>
                              Referral{" "}
                            </Link>
                            <Link to={`${config.baseUrl}ReferralUsers`}>
                              My Referrals{" "}
                            </Link>
                          </div>
                        </li>

                        <li>
                          <Link to={`${config.baseUrl}order-History`}>
                            <i class="fas fa-history"></i>Order History
                          </Link>
                        </li>

                        <li
                          className={
                            this.state.dropShow === 0
                              ? "crypto-has"
                              : "crypto-has show"
                          }
                          onClick={this.buttonClick.bind(
                            this,
                            this.state.dropShow
                          )}
                        >
                          <button
                            class="btn btn-secondary dropdown-toggle"
                            type="button"
                            id="dropdownMenuButton2"
                            aria-expanded="false"
                          >
                            {this.state.profile_image == "" ? (
                              <i class="fas fa-user-circle"></i>
                            ) : (
                              <img
                                height={30}
                                width={30}
                                className="header_profileimage"
                                src={`${
                                  this.state.profile_image == ""
                                    ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8dXNlcnxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80"
                                    : config.imageUrl + this.state.profile_image
                                }`}
                              />
                            )}
                          </button>
                          <div
                            className={
                              this.state.dropShow === 0
                                ? "dropdown-menu profile_drop"
                                : "dropdown-menu show profile_drop"
                            }
                            style={{
                              transform: this.state.dropShow === 0 ? "" : "",
                              top: this.state.dropShow === 0 ? "" : "52px",
                            }}
                            aria-labelledby="dropdownMenuButton2"
                            id="drop_menu"
                          >
                            <Link
                              class="dropdown-item"
                              to={`${config.baseUrl}coinList`}
                            >
                              <i class="fas fa-history"></i>coinList
                            </Link>
                            <Link
                              class="dropdown-item"
                              to={`${config.baseUrl}security`}
                            >
                              <i class="fas fa-shield-alt"></i>Security
                            </Link>
                            <Link
                              class="dropdown-item"
                              to={`${config.baseUrl}ticket`}
                            >
                              <i class="fas fa-ticket-alt"></i>Ticket
                            </Link>
                            <Link
                              class="dropdown-item"
                              to={`${config.baseUrl}bankDetails`}
                            >
                              <i class="fas fa-ticket-alt"></i>Bank Details
                            </Link>
                            <Link
                              class="dropdown-item"
                              to={`${config.baseUrl}Profile`}
                            >
                              <i class="fas fa-user-alt"></i>Profile
                            </Link>
                            <Link
                              class="dropdown-item"
                              to={`${config.baseUrl}setting`}
                            >
                              <i class="fas fa-user-check"></i>
                              <span>Kyc</span>
                            </Link>
                            <Link
                              class="dropdown-item"
                              onClick={(e) => this.logout(e)}
                              to={`${config.baseUrl}login`}
                            >
                              <i class="fas fa-sign-out-alt"></i>Log out
                            </Link>
                          </div>
                          {/* </div> */}
                        </li>
                      </ul>
                    ) : (
                      <ul class="crypt-heading-menu fright">
                        <li>
                          <a href={`${config.websiteUrl}`}> Home </a>
                        </li>

                        <li>
                          <Link to={`${config.baseUrl}Exchange`}>Exchange</Link>
                        </li>

                        <li>
                          <Link to={`${config.baseUrl}login`}> Wallet</Link>
                        </li>

                        <li class="crypt-box-menu menu-green">
                          <Link to={`${config.baseUrl}login`}>login</Link>
                        </li>
                        <li class="crypt-box-menu menu-red">
                          <Link to={`${config.baseUrl}signup`}>register</Link>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="crypt-mobile-menu">
            {Cookies.get("loginSuccess") ? (
              <ul class="crypt-heading-menu fright">
                <li>
                  <Link to={`${config.baseUrl}dashboard`}>
                    <i class="fas fa-tachometer-alt"></i> <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link to={`${config.baseUrl}Exchange`}>
                    <i class="fab fa-stack-exchange"></i> <span>Exchange</span>
                  </Link>
                </li>
                <li className="nav">
                  <a className="dropbtn">
                    <i class="fas fa-wallet"></i>Wallet
                  </a>
                  <div class="dropdown-content">
                    <Link to={`${config.baseUrl}wallet`}>Wallet </Link>
                    <Link to={`${config.baseUrl}withdraw`}>Withdraw </Link>
                    <Link to={`${config.baseUrl}depositform`}>Deposit INR</Link>
                    <Link to={`${config.baseUrl}transfer`}>Transfer</Link>
                  </div>
                </li>
                <li>
                  <Link to={`${config.baseUrl}order-History`}>
                    <i class="fas fa-history"></i>
                    <span>Order History</span>
                  </Link>
                </li>

                <li>
                  <Link class="" to={`${config.baseUrl}staking`}>
                    <i class="fas fa-money-check"></i>
                    <span>Staking</span>
                  </Link>
                </li>
                <li>
                  <Link class="" to={`${config.baseUrl}referral`}>
                    <i class="fas fa-money-check"></i>
                    <span>Referral</span>
                  </Link>
                </li>
                <li class="crypto-has">
                  <button
                    class="btn btn-secondary dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton2"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <a>
                      {this.state.profile_image == "" ? (
                        <i class="fas fa-user-circle"></i>
                      ) : (
                        <img
                          height={30}
                          width={30}
                          className="header_profileimage"
                          src={`${
                            this.state.profile_image == ""
                              ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8dXNlcnxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80"
                              : config.imageUrl + this.state.profile_image
                          }`}
                        />
                      )}
                      <span id="mobileprofileicon">Profile</span>
                    </a>
                  </button>
                  <div
                    class="dropdown-menu "
                    aria-labelledby="dropdownMenuButton2"
                    id="drop_menu"
                  >
                    <a class="dropdown-item" href={`${config.baseUrl}security`}>
                      <i class="fas fa-shield-alt"></i>
                      <span>Security</span>
                    </a>
                    <Link to={`${config.baseUrl}ticket`}>
                      <i class="fas fa-ticket-alt"></i>
                      <span>Ticket</span>
                    </Link>
                    <Link to={`${config.baseUrl}bankDetails`}>
                      <i class="fas fa-ticket-alt"></i>
                      <span>Bank Detail</span>
                    </Link>
                    <Link class="dropdown-item" to={`${config.baseUrl}Profile`}>
                      <i class="fas fa-user-alt"></i>
                      <span>Profile</span>
                    </Link>
                    <Link class="dropdown-item" to={`${config.baseUrl}setting`}>
                      <i class="fas fa-user-check"></i>
                      <span>Kyc</span>
                    </Link>
                    <Link class="dropdown-item" to={`${config.baseUrl}staking`}>
                      <i class="fas fa-money-check"></i>
                      <span>Staking</span>
                    </Link>
                    <Link
                      class="dropdown-item"
                      to={`${config.baseUrl}referral`}
                    >
                      <i class="fas fa-money-check"></i>
                      <span>Referral</span>
                    </Link>
                    <Link
                      class="dropdown-item"
                      onClick={(e) => this.logout(e)}
                      to={`${config.baseUrl}login`}
                    >
                      <i class="fas fa-sign-out-alt"></i>
                      <span>Log out</span>
                    </Link>
                  </div>
                  {/* </div> */}
                </li>
              </ul>
            ) : (
              <ul class="crypt-heading-menu fright">
                <li>
                  <a href={`${config.websiteUrl}`}>Home</a>
                </li>
                <li>
                  <Link to={`${config.baseUrl}Exchange`}>Exchange</Link>
                </li>

                <li>
                  <Link to={`${config.baseUrl}login`}> Wallet</Link>
                </li>

                <li class="crypt-box-menu menu-green">
                  <Link to={`${config.baseUrl}login`}>login</Link>
                </li>
                <li class="crypt-box-menu menu-red">
                  <Link to={`${config.baseUrl}signup`}>Register</Link>
                </li>
              </ul>
            )}
          </div>
        </header>
      </>
    );
  }
}
