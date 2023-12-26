import React, { Component } from 'react';

import axios from 'axios';
import Header from '../directives/header'
import Footer from '../directives/footer'
import Cookies from 'js-cookie';
import config from '../config/config'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import DeviceDetector from "device-detector-js";

const headers = {
    'Content-Type': 'application/json'
};

export default class faq extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ""
        };

    }


    componentDidMount() {

    }
    render() {
        return (



            <>


                <Header />
                <div class="container">
    <div class="row">
      <h1 class="History mb-3"  style={{marginTop:'50px'}}>FAQ</h1>

      <div class="faqs-container" itemscope itemtype="https://schema.org/FAQPage">

        <div class="faq-singular" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h2 class="faq-question" itemprop="name">What is the return policy?</h2>
          <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <div itemprop="text">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </div>
          </div>
        </div>

        <div class="faq-singular" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h2 class="faq-question" itemprop="name">How long does it take to process a refund?</h2>
          <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <div itemprop="text">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </div>
          </div>
        </div>

        <div class="faq-singular" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h2 class="faq-question" itemprop="name">What is the policy for late/non-delivery of items ordered online?
          </h2>
          <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <div itemprop="text">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </div>
          </div>
        </div>

        <div class="faq-singular" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h2 class="faq-question" itemprop="name">Is the product same as shown in pictures?</h2>
          <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <div itemprop="text">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>

                <Footer />

            </>
        )
    }
}