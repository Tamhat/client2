import React from "react";

const Robinhood = () => {
  return (
    <div className="robinhood-funtion-section">
      <div className="wrap container">
        <h1 className="sec-title">Whizzx Protecion Guarantee</h1>
        <div className="more-title">
          <div className="learn-more">Learn more about our commitments</div>
        </div>
        <div className="items-wraper">
          <div className="warp-item">
            <img src="./images/sliderImges/r1.png" />
            <p className="desc">
              We work hard to keep your data safe and secure.
            </p>
          </div>
          <div className="warp-item">
            <img src="./images/sliderImges/r2.png" />
            <p className="desc">
              We protect your account from unauthorized activities.
            </p>
          </div>
          <div className="warp-item">
            <img src="./images/sliderImges/r3.png" />
            <p className="desc">
              We provide multi-factor authentication on all account.
            </p>
          </div>
          <div className="warp-item">
            <img src="./images/sliderImges/r4.png" />
            <p className="desc">
              We've got you a back. we ere available for you 24/7.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Robinhood;
