import React from "react";

const ProdService = () => {
  return (
    <div className="prod-services">
      <div className="wrap container">
        <h1 className="sec-title">Products & Services</h1>
        <div className="prd-wrap">
          <div className="prd-item">
            <div className="img-side">
              <img src="./images/img/img-prd-1.svg" className="ico" />
            </div>
            <div className="meta-side">
              <div className="meta">
                <h1 className="title">Spot</h1>
                <p className="desc">
                  BTC, ETH and over 100 high quality trading pairs are available
                  here.
                </p>
              </div>
            </div>
          </div>
          <div className="prd-item">
            <div className="img-side">
              <img src="./images/img/img-prd-2.svg" className="ico" />
            </div>
            <div className="meta-side">
              <div className="meta">
                <h1 className="title">Perpetual Futures</h1>
                <p className="desc">
                  Create a more flexible trading strategy and amplify your
                  profits with up to 150x leverage.
                </p>
              </div>
            </div>
          </div>
          <div className="prd-item">
            <div className="img-side">
              <img src="./images/img/img-prd-3.svg" className="ico" />
            </div>
            <div className="meta-side">
              <div className="meta">
                <h1 className="title">Copy Trading</h1>
                <p className="desc">
                  By following professional traders, and customizing leverage to
                  your preference, to invest with ease and profitability.
                </p>
              </div>
            </div>
          </div>
          <div className="prd-item">
            <div className="img-side">
              <img src="./images/img/img-prd-4.svg" className="ico" />
            </div>
            <div className="meta-side">
              <div className="meta">
                <h1 className="title">Buy Crypto</h1>
                <p className="desc">
                  BTC, ETH and over 100 high quality trading pairs are available
                  here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdService;
