import React from "react";
import { Link } from "react-router-dom";

const HomeWelcome = () => {
  return (
    <div
      className="home-welcome-section flex"
      // style={{
      //   backgroundImage: `url(./images/img/transformed.png)`,
      // }}
    >
      <div className="wrap container flex">
        <div className="left-side flex flex-col">
          <h1 className="slug">
            Welcome to <span>Whizzx</span>
            <br />
            Begin Your Crypto Journey Today.
          </h1>
          <Link to="/signup" className="btn-signup">
            Sign up via Email/Phone number
          </Link>
        </div>
        <div className="right-side flex">
          <img src="./images/img/transformed.png" className="right-bg" />
        </div>
      </div>
    </div>
  );
};

export default HomeWelcome;
