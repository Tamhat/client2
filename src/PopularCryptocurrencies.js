import React, { useState, useEffect } from "react";

const PopularCryptocurrencies = () => {
  const [activeTab, setActiveTab] = useState("");
  console.log("activeTab...", activeTab);
  const tblData = [
    {
      img: "./images/sliderImges/mx.png",
      name: "MX/USDT",
      price: "2.8860",
      charge: "-1.99%",
      market: "./images/sliderImges/g1.png",
    },
    {
      img: "./images/sliderImges/btc.png",
      name: "BTC/USDT",
      price: "35,445.5",
      charge: "-1.99%",
      market: "./images/sliderImges/g2.png",
    },
    {
      img: "./images/sliderImges/eth.png",
      name: "ETH/USDT",
      price: "1,989.69",
      charge: "-2.99%",
      market: "./images/sliderImges/g3.png",
    },
    {
      img: "./images/sliderImges/bm.png",
      name: "BM/USDT",
      price: "0.6233",
      charge: "-4.73%",
      market: "./images/sliderImges/g4.png",
    },
    {
      img: "./images/sliderImges/mex.png",
      name: "MEX/USDT",
      price: "0.0088",
      charge: "-10.20%",
      market: "./images/sliderImges/g2.png",
    },
  ];
  const tblDataHot = [
    {
      img: "./images/sliderImges/mex.png",
      name: "MEX/USDT",
      price: "0.0078",
      charge: "-10.20%",
      market: "./images/sliderImges/g2.png",
    },
    {
      img: "./images/sliderImges/btc.png",
      name: "BTC/USDT",
      price: "55,445.5",
      charge: "-1.99%",
      market: "./images/sliderImges/g2.png",
    },
    {
      img: "./images/sliderImges/eth.png",
      name: "ETH/USDT",
      price: "2,989.69",
      charge: "-1.99%",
      market: "./images/sliderImges/g3.png",
    },
    {
      img: "./images/sliderImges/mx.png",
      name: "MX/USDT",
      price: "1.8860",
      charge: "-0.99%",
      market: "./images/sliderImges/g1.png",
    },
    {
      img: "./images/sliderImges/bm.png",
      name: "BM/USDT",
      price: "0.8233",
      charge: "-2.73%",
      market: "./images/sliderImges/g4.png",
    },
  ];
  return (
    <div className="popular-cryptocurrencies-section">
      <div className="wrap container">
        <h1 className="sec-title">Popular Cryptocurrencies</h1>
        <div className="table_block">
          <div className="filters">
            <div
              className={`filter-item ${activeTab === "Spot" ? "active" : ""}`}
              onClick={(e) => setActiveTab("Spot")}
            >
              Top Spot
              {/* <span className="perc">Meker 0% / Taker 0.025</span> */}
            </div>
            <div
              className={`filter-item ${activeTab === "Hot" ? "active" : ""}`}
              onClick={(e) => setActiveTab("Hot")}
            >
              Hot
            </div>
            <div
              className={`filter-item ${
                activeTab === "Newest" ? "active" : ""
              }`}
              onClick={(e) => setActiveTab("Newest")}
            >
              Newest
            </div>
            <div
              className={`filter-item ${
                activeTab === "Volume" ? "active" : ""
              }`}
              onClick={(e) => setActiveTab("Volume")}
            >
              Top Volume
            </div>
            <div
              className={`filter-item ${
                activeTab === "Gainers" ? "active" : ""
              }`}
              onClick={(e) => setActiveTab("Gainers")}
            >
              Top Gainers
            </div>
          </div>
          <div className="row">
            <div className="row_col">Trading Pair</div>
            <div className="row_col">Price</div>
            <div className="row_col">Change</div>
            <div className="row_col">Market</div>
            <div className="row_col">Action</div>
          </div>
          {activeTab === "Spot" ? (
            <>
              {tblData.map((item, index) => (
                <div key={index} className="row">
                  <div className="row_col">
                    <img src={item.img} className="img" />
                    <h1 className="name">{item.name}</h1>
                  </div>
                  <div className="row_col">
                    <h1 className="name">{item.price}</h1>
                  </div>
                  <div className="row_col">
                    <h1 className="name">{item.charge}</h1>
                  </div>
                  <div className="row_col">
                    <img src={item.market} className="garph-img" />
                  </div>
                  <div className="row_col">
                    <button className="btn-trade">Trade</button>
                  </div>
                </div>
              ))}
            </>
          ) : activeTab === "Hot" ? (
            <>
              {tblDataHot.map((item, index) => (
                <div key={index} className="row">
                  <div className="row_col">
                    <img src={item.img} className="img" />
                    <h1 className="name">{item.name}</h1>
                  </div>
                  <div className="row_col">
                    <h1 className="name">{item.price}</h1>
                  </div>
                  <div className="row_col">
                    <h1 className="name">{item.charge}</h1>
                  </div>
                  <div className="row_col">
                    <img src={item.market} className="garph-img" />
                  </div>
                  <div className="row_col">
                    <button className="btn-trade">Trade</button>
                  </div>
                </div>
              ))}
            </>
          ) : activeTab === "Newest" ? (
            <>
              {tblData.map((item, index) => (
                <div key={index} className="row">
                  <div className="row_col">
                    <img src={item.img} className="img" />
                    <h1 className="name">{item.name}</h1>
                  </div>
                  <div className="row_col">
                    <h1 className="name">{item.price}</h1>
                  </div>
                  <div className="row_col">
                    <h1 className="name">{item.charge}</h1>
                  </div>
                  <div className="row_col">
                    <img src={item.market} className="garph-img" />
                  </div>
                  <div className="row_col">
                    <button className="btn-trade">Trade</button>
                  </div>
                </div>
              ))}
            </>
          ) : activeTab === "Volume" ? (
            <>
              {tblDataHot.map((item, index) => (
                <div key={index} className="row">
                  <div className="row_col">
                    <img src={item.img} className="img" />
                    <h1 className="name">{item.name}</h1>
                  </div>
                  <div className="row_col">
                    <h1 className="name">{item.price}</h1>
                  </div>
                  <div className="row_col">
                    <h1 className="name">{item.charge}</h1>
                  </div>
                  <div className="row_col">
                    <img src={item.market} className="garph-img" />
                  </div>
                  <div className="row_col">
                    <button className="btn-trade">Trade</button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {tblData.map((item, index) => (
                <div key={index} className="row">
                  <div className="row_col">
                    <img src={item.img} className="img" />
                    <h1 className="name">{item.name}</h1>
                  </div>
                  <div className="row_col">
                    <h1 className="name">{item.price}</h1>
                  </div>
                  <div className="row_col">
                    <h1 className="name">{item.charge}</h1>
                  </div>
                  <div className="row_col">
                    <img src={item.market} className="garph-img" />
                  </div>
                  <div className="row_col">
                    <button className="btn-trade">Trade</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularCryptocurrencies;
