import React from "react";

const Faq = () => {
  return (
    <div className="need-help-section">
      <div className="wrap container">
        <h1 className="sec-title">Need Help?</h1>
        <div className="help_block">
          <div className="help-item flex flex-col">
            <div className="top-part flex flex-col">
              <img src="./images/assist/call.svg" className="icon" />
              <div className="content flex flex-col">
                <h1 className="tag">24/7 Customer Support</h1>
                <p className="desc">
                  Get 24/7 support from our friendly Customer Support agents.
                </p>
              </div>
            </div>
            <div className="btn">Chat Now</div>
          </div>
          <div className="help-item flex flex-col">
            <div className="top-part flex flex-col">
              <img src="./images/assist/helpCenter.svg" className="icon" />
              <div className="content flex flex-col">
                <h1 className="tag">FAQs</h1>
                <p className="desc">
                  Explore FAQs for detailed instructions on specific features.
                </p>
              </div>
            </div>
            <div className="btn">Learn More</div>
          </div>
          <div className="help-item flex flex-col">
            <div className="top-part flex flex-col">
              <img src="./images/assist/Learn.svg" className="icon" />
              <div className="content flex flex-col">
                <h1 className="tag">Learn</h1>
                <p className="desc">
                  Discover a range of trading guides tailored for beginners and
                  advanced traders alike.
                </p>
              </div>
            </div>
            <div className="btn">Learn More</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
