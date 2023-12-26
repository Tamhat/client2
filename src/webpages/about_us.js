import React, { Component } from "react";

import axios from "axios";
import Header from "../directives/header";
import Footer from "../directives/footer";
import Cookies from "js-cookie";
import config from "../config/config";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import DeviceDetector from "device-detector-js";

const headers = {
  "Content-Type": "application/json",
};

export default class about_us extends Component {
  constructor(props) {
    super(props);
    this.state = {
      webcontentlist: {},
    };
  }

  componentDidMount() {
    this.getWebContentData();
  }

  async getWebContentData() {
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };
    axios
      .get(`${config.apiUrl}/getwebcontent`, {}, { headers: headers })
      .then((response) => {
        if (response.data.success === true) {
          this.setState({
            webcontentlist: response.data.response,
          });
        } else if (response.data.success === false) {
        }
      })

      .catch((err) => { });
  }

  createMarkup() {
    return { __html: this.state.webcontentlist.about };
  }

  render() {
    return (
      <>
        {/* 

                <div className="container">

                    <div className="row"> */}

        <Header />
        <div className="about_as">
          <img src="images/bg/slider-11.png" class="about-banner" />

          <div class="container">
            <div class="row">
              <div
                class="banner-content"
                style={{ position: "absolute", top: "40%", left: "0" }}
              >
                <div className="col-lg-12">
                  <h1>About Jexi Exchange</h1>
                  {/* <h1>About Best In Coins</h1> */}
                  {/* <p class="mt-4">
                    Beyond operating the world's leading cryptocurrency
                    exchange, <br />
                    Best In Coins spans an entire ecosystem.
                  </p> */}
                </div>
              </div>
            </div>
            <div className="about-us-container">

              <p style={{margin:5}}>
                Welcome to Jexi Exchange, where cutting-edge technology meets the world of cryptocurrency.
                At Jexi Exchange, our mission is to provide a secure, efficient, and user-friendly platform
                for individuals and institutions to trade digital assets seamlessly.
              </p>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>Our Vision</h2>
              <p style={{margin:5}}>
                Empowering global financial inclusion through accessible and innovative blockchain solutions
                is at the core of our vision. We believe in the transformative potential of cryptocurrency and
                blockchain technology to reshape the financial landscape, making it more inclusive and decentralized.
              </p>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>Why Choose Jexi Exchange?</h2>
              <ul style={{margin:5}}>
                <li>
                  <strong>Security First:</strong> The security of your assets is our top priority. We employ
                  state-of-the-art security measures to ensure a safe and reliable trading environment.
                </li>
                <li>
                  <strong>User-Friendly Interface:</strong> Jexi Exchange is designed with simplicity in mind.
                  Our user-friendly interface ensures that both beginners and experienced traders can navigate
                  the platform with ease.
                </li>
                <li>
                  <strong>Global Accessibility:</strong> We aim to connect users from around the world to the
                  exciting world of cryptocurrency. Jexi Exchange provides a global platform for trading a diverse
                  range of digital assets.
                </li>
                <li>
                  <strong>Innovative Features:</strong> Stay ahead in the fast-paced crypto market with our
                  innovative features. From advanced trading tools to real-time market insights, we provide the
                  tools you need for successful trading.
                </li>
              </ul>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>Our Commitment to Compliance</h2>
              <p style={{margin:5}}>
                Jexi Exchange is committed to complying with all applicable laws and regulations. We work closely
                with regulatory bodies to ensure that our platform operates within legal frameworks, providing a
                trustworthy environment for our users.
              </p>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>Join Us on the Crypto Journey</h2>
              <p style={{margin:5}}>
                Whether you're a seasoned trader or just stepping into the world of cryptocurrencies,
                Jexi Exchange is here to support your journey. Explore new opportunities, diversify your
                portfolio, and experience the future of finance with us.
              </p>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>Connect With Us</h2>
              <p style={{margin:5}}>
                Have questions or suggestions? We value your feedback. Reach out to us at{' '}
                <a href="mailto:contact@jexiexchange.com">contact@jexiexchange.com</a>. Join us on social media
                to stay updated on the latest news, features, and promotions.
              </p>

              <p style={{margin:5}}>Welcome to Jexi Exchange - Your Gateway to the Future of Finance!</p>
            </div>

          </div>
        </div>
        <Footer />
      </>
    );
  }
}
