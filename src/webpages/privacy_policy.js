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

export default class privacy_policy extends Component {
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
    return { __html: this.state.webcontentlist.privacy_policy };
  }

  render() {
    return (
      <>
        <Header />
        <div className="about_as">

          <img src="images/bg/slider-11.png" class="about-banner" />
          <h1
            class="History mb-3 text-center position-absolute"
            style={{ marginTop: "50px", color: "white", top: 250 }}
          >
            Privacy  & Policy
          </h1>
        </div>
        <div class="container">
          <div class="row">
            {/* <h1
              class="History mb-3"
              style={{ marginTop: "70px", color: "#000" }}
            >
              Privacy Policy
            </h1> */}

            <div className="privacy-policy-container">
              <h1 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>Privacy Policy for Jexi Exchange</h1>
              <p style={{ margin: 5 }}>Last Updated: {new Date().getFullYear()}</p>

              <p style={{ margin: 5 }}>
                Jexi Exchange ("us," "we," or "our") operates the website [www.jexiexchange.com] and provides
                cryptocurrency exchange services. This Privacy Policy outlines our policies regarding the collection,
                use, and disclosure of personal information when you use our services.
              </p>

              <p style={{ margin: 5 }}>
                By accessing or using Jexi Exchange, you agree to the collection and use of information as described
                in this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not use our services.
              </p>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>1. Information We Collect</h2>
              <p style={{ margin: 5 }}>
                We may collect and process the following information:
              </p>
              <ol style={{ margin: 5 }}>
                <li><strong>Personal Information:</strong> When you sign up for an account, we may collect your name, email address, phone number, and other necessary information for account creation and management.</li>
                <li><strong>Transaction Information:</strong> We collect information related to your cryptocurrency transactions on Jexi Exchange, including wallet addresses, transaction amounts, and timestamps.</li>
                <li><strong>Identity Verification:</strong> To comply with regulatory requirements, we may request additional information to verify your identity, such as government-issued identification documents.</li>
                <li><strong>Log Data:</strong> We automatically collect information that your browser sends whenever you visit our website. This may include your IP address, browser type, browser version, and the pages you visit.</li>
              </ol>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>2. How We Use Your Information</h2>
              <p style={{ margin: 5 }}>
                We use the collected information for various purposes, including:
              </p>
              <ul style={{ margin: 5 }}>
                <li>Providing and maintaining our services.</li>
                <li>Verifying your identity for security and compliance purposes.</li>
                <li>Facilitating cryptocurrency transactions.</li>
                <li>Improving our services and user experience.</li>
                <li>Communicating with you, including responding to your inquiries and providing updates.</li>
              </ul>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>3. Information Sharing and Disclosure</h2>
              <p style={{ margin: 5 }}>
                We do not sell, trade, or rent your personal information to third parties. However, we may share your information with:
              </p>
              <ul style={{ margin: 5 }}>
                <li><strong>Service Providers:</strong> We may engage third-party service providers to assist us in providing and improving our services, subject to confidentiality agreements.</li>
                <li><strong>Legal Compliance:</strong> We may disclose your information to comply with legal obligations, enforce our policies, or respond to legal requests.</li>
              </ul>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>4. Security</h2>
              <p style={{ margin: 5 }}>
                We prioritize the security of your personal information. We employ industry-standard security measures to protect against unauthorized access, disclosure, alteration, or destruction.
              </p>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>5. Your Rights</h2>
              <p style={{ margin: 5 }}>
                You have the right to access, correct, or delete your personal information. If you have any concerns about your privacy, please contact us at [support@jexiexchange.com].
              </p>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>6. Changes to This Privacy Policy</h2>
              <p style={{ margin: 5 }}>
                We may update our Privacy Policy from time to time. Any changes will be posted on this page, and the "Last Updated" date will be modified accordingly.
              </p>

              <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>Contact Us</h2>
              <p style={{ margin: 5 }}>
                If you have questions or concerns about this Privacy Policy, please contact us at [contact@jexiexchange.com].
              </p>
            </div>

           
          </div>
        </div>
        <Footer />
      </>
    );
  }
}
