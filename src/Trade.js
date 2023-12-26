import React from "react";

const Trade = () => {
  return (
    <div className="trade-section">
      <div className="wrap container">
        <div className="block">
          <div className="meta flex flex-col">
            <h1 className="sec-title">Trade Anytime, Anywhere.</h1>
            <p className="desc">
              Open new positions instantly, whether it's on Bybit App or Web.
            </p>
            <div className="qr-sec flex">
              <img src="./images/assist/qrCode.png" className="qr-img" />
              <div className="descrip flex flex-col jc">
                <p className="lbl">Scan Now to Download</p>
                <p className="mb">iOS & Android</p>
              </div>
            </div>
            <div className="down-links flex aic">
              <div className="link-item flex flex-col">
                <img src="./images/assist/appstore.svg" className="ico" />
                <p className="lbl">App Store</p>
              </div>
              <div className="link-item flex flex-col">
                <img src="./images/assist/android.svg" className="ico" />
                <p className="lbl">Android APK</p>
              </div>
              <div className="link-item flex flex-col">
                <img src="./images/assist/googlplay.svg" className="ico" />
                <p className="lbl">Google Play</p>
              </div>
              <div className="link-item flex flex-col">
                <img src="./images/assist/api.svg" className="ico" />
                <p className="lbl">API</p>
              </div>
            </div>
          </div>
          <div className="bg-side flex aic jc">
            <div
              className="bg-img"
              style={{
                backgroundImage: `url(./images/sliderImges/guidedDownload.png)`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
