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

export default class terms_condition extends Component {
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
    return { __html: this.state.webcontentlist.terms_condition };
  }

  render() {
    // console.log( this.createMarkup())
    return (
      <>
        <Header />
        <div className="about_as">

          <img src="images/bg/slider-11.png" class="about-banner" />
          <h1
            class="History mb-3 text-center position-absolute"
            style={{ marginTop: "50px", color: "white", top: 250 }}
          >
            Terms & Condition
          </h1>
        </div>

        <div class="container">
          <div class="row">

            {/* <h5 class="mt-3">Last revised: 30 March, 2021</h5> */}
            <div className="terms-and-conditions-container">
              <h1 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>Welcome to Jexi Exchange</h1>
              <p style={{ margin: 5 }}>
                By accessing or using our cryptocurrency exchange services, you agree to comply with and be bound
                by the following Terms and Conditions. If you do not agree with these terms, please refrain from using our services.
              </p>

              <section>
                <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }} className="History text-xs">1. Acceptance of Terms</h2>
                <p style={{ margin: 5 }}>
                  By using Jexi Exchange, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                  We reserve the right to modify or update these terms at any time, and it is your responsibility to review them periodically.
                </p>
              </section>

              <section>
                <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>2. User Registration</h2>
                <p style={{ margin: 5 }}>
                  To use certain features of Jexi Exchange, you may be required to register for an account. You agree to provide accurate,
                  current, and complete information during the registration process. You are responsible for maintaining the confidentiality
                  of your account credentials.
                </p>
              </section>

              <section>
                <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>3. Eligibility</h2>
                <p style={{ margin: 5 }}>
                  You must be at least 18 years old or the legal age in your jurisdiction to use Jexi Exchange. By accessing our services,
                  you confirm that you meet the eligibility requirements.
                </p>
              </section>

              <section>
                <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>4. Prohibited Activities</h2>
                <p style={{ margin: 5 }}>
                  You agree not to engage in any of the following activities:
                </p>
                <ul style={{ margin: 5 }}>
                  <li>Violating any applicable laws or regulations.</li>
                  <li>Unauthorized access to our systems or networks.</li>
                  <li>Interfering with the proper functioning of Jexi Exchange.</li>
                  <li>Engaging in any form of market manipulation or fraudulent activities.</li>
                </ul>
              </section>

              <section>
                <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>5. Privacy</h2>
                <p style={{ margin: 5 }}>
                  Your privacy is important to us. Please refer to our Privacy Policy [link to privacy policy] for information on how we collect,
                  use, and protect your personal information.
                </p>
              </section>

              <section>
                <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>6. Transactions and Fees</h2>
                <p style={{ margin: 5 }}>
                  Jexi Exchange facilitates cryptocurrency transactions. You agree to pay any applicable fees associated with your transactions.
                  We reserve the right to modify our fee structure at any time.
                </p>
              </section>

              <section>
                <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>7. Intellectual Property</h2>
                <p style={{ margin: 5 }}>
                  All content, trademarks, and intellectual property on Jexi Exchange are the property of Jexi Exchange. You agree not to
                  reproduce, distribute, or create derivative works without our express consent.
                </p>
              </section>

              <section>
                <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>8. Termination</h2>
                <p style={{ margin: 5 }}>
                  We reserve the right to suspend or terminate your access to Jexi Exchange at our discretion, without notice, for any reason,
                  including violation of these Terms and Conditions.
                </p>
              </section>

              <section>
                <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>9. Disclaimer of Warranties</h2>
                <p style={{ margin: 5 }}>
                  Jexi Exchange is provided "as is" without any warranty of any kind. We do not guarantee the accuracy, completeness, or
                  reliability of any information on our platform.
                </p>
              </section>

              <section>
                <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>10. Governing Law</h2>
                <p style={{ margin: 5 }}>
                  These Terms and Conditions are governed by and construed in accordance with the laws of [Your Jurisdiction]. Any disputes
                  arising out of or related to these terms shall be resolved in the courts of [Your Jurisdiction].
                </p>
              </section>

              <section>
                <h2 style={{ textDecoration: 'underline', color: '#38a0a1', margin: 5 }}>Contact Us</h2>
                <p style={{ margin: 5 }}>
                  If you have any questions or concerns about these Terms and Conditions, please contact us at [contact@jexiexchange.com].
                </p>
              </section>
            </div>
          </div>
        </div>

        <Footer />
      </>
    );
  }
}
