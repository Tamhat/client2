import React, { Component } from "react";
import axios from "axios";
import config from "./config/config";
import Header from "./directives/header";
import { Link, Redirect } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import SliderCaptcha from "@slider-captcha/react";
import Swal from "sweetalert2";
import { Vertify } from "@alex_xu/react-slider-vertify";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Cookies from "js-cookie";
const headers = {
  "Content-Type": "application/json",
};
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

export default class signup extends Component {
  constructor(props) {
    super(props);
    const lastItem = window.location.href.split("/");
    this.state = {
      email: "",
      //   phone: "",
      //   phonecode: "91",
      username: "",
      password: "",
      referral_code: lastItem[5],
      password2: "",
      msg: "",
      confirmicon: 0,
      error: "",
      icon: 0,
      checked: false,
      modalIsOpen: false,
      countrylistData: [],
    };

    const {
      match: { params },
    } = this.props;
    this.token = params.token;
  }

  /*============================== Start HandleChange Function for set all Input fields value ===================================*/

  handleChange = (e) => {
    if (e.target.name == "username") {
      const re = /(<([^>]+)>)/;
      console.log(re.test(e.target.value));
      if (re.test(e.target.value) || e.target.value == "") {
        this.setState({
          [e.target.name]: "",
          msg: "",
        });
      } else {
        this.setState({
          [e.target.name]: e.target.value,
          msg: "",
        });
      }
    }
    //  else if (e.target.name == "phone") {
    //   const re = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
    //   if (re.test(e.target.value) || e.target.value == "") {
    //     this.setState((old) => {
    //       return { ...old, [e.target.name]: e.target.value };
    //     });
    //   }
    // }
    else {
      this.setState({
        [e.target.name]: e.target.value,
        msg: "",
      });
    }
  };

  /*============================== End HandleChange Function for set all Input fields value ===================================*/

  componentDidMount() {
    if (Cookies.get("email")) {
      this.setState({
        email: Cookies.get("email"),
      });
      Cookies.set("email", "", {
        secure: config.Secure,
        HttpOnly: config.HttpOnly,
      });
    }
    if (this.token) {
      this.verifyAccountAPI();
    }
    this.countryList();
  }

  /*============================== Start CountryList Function Api for get all world countries  ===================================  */

  async countryList() {
    axios({
      method: "get",
      url: `${config.apiUrl}/getCountries`,
    }).then((response) => {
      if (response.data.success === true) {
        this.setState({
          countrylistData: response.data.response,
        });
      }
    });
  }

  /*============================== End CountryList Function Api for get all world countries  ===================================  */

  /*============================== Start hide/unhide password on input fields  ===================================  */

  showconfirmPassword = async (id) => {
    if (id === 0) {
      this.setState({ confirmicon: 1 });
    } else if (id === 1) {
      this.setState({ confirmicon: 0 });
    }
  };

  showPassword = async (id) => {
    if (id === 0) {
      this.setState({ icon: 1 });
    } else if (id === 1) {
      this.setState({ icon: 0 });
    }
  };

  /*============================== End hide/unhide password on input fields  ===================================  */

  /*================================ Verification Link Send Api  ======================================  */

  verifiedCallback(event) {
    this.setState({ modalIsOpen: false });
    const {
      email,
      password,
      password2,
      username,
      //   phone,
      //   phonecode,
      referral_code,
    } = this.state;
    axios
      .post(
        `${config.apiUrl}/verifyLinkSend` + "?nocache=" + new Date().getTime(),
        {
          email,
          referrer: referral_code,
          //   phonecode,
          //   phone,
          password,
          password2,
          username,
        }
      )
      .then(async (result) => {
        console.log("Result", result);
        if (result.data.success === true) {
          await Swal.fire({
            title:
              "Verification Link  has been sent on Email, kindly verify your account",
            icon: "success",
            width: 500,
            confirmButtonColor: "#3085d6",
            allowOutsideClick: false,
            confirmButtonText: "Continue",
            confirmButtonColor: "#e4d923",
          });

          // window.location.href = `${config.baseUrl}mobieVerify/${result.data.user_id}`;
          window.location.href =` ${config.baseUrl}login`
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        } else {
          this.setState({
            msg: err.response.data?.msg,
          });
        }
      });
  }

  /*================================ Verify  Account  Api Function ======================================  */

  async verifyAccountAPI() {
    axios
      .post(
        `${config.apiUrl}/verifyAccount/` +
          this.token +
          "?nocache=" +
          new Date().getTime(),
        { headers }
      )
      .then((result) => {
        console.log(result.data);
        if (result.data.success === true) {
          toast.success(result.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
          setTimeout(() => {
            window.location.href = `${config.baseUrl}login`;
          }, 1000);
        }
        if (result.data.success === false) {
          toast.error(result.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        } else {
          toast.error(err.response.data?.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      });
  }

  /*================================ Function for validate all type of form fields  ======================================  */

  validatePassword = () => {
    var p = this.state;
    let errors = [];

    if (this.state.username == "") {
      errors.push({ name: "username", err: "Username is Required!" });
    }

    if (p.email == "") {
      errors.push({ name: "email", err: "Email is Required!" });
    }

    if (p.email.search(/\S+@\S+\.\S+/) < 0) {
      errors.push({ name: "email", err: "Enter Valid E-mail!" });
    }

    // if (p.phone == "") {
    //   errors.push({ name: "phone", err: "Contact no. is Required!" });
    // }

    // if (!/^[6-9]\d{9}$/gi.test(p.phone)) {
    //   errors.push({ name: "phone", err: "Contact No. is not Valid!" });
    // }

    // if (p.phonecode == "") {
    //   errors.push({ name: "phonecode", err: "Contry code is Required!" });
    // }

    if (p.checked == false) {
      errors.push({ name: "checked", err: "Please Check Box!" });
    }
    if (p.password == "") {
      errors.push({ name: "password", err: "Password is Required!" });
    }

    if (p.password.search(/[a-z]/) < 0 && p.password.search(/[A-Z]/) < 0) {
      errors.push({
        name: "password",
        err: "Your password must contain at least one Lower case,one Upper case letter.",
      });
    }

    if (p.password.search(/[a-z]/) < 0) {
      errors.push({
        name: "password",
        err: "Your password must contain at least one lower case letter.",
      });
    }
    if (p.password.search(/[A-Z]/) < 0) {
      errors.push({
        name: "password",
        err: "Your password must contain at least one upper case letter.",
      });
    }

    if (p.password.length < 8) {
      errors.push({
        name: "password",
        err: "Your password must be at least 8 characters",
      });
    }
    if (p.password.search(/[a-z]/i) < 0) {
      errors.push({
        name: "password",
        err: "Your password must contain at least one letter.",
      });
    }
    if (p.password.search(/[0-9]/) < 0) {
      errors.push({
        name: "password",
        err: "Your password must contain at least one number.",
      });
    }

    if (p.password2 == "") {
      errors.push({ name: "password2", err: "Confirm Password is Required!" });
    }

    if (errors.length > 0) {
      this.setState({ error: errors });

      return false;
    }
    this.setState({ error: "" });
    return true;
  };

  /*================================ Function for submit form   ======================================  */

  handleSubmit = (event) => {
    event.preventDefault();
    const isvalid = this.validatePassword();
    if (!isvalid) {
      this.setState({ spinLoader: "0" });
    } else {
      const {
        email,
        password,
        password2,
        username,
        // phone,
        phonecode,
        referral_code,
      } = this.state;

      axios
        .post(
          `${config.apiUrl}/register` + "?nocache=" + new Date().getTime(),
          {
            username,
            referral_code,
            phonecode,
            // phone,
            email,
            password,
            password2,
          }
        )
        .then(async (result) => {
          console.log("Result", result);
          if (result.data.success === true) {
            this.setState({ modalIsOpen: true });
          }
        })
        .catch((err) => {
          if (err == "Error: Request failed with status code 403") {
            toast.error("Session expired please re-login");
          } else {
            this.setState({
              msg: err.response.data?.msg,
            });
          }
        });
    }
  };

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  };

  gotoTermsCondition(e) {
    window.location.href = `${config.baseUrl}terms_condition`;
  }

  render() {
    return (
      <>
        <div></div>
        <Header />
        <ToastContainer />
        <div className="container login-page">
          <div className="row">
            <div className="col-lg-3 col-md-1"></div>
            <div className="col-lg-6 col-md-10" style={{ marginTop: "50px" }}>
              <div className="cryptorio-forms cryptorio-forms-dark text-center AppFormLeft pt-4 pb-5">
                <div className="logo"></div>
                <h2 className="Appheading p-2 c000">Signup</h2>
                <div className="cryptorio-main-form" id="login-bg">
                  <form onSubmit={this.handleSubmit} className="text-left">
                    <label for="email">Name</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="input-control"
                      // placeholder="Name"
                      onChange={this.handleChange}
                      value={this.state.username}
                    />
                    {this.state.error.length > 0 &&
                    this.state.error[0].name == "username" ? (
                      <div>
                        <span className="alert_validation">
                          {this.state.error[0].err}
                        </span>
                      </div>
                    ) : (
                      ""
                    )}
                    <label for="email">Email</label>
                    <input
                      type="text"
                      id="email"
                      name="email"
                      className="input-control"
                      // placeholder="Email"
                      onChange={this.handleChange}
                      value={this.state.email}
                    />
                    {this.state.error.length > 0 &&
                    this.state.error[0].name == "email" ? (
                      <div>
                        <span className="alert_validation">
                          {this.state.error[0].err}
                        </span>
                      </div>
                    ) : (
                      ""
                    )}
                    {/* <div className="row">
                      <div className="col-lg-3 mobile-space mb-spc">
                        <label for="email">Code</label>
                        <select
                          className="form-select"
                          style={{ padding: "0px" }}
                          aria-label="Default select example"
                          onChange={this.handleChange}
                          name="phonecode"
                          value={this.state.phonecode}
                        >
                          <option value={this.state.phonecode}>
                            +{this.state.phonecode}
                          </option>
                          <i classname="fas fa-chevron-down"></i>
                        </select>
                      </div>
                      <div className="col-lg-9 mobile-space">
                        <label for="email">Phone</label>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          className="input-control"
                          placeholder="Contact Number"
                          onChange={this.handleChange}
                          value={this.state.phone}
                        />
                        {this.state.error.length > 0 &&
                        this.state.error[0].name == "phone" ? (
                          <div>
                            <span className="alert_validation">
                              {this.state.error[0].err}
                            </span>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div> */}
                    <label for="password">Password</label>
                    <div className="form-group d-flex">
                      <input
                        type={this.state.icon === 0 ? "password" : "text"}
                        id="password"
                        className="input-control"
                        name="password"
                        // placeholder="8-20 letters and numbers"
                        onChange={this.handleChange}
                        value={this.state.password}
                      />
                      <span
                        onClick={
                          this.state.icon === 0
                            ? (e) => this.showPassword(0)
                            : (e) => this.showPassword(1)
                        }
                        className="eye-show-signup-login"
                      >
                        <i
                          className={
                            this.state.icon === 0
                              ? "fa fa-eye"
                              : "fa fa-eye-slash"
                          }
                        ></i>
                      </span>
                    </div>
                    {this.state.error.length > 0 &&
                    this.state.error[0].name == "password" ? (
                      <div>
                        <span className="alert_validation">
                          {this.state.error[0].err}
                        </span>
                      </div>
                    ) : (
                      ""
                    )}
                    <label for="confirm-password">Confirm Password</label>
                    <div className="form-group d-flex">
                      <input
                        type={
                          this.state.confirmicon === 0 ? "password" : "text"
                        }
                        id="confirm-password"
                        className="input-control"
                        name="password2"
                        // placeholder="8-20 letters and numbers"
                        onChange={this.handleChange}
                        value={this.state.password2}
                      />
                      <span
                        onClick={
                          this.state.confirmicon === 0
                            ? (e) => this.showconfirmPassword(0)
                            : (e) => this.showconfirmPassword(1)
                        }
                        className="eye-show-signupconfirm-login"
                      >
                        <i
                          className={
                            this.state.confirmicon === 0
                              ? "fa fa-eye"
                              : "fa fa-eye-slash"
                          }
                        ></i>
                      </span>
                    </div>
                    {this.state.error.length > 0 &&
                    this.state.error[0].name == "password2" ? (
                      <div>
                        <span className="alert_validation">
                          {this.state.error[0].err}
                        </span>
                      </div>
                    ) : (
                      ""
                    )}
                    <label for="confirm-password">
                      Referral Code (Optional)
                    </label>
                    <div className="form-group d-flex">
                      <input
                        type="text"
                        id="confirm-password"
                        className="input-control"
                        name="referral_code"
                        // placeholder="Referral Code"
                        onChange={this.handleChange}
                        value={
                          this.state.referral_code == "signup"
                            ? ""
                            : this.state.referral_code
                        }
                      />
                    </div>
                    <div className="my-1">
                      <div className="custom-control  mr-sm-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={this.state.checked}
                          onChange={(e) =>
                            this.setState({
                              checked: this.state.checked ? false : true,
                            })
                          }
                          id="flexCheckDefaultsignup"
                          required
                        />
                        <label
                          className="custom-control-label-check"
                          id="agree_title"
                        >
                          I agree to the
                          <a
                            href={`${config.baseUrl}terms_condition`}
                            style={{ color: "rgb(45 212 191)" }}
                          >
                            {" "}
                            terms & condition{" "}
                          </a>{" "}
                          and
                          <a
                            href={`${config.baseUrl}privacy_policy`}
                            style={{ color: "rgb(45 212 191)" }}
                          >
                            {" "}
                            privacy policy
                          </a>
                        </label>
                      </div>
                      {this.state.error.length > 0 &&
                      this.state.error[0].name == "checked" ? (
                        <div>
                          <span className="alert_validation">
                            {this.state.error[0].err}
                          </span>
                        </div>
                      ) : (
                        ""
                      )}

                      <p style={{ textAlign: "left", color: "red" }}>
                        {this.state.msg}
                      </p>
                      <PasswordStrengthMeter password={this.state.password} />
                    </div>
                    <input
                      type="submit"
                      value="SignUp"
                      className="crypt-button-red-full"
                      style={{ background: "rgb(45 212 191)" }}
                    />
                  </form>
                  <p className="float-left">
                    <a href={`${config.baseUrl}login`}>Log In</a>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-1"></div>
          </div>

          <Modal show={this.state.modalIsOpen} onHide={this.closeModal}>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body>
              {" "}
              <div className="capture_modal">
                <div className="row">
                  <div className="col-md-12 col-12">
                    <Vertify
                      width={280}
                      height={160}
                      text="Slide To Complete the Puzzle"
                      onSuccess={() => this.verifiedCallback()}
                      onFail={() => alert("fail")}
                      onRefresh={() => alert("refresh")}
                    />
                  </div>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </>
    );
  }
}
