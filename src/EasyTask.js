import React from "react";
import { Link } from "react-router-dom";

const EasyTask = () => {
  return (
    <div className="easy-task-section">
      <div className="wrap container">
        <h1 className="sec-title">
          Easy Task, Big Reward: Register and Get 20 USDT Bonus!
        </h1>
        <div className="task-wraper">
          <div className="item">
            <div className="l-side">
              <h1 className="price">
                +5 <span>USDT</span>
              </h1>
              <div className="title-d">Create Account</div>
            </div>
            <div className="r-side">
              <Link to="/signup" className="btn-signup">
                Sign up now
              </Link>
            </div>
          </div>
          <div className="item">
            <div className="l-side">
              <h1 className="price">
                +5 <span>USDT</span>
              </h1>
              <div className="title-d">Deposit</div>
            </div>
            <div className="r-side">
              <Link to="/signup" className="btn-signup">
                Sign up now
              </Link>
            </div>
          </div>
          <div className="item">
            <div className="l-side">
              <h1 className="price">
                +10 <span>USDT</span>
              </h1>
              <div className="title-d">Copy Trading</div>
            </div>
            <div className="r-side">
              <Link to="/signup" className="btn-signup">
                Sign up now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EasyTask;
