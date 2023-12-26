import React, { useState, useEffect } from "react";
import axios from "axios";
import Timer from "./Timer";

const Startup = () => {
  const [sliderData, setSliderData] = useState([]);

  const getStartupData = async () => {
    try {
      const response = await axios.get(
        "https://bestincoin.zeezsoft.com/api/startups"
      );

      console.log("startup slider...", response.data?.data);
      if (response.status === 200) {
        setSliderData(response.data?.data);
      }
    } catch (error) {
      // Handle errors here
      console.error(error);
    }
  };

  useEffect(() => {
    getStartupData();
  }, []);
  return (
    <div className="startup-section">
      <div className="wrap container">
        <h1 className="sec-title">Startup</h1>
        <div className="grid-block">
          {sliderData?.map((item, index) => (
            <div key={index} className="startup-card">
              <div
                className="img"
                style={{
                  backgroundImage: `url(https://bestincoin.zeezsoft.com/${item.image})`,
                }}
              >
                <div className="time-block">
                  <h2 className="time-lbl">End Time: </h2>
                  <Timer time={item.expire_date} />
                </div>
              </div>
              <h1 className="card-name">{item.title}</h1>
              <div className="actions">
                <a
                  href={item.non_initial_url}
                  target="_blank"
                  className="btn-air"
                >
                  Initial
                </a>
                <a href={item.aridrop_url} target="_blank" className="btn-air">
                  Airdrop
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Startup;
