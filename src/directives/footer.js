import React, { Component } from "react";
import axios from "axios";
import config from "../config/config";
import Cookies from "js-cookie";
import ReactWhatsapp from "react-whatsapp";
import { WhatsappShareButton } from "react-share";
import { ToastContainer, toast } from "react-toastify";
import logo from "../assets/logo/logo.png";
const headers = {
  "Content-Type": "application/json",
};

export default class Footer extends Component {
  constructor(props) {
    super(props);
    this.loginData = !Cookies.get("loginSuccess")
      ? []
      : JSON.parse(Cookies.get("loginSuccess"));
    this.loginId = !this.loginData.data ? 0 : this.loginData.data.id;
    this.state = {
      footerlist: "",
      webcontentlist: "",
    };
  }

  componentDidMount() {
    this.footerAPI();
    this.webContentAPI();
  }

  //================================================  Footer API integrate  =============

  async footerAPI() {
    await axios({
      method: "get",
      url: `${config.apiUrl}/getfooter` + "?nocache=" + new Date().getTime(),
      headers: { Authorization: this.loginData.message },
      data: {},
    })
      .then((response) => {
        if (response.data.success === true) {
          this.setState({
            footerlist: response.data.response,
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

  render() {
    return (
      <>
        <footer class="iq-footer dark-bg iq-footer-2">
          <ToastContainer />
          <div class="footer-top iq-bg-fixed ">
            <div class="container-fluid">
              <div class="row">
                <div class="col-lg-3 col-md-6 col-sm-12 iq-mtb-90">
                  <div class="logo">
                    <img
                      id="logo_img_2"
                      class="img-fluid"
                      src={logo}
                      alt=""
                    />
                    <div class="text-white iq-mt-25 ">
                      Whether you're a seasoned investor or a newcomer to the
                      world of trading, JEXI Exchange is here to elevate your
                      experience. Join us on this journey of financial
                      discovery, where every trade is a step towards your
                      financial goals.
                    </div>
                    <ul class="iq-media-blog iq-mt-30 float-start">
                      {/* <li>
                        <a
                          href="https://www.instagram.com/accounts/login/?next=/platinx.exchange/"
                          class="rounded"
                        >
                          <i class="fab fa-instagram"></i>
                        </a>
                      </li> */}
                      <li>
                        <a
                          target="_blank"
                          href="https://twitter.com/Jexiexchange"
                          class="rounded"
                        >
                          <i class="fab fa-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a
                          target="_blank"

                          href="https://www.tiktok.com/@jexiexchange_official"
                          class="rounded"
                        >
                          <i class="fab fa-tiktok"></i>
                        </a>
                      </li>
                      <li>
                        <a
                          target="_blank"

                          href="https://www.instagram.com/jexiexchange/"
                          class="rounded"
                        >
                          <i class="fab fa-instagram"></i>
                        </a>
                      </li>
                      <li>
                        <a
                          target="_blank"

                          href="https://t.me/Jexiexchange"
                          class="rounded"
                        >
                          <i class="fab fa-telegram"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="col-lg-3 col-md-6 col-sm-12 iq-contact iq-mtb-90  footer-menu-list">
                  <h5 class="small-title text-white widget-title">
                    Quick Links
                  </h5>
                  <div class="d-flex align-items-center text-white flex-wrap">
                    <ul class="iq-pl-0 iq-post">
                      <li>
                        <a href={`${config.baseUrl}`}>
                          <i
                            class="fa fa-angle-right me-2"
                            aria-hidden="true"
                          ></i>
                          Home
                        </a>
                      </li>
                      <li>
                        <a href={`${config.baseUrl}wallet`}>
                          <i
                            class="fa fa-angle-right me-2"
                            aria-hidden="true"
                          ></i>
                          Wallet
                        </a>
                      </li>
                      <li>
                        <a href={`${config.baseUrl}Exchange`}>
                          <i
                            class="fa fa-angle-right me-2"
                            aria-hidden="true"
                          ></i>
                          Exchange
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="col-lg-3 col-md-6   iq-mtb-90">
                  <h5 class="small-title text-white widget-title">
                    Information
                  </h5>
                  <ul class="iq-post">
                    <li>
                      <a
                        href={`${config.baseUrl}about_us`}
                        className="information"
                      >
                        <i
                          class="fa fa-angle-right me-2"
                          aria-hidden="true"
                        ></i>
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        href={`${config.baseUrl}terms_condition`}
                        className="information"
                      >
                        <i
                          class="fa fa-angle-right me-2"
                          aria-hidden="true"
                        ></i>
                        Terms and Condition
                      </a>
                    </li>
                    <li>
                      <a
                        href={`${config.baseUrl}privacy_policy`}
                        className="information"
                      >
                        <i
                          class="fa fa-angle-right me-2"
                          aria-hidden="true"
                        ></i>
                        Privacy Policy
                      </a>
                    </li>
                    <li>

                      {/* <a href="https://mail.google.com/mail/u/0/?fs=1&amp;to=support@platinx.exchange&amp;tf=cm" target="_blank"><i class="fa fa-angle-right me-2" aria-hidden="true"></i>Support</a> */}

                      <a href="https://mail.google.com/mail/u/0/?fs=1&amp;to=contact@jexiexchange.com&amp;tf=cm" target="_blank" className="information">
                        <i
                          class="fa fa-angle-right me-2"
                          aria-hidden="true"
                        ></i>
                        Support
                      </a>
                    </li>
                  </ul>
                </div>
                <div class="col-lg-3 col-md-6 col-sm-12 text-white iq-contact iq-mtb-90">
                  <h5 class="small-title widget-title">CONTACT</h5>

                  <div class="iq-mb-30">
                    <div class="blog ">
                      <i class="fas fa-envelope" aria-hidden="true"></i>
                      <div class="content ">
                        <div class=" title ">Mail</div>{" "}
                        support@jexiexchange.com
                      </div>
                    </div>
                  </div>
                  {/* <div className="iq-mb-30">
                    <div class="blog">
                      <i class="fas fa-map-marker-alt"></i>
                      <div class="content ">
                        <div class=" title ">Address</div> Netherland
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
          <div class="footer-bottom iq-ptb-20 ">
            <div class="container">
              <div class="row">
                <div class="col-sm-6">
                  <div class="iq-copyright iq-mt-10 text-white">
                    Copyright @ {new Date().getFullYear().toString()} JEXI Exchange All Rights Reserved.
                  </div>
                </div>
                <div class="col-sm-6">
                  <ul class="footer-nav-menu"></ul>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </>
    );
  }
}
