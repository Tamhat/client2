import React, { Component } from "react";
import Header from "../../directives/header";
import Footer from "../../directives/footer";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import Cookies from "js-cookie";
import axios from "axios";
import config from "../../config/config";
import { confirmAlert } from "react-confirm-alert";
import Swal from "sweetalert2";
import Modal from "react-modal";

const modalcustomStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};
export default class Security extends Component {
  constructor(props) {
    super(props);
    this.state = {
      twoAuthenticationData: "",
      email_otp: "",
      sms_otp: "",
      msg: "",
      sms_msg: "",
      email_auth: 0,
      currentCount: 60,
      passmodelOpen: false,
      smsModal: false,
      twofaModal: false,
      intervalId: "",
      userKYC: "",
      aunthentication_type: "",
    };
    this.loginData = !Cookies.get("loginSuccess")
      ? []
      : JSON.parse(Cookies.get("loginSuccess"));
    this.EmailAuthenticationAPI = this.EmailAuthenticationAPI.bind(this);
  }

  componentDidMount() {
    if (!Cookies.get("loginSuccess")) {
      window.location.href = `${config.baseUrl}login`;
      return false;
    }
    this.getuserKYC();
    this.twoAuthenticationAPI();
  }

  getuserKYC = async () => {
    var data = {
      user_id: this.loginData.data.id,
      // "email": this.loginData?.data?.user_email,
    };
    await axios({
      method: "post",
      url: `${config.apiUrl}/getuserkyc`,
      headers: { Authorization: this.loginData?.Token },
      data: data,
    })
      .then((result) => {
        // console.log(result.data.response);
        this.setState({
          userKYC: result.data.response,
        });
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        }
      });
  };

  async twoAuthenticationAPI() {
    await axios({
      method: "post",
      url: `${config.apiUrl}/getQR`,
      headers: { Authorization: this.loginData?.Token },
      data: { user_id: this.loginData.data.id },
    }).then((response) => {
      if (response.data.success === true) {
        this.setState({
          twoAuthenticationData: response.data.response,
        });
      }
    });
  }

  closeOtpModal(e) {
    this.setState({ email_otp: "", sms_otp: "" });
  }
  async EmailAuthenticationAPI(e) {
    e.preventDefault();
    if (this.state.twoAuthenticationData?.email_auth == 1) {
      var googleAuthStatus = 0;
    } else {
      var googleAuthStatus = 1;
    }

    await axios({
      method: "post",
      url: `${config.apiUrl}/emailotp`,
      headers: { Authorization: this.loginData?.Token },
      data: {
        email: this.loginData.data.user_email,
        user_id: this.loginData.data.id,
        email_otp: this.state.email_otp,
        email_auth: googleAuthStatus,
      },
    })
      .then((response) => {
        if (response.data.otp === true) {
          this.setState({
            msg: response.data.msg,
          });
        }
        if (response.data.success === true) {
          if (googleAuthStatus == 1) {
            toast.success(
              "Email Authentication has been Enabled successfully!",
              {
                position: toast.POSITION.TOP_CENTER,
              }
            );
            setTimeout(() => {
              // this.props.history.push(`${config.baseUrl}security`);
              window.location.href = `${config.baseUrl}security`;
            }, 1000);
          } else if (googleAuthStatus == 0) {
            toast.success(
              "Email Authentication has been Disabled successfully!",
              {
                position: toast.POSITION.TOP_CENTER,
              }
            );

            setTimeout(() => {
              // this.props.history.push(`${config.baseUrl}security`);
              window.location.href = `${config.baseUrl}security`;
            }, 1000);
          }
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

  async SMSAuthenticationAPI(e, type) {
    e.preventDefault();
    console.log(this.state);
    if (this.state.twoAuthenticationData?.sms_auth == 1) {
      var googleAuthStatus = 0;
    } else {
      var googleAuthStatus = 1;
    }

    await axios({
      method: "post",
      url: `${config.apiUrl}/smsotpsend`,
      headers: { Authorization: this.loginData?.Token },
      data: {
        email: this.loginData.data.user_email,
        user_id: this.loginData.data.id,
        sms_otp: this.state.sms_otp,
        sms_auth: googleAuthStatus,
      },
    })
      .then((response) => {
        if (response.data.otp === true) {
          if (type == "resend") {
            this.setState({
              sms_msg: "we have resend code on your contact",
            });
          } else {
            this.setState({
              sms_msg: response.data.msg,
            });
          }
          setTimeout(() => {
            clearInterval(this.state.intervalId);
            this.setState({ currentCount: 60 });
          }, 1000 * 60);

          const intervalId = setInterval(() => {
            this.setState((prevState) => {
              return {
                currentCount: prevState.currentCount - 1,
              };
            });
          }, 1000);

          this.setState({ intervalId: intervalId });
        }
        if (
          response.data.success === true &&
          response.data.otp_match == this.state.sms_otp
        ) {
          if (googleAuthStatus == 1) {
            toast.success("SMS Authentication has been Enabled successfully!", {
              position: toast.POSITION.TOP_CENTER,
            });
            setTimeout(() => {
              // this.props.history.push(`${config.baseUrl}security`);
              window.location.href = `${config.baseUrl}security`;
            }, 1000);
          } else if (googleAuthStatus == 0) {
            toast.success(
              "SMS Authentication has been Disabled successfully!",
              {
                position: toast.POSITION.TOP_CENTER,
              }
            );

            setTimeout(() => {
              // this.props.history.push(`${config.baseUrl}security`);
              window.location.href = `${config.baseUrl}security`;
            }, 1000);
          }
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

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      msg: "",
    });
  };

  disableAuth = (e, type) => {
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to disable ${
        type == "google_auth"
          ? "2FA authentication"
          : type == "sms_auth"
          ? "SMS authentication"
          : "E-mail authentication"
      }`,
      buttons: [
        {
          label: "Yes",
          onClick: () =>
            axios
              .post(
                `${config.apiUrl}/disableAuth`,
                {
                  email: this.loginData.data.user_email,
                  user_id: this.loginData.data.id,
                  type: type,
                },
                { headers: headers }
              )
              .then((result) => {
                if (result.data.success === true) {
                  toast.success(result.data?.msg, {
                    position: toast.POSITION.TOP_CENTER,
                  });
                  this.componentDidMount();
                } else if (result.data.success === false) {
                }
              })

              .catch((err) => {
                if (err == "Error: Request failed with status code 403") {
                  toast.error("Session expired please re-login");
                }
              }),
        },
        {
          label: "No",
        },
      ],
    });
  };

  DeactiveUser = (id) => {
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };
    confirmAlert({
      title: "Confirm to submit",
      message: "Are you sure and want to deactive your account",
      buttons: [
        {
          label: "Yes",
          onClick: () =>
            axios
              .post(
                `${config.apiUrl}/userselfBlock`,
                {
                  id: this.loginData.data?.id,
                  user_id: this.loginData.data.id,
                  email: this.loginData?.data?.user_email,
                  email_otp: this.state.email_otp,
                },
                { headers: headers }
              )
              .then((result) => {
                if (result.data.success === true) {
                  toast.success("Your account deactivated successfully", {
                    position: toast.POSITION.TOP_CENTER,
                  });

                  setTimeout(() => {
                    window.location.href = `${config.baseUrl}login`;
                    Cookies.remove("loginSuccess");
                  }, 3000);
                } else if (result.data.success === false) {
                }
              })

              .catch((err) => {
                if (err == "Error: Request failed with status code 403") {
                  toast.error("Session expired please re-login");
                }
              }),
        },
        {
          label: "No",
        },
      ],
    });
  };

  async twoAuthenticationVerifyAPI(e) {
    e.preventDefault();
    if (this.state.twoAuthenticationData?.is_enable_google_auth_code == 1) {
      var googleAuthStatus = 0;
    } else {
      var googleAuthStatus = 1;
    }

    await axios({
      method: "post",
      url: `${config.apiUrl}/twoAuthenticationVerifyenabledisable`,
      headers: { Authorization: this.loginData?.Token },
      data: {
        user_id: this.loginData.data.id,
        email: this.loginData.data?.user_email,
        SecretKey: this.state.SecretKey,
        sms_otp: this.state.sms_otp,
        email_otp: this.state.email_otp,
        enableTwoFactor: googleAuthStatus,
      },
    })
      .then(async (response) => {
        if (response.data.success === true) {
          if (googleAuthStatus == 1) {
            await Swal.fire({
              title: "Authentication has been Enabled successfully!",
              //   text: 'Login successful!',
              icon: "success",
              width: 500,
              confirmButtonColor: "#3085d6",
              allowOutsideClick: false,
              // showCancelButton: true,
              confirmButtonText: "Continue",
              confirmButtonColor: "#e4d923",
              // cancelButtonText: 'No, keep it'
            });
            // this.props.history.push(`${config.baseUrl}security`);
            window.location.href = `${config.baseUrl}security`;
            this.loginData.data.is_enable_factor = this.state.enableTwoFactor;
            Cookies.set("loginSuccess", this.loginData, {
              secure: config.Secure,
              HttpOnly: config.HttpOnly,
            });
          } else if (googleAuthStatus == 0) {
            this.setState({ twofaModal: false });
            await Swal.fire({
              title: "Authentication has been Disabled successfully!",
              //   text: 'Login successful!',
              icon: "success",
              width: 500,
              confirmButtonColor: "#3085d6",
              allowOutsideClick: false,
              // showCancelButton: true,
              confirmButtonText: "Continue",
              confirmButtonColor: "#e4d923",
              // cancelButtonText: 'No, keep it'
            });
            // this.props.history.push(`${config.baseUrl}security`);
            window.location.href = `${config.baseUrl}security`;
            this.loginData.data.is_enable_factor = this.state.enableTwoFactor;
            Cookies.set("loginSuccess", this.loginData, {
              secure: config.Secure,
              HttpOnly: config.HttpOnly,
            });
          }
        } else {
          toast.error(response.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        } else {
          toast.error("Wrong secretkey entered", {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      });
  }

  ModelOpenFun(e, type, aunthentication_type) {
    e.preventDefault();
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };
    axios
      .post(
        `${config.apiUrl}/withdrawAuthentication`,
        {
          email: this.loginData.data?.user_email,
          user_id: this.loginData.data?.id,
          type: "send_otp",
        },
        { headers: headers }
      )
      .then(async (result) => {
        if (result.data.success === true) {
          this.setState({
            passmodelOpen: true,
            aunthentication_type: aunthentication_type,
          });

          if (type == "resend") {
            this.setState({
              email_success_msg:
                "We have resend varification code on your e-mail please check!!",
              email_err_msg: "",
            });
          } else {
          
              localStorage.setItem(
                "otps",
                JSON.stringify({
                  sms_otp: this.state.sms_otp,
                  email_otp: this.state.email_otp,
                })
              );
              this.setState({
                email_err_msg: result.data.msg,
                email_success_msg: "",
                smsModal: false,
              });
    
              if (this.state.aunthentication_type == "deactivate") {
                this.DeactiveUser(e);
              }
              if (this.state.aunthentication_type == "2faenable") {
                window.location.href = `${config.baseUrl}googleverify`;
              }
              if (this.state.aunthentication_type == "2fadisable") {
                console.log("sssssdd");
                this.setState({ twofaModal: true });
              }
            
          }
        } else if (result.data.success == false) {
          toast.error(result.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
          this.setState({
            email_err_msg: result.data.msg,
            email_success_msg: "",
          });
          // email_success_msg
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("session expired please re-login", {
            position: toast.POSITION.TOP_CENTER,
          });
        } else {
          console.log(err);
          toast.error(err.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      });
  }

  async finalSubmitEmail(e) {
    e.preventDefault();
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };

    axios
      .post(
        `${config.apiUrl}/withdrawAuthentication`,
        {
          email: this.loginData.data?.user_email,
          user_id: this.loginData.data?.id,
          email_otp: this.state.email_otp,
          type: "check_otp",
        },
        { headers: headers }
      )
      .then(async (result) => {
        if (result.data.success === true) {
          this.setState({
            email_err_msg: result.data.msg,
            email_success_msg: "",
            passmodelOpen: false,
          });

          this.setState({ passmodelOpen: false });
          if (this.state.aunthentication_type == "deactivate") {
            this.DeactiveUser(e);
          }
          if (
            this.state.aunthentication_type == "2faenable" ||
            this.state.aunthentication_type == "2fadisable"
          ) {
            // this.SMSModalOpen(e, "send");
          }
        } else if (result.data.success == false) {
          this.setState({
            email_err_msg: result.data.msg,
            email_success_msg: "",
          });
          // email_success_msg
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("session expired please re-login", {
            position: toast.POSITION.TOP_CENTER,
          });
        } else {
          console.log(err);
          toast.error(err.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      });
  }

  async SMSModalOpen(e, type) {
    e.preventDefault();
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };
    axios
      .post(
        `${config.apiUrl}/SMSauthentication`,
        {
          email: this.loginData.data?.user_email,
          user_id: this.loginData.data?.id,
          type: "send_otp",
        },
        { headers: headers }
      )
      .then(async (result) => {
        if (result.data.success === true) {
          this.setState({ smsModal: true });

          if (type == "resend") {
            this.setState({
              email_success_msg:
                "We have resend varification code on your mobile please check!!",
              email_err_msg: "",
            });
          } else {
            this.setState({
              email_success_msg: result.data.msg,
              email_err_msg: "",
            });
          }
        } else if (result.data.success == false) {
          toast.error(result.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
          this.setState({
            email_err_msg: result.data.msg,
            email_success_msg: "",
          });
          // email_success_msg
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("session expired please re-login", {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      });
  }

  async finalSubmitSMS(e) {
    e.preventDefault();
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };

    axios
      .post(
        `${config.apiUrl}/SMSauthentication`,
        {
          email: this.loginData.data?.user_email,
          user_id: this.loginData.data?.id,
          sms_otp: this.state.sms_otp,
          type: "check_otp",
        },
        { headers: headers }
      )
      .then(async (result) => {
        if (result.data.success === true) {
          localStorage.setItem(
            "otps",
            JSON.stringify({
              sms_otp: this.state.sms_otp,
              email_otp: this.state.email_otp,
            })
          );
          this.setState({
            email_err_msg: result.data.msg,
            email_success_msg: "",
            smsModal: false,
          });

          if (this.state.aunthentication_type == "deactivate") {
            this.DeactiveUser(e);
          }
          if (this.state.aunthentication_type == "2faenable") {
            window.location.href = `${config.baseUrl}googleverify`;
          }
          if (this.state.aunthentication_type == "2fadisable") {
            console.log("sssssdd");
            this.setState({ twofaModal: true });
          }
        } else if (result.data.success == false) {
          this.setState({
            email_err_msg: result.data.msg,
            email_success_msg: "",
          });
          // email_success_msg
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("session expired please re-login", {
            position: toast.POSITION.TOP_CENTER,
          });
        } else {
          console.log(err);
          toast.error(err.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      });
  }

  render() {
    console.log("twofaModal", this.state.twofaModal);
    return (
      <>
        <body class="crypt-dark">
          <Header />
          <ToastContainer />
          <br />
          <br />
          <br />
          <br />
          <div className="container">
            <div className="row">
              <h1 className="History">Increase your account security</h1>
            </div>

            <div className="row mt-5">
              <div className="col-12 col-md-6">
                <div className="authtication pl-0 pr-0">
                  <div className="inden_verify">
                    <h1>Personal Info</h1>
                  </div>
                  <div class="number_info">
                    <table>
                      <tr>
                        <th>Name :</th>
                        <td>
                          {this.loginData &&
                            this.loginData.data &&
                            this.loginData.data.user_name}
                        </td>
                      </tr>
                      <tr>
                        <th>Email :</th>
                        <td>
                          {this.loginData &&
                            this.loginData.data &&
                            this.loginData.data.user_email}
                        </td>
                      </tr>
                      <tr>
                        <th>ID :</th>
                        <td>
                          {this.loginData &&
                            this.loginData.data &&
                            this.loginData.data.unic_id}
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="authtication pl-0 pr-0">
                  <div className="inden_verify">
                    <h1>Change Password</h1>
                  </div>
                  <div className="col-sm-12  mt-4">
                    <div className="row">
                      <div className="col-8 col-md-8">
                        <h6>Change Password</h6>
                      </div>
                      <div className="col-4 col-md-4">
                        <a
                          href={`${config.baseUrl}changepassword`}
                          className="setup btn btn-primary"
                        >
                          Change
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="col-12 col-md-6">
                <div className="authtication pl-0 pr-0">
                  <div className="inden_verify">
                    <h1>2FA</h1>
                  </div>
                  <div className="col-sm-12">
                    <div className="row row_key">
                      <div className="col-8 pl-0 col-md-8">
                        <h6>Google Authentication</h6>
                        <p>
                          To secure your account please enable 2FA. Once you
                          enable it the authentication code will be required to
                          login into the system.{" "}
                        </p>
                      </div>

                      <div className="col-4 col-md-4">
                        {this.state.twoAuthenticationData
                          .is_enable_google_auth_code === 1 ? (
                          <a
                            className="setup btn btn-primary"
                            onClick={(e) =>
                              this.ModelOpenFun(e, "send", "2fadisable")
                            }
                            data-toggle="modal"
                            data-target="#disable2FA"
                          >
                            Disable
                          </a>
                        ) : this.state.twoAuthenticationData
                            .is_enable_google_auth_code === 0 ? (
                          <a
                            onClick={(e) =>
                              this.ModelOpenFun(e, "send", "2faenable")
                            }
                            className="setup btn btn-primary"
                          >
                            {" "}
                            Enable
                          </a>
                        ) : (
                          ""
                        )}{" "}
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="col-12 col-md-6">
                <div className="authtication pl-0 pr-0">
                  <div className="inden_verify">
                    <h1>Email Authentication</h1>
                  </div>
                  <div className="col-sm-12">
                    <div className="row row_key">
                      <div className="col-8 pl-0 col-md-8">
                        <h6>Email Authentication</h6>
                        <p>
                          To secure your account please enable Email
                          Authentication. Once you enable it the authentication
                          code will be required to login into the system.
                        </p>
                      </div>
                      <div className="col-4 col-md-4">
                        {this.state.twoAuthenticationData.email_auth === 1 ? (
                          <a
                            onClick={(e) =>
                              this.EmailAuthenticationAPI(e, "email_auth")
                            }
                            data-toggle="modal"
                            data-target="#exampleModalCenter"
                            className="setup btn btn-primary"
                          >
                            Disable
                          </a>
                        ) : this.state.twoAuthenticationData.email_auth ===
                          0 ? (
                          <a
                            onClick={this.EmailAuthenticationAPI}
                            data-toggle="modal"
                            data-target="#exampleModalCenter"
                            className="setup btn btn-primary"
                          >
                            Enable
                          </a>
                        ) : (
                          ""
                        )}{" "}
                      </div>

                      {/* ---------------Start Email Authenticate Model----------------------- */}

                      <div
                        class="modal fade"
                        id="exampleModalCenter"
                        tabindex="-1"
                        role="dialog"
                        aria-labelledby="exampleModalCenterTitle"
                        aria-hidden="true"
                      >
                        <div
                          class="modal-dialog modal-dialog-centered"
                          role="document"
                        >
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5
                                class="modal-title"
                                id="exampleModalLongTitle"
                              >
                                Email Verification
                              </h5>
                              <button
                                type="button"
                                class="close"
                                onClick={(e) => this.closeOtpModal(e)}
                                data-dismiss="modal"
                                aria-label="Close"
                              >
                                <span aria-hidden="true">&times;</span>
                              </button>
                            </div>
                            <div class="table-responsive p-5 pb-0">
                              <form className="text-left ">
                                <label for="email">Enter Code</label>
                                <input
                                  type="text"
                                  id="email"
                                  name="email_otp"
                                  placeholder="Your Code"
                                  onChange={this.handleChange}
                                  value={this.state.email_otp}
                                />
                                <p
                                  style={{
                                    textAlign: "left",
                                    color: "rgb(45 212 191)",
                                  }}
                                >
                                  {this.state.msg}{" "}
                                </p>
                                <input
                                  type="submit"
                                  onClick={this.EmailAuthenticationAPI}
                                  disabled={!this.state.email_otp}
                                  value="Submit"
                                  className="crypt-button-red-full"
                                />
                              </form>
                            </div>
                            <div class="modal-footer"></div>
                          </div>
                        </div>
                      </div>

                      {/* --------------End Email Authenticate Model--------------------- */}

                      <div
                        className="modal fade"
                        id="exampleModals"
                        tabindex="-1"
                        aria-labelledby="exampleModalLabels"
                        aria-hidden="true"
                      >
                        <div className="modal-dialog">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5
                                className="modal-title text-center"
                                id="exampleModalLabels"
                              >
                                Safety Tip
                              </h5>
                              <button
                                type="button"
                                className="close"
                                data-dismiss="modal"
                                aria-label="Close"
                              >
                                <span aria-hidden="true">&times;</span>
                              </button>
                            </div>
                            <div className="modal-body">
                              <p>
                                Please enable your email verification before you
                                would like to disbale SMS Authentication.
                              </p>
                            </div>
                            <div className="modal-footer">
                              <button className="confirm-setup btn btn-primary">
                                Confirm
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="authtication pl-0 pr-0">
                  <div className="inden_verify">
                    <h1>Device Management</h1>
                  </div>
                  <div className="col-sm-12 mt-4">
                    <div className="row">
                      <div className="col-8 col-md-8">
                        <h6>Device Management</h6>
                      </div>
                      <div className="col-4 col-md-4">
                        <a
                          href={`${config.baseUrl}device_managment`}
                          className="setup btn btn-primary"
                        >
                          Manage
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="authtication pl-0 pr-0">
                  <div className="inden_verify">
                    <h1>Identity Verification</h1>
                  </div>
                  <div className="col-sm-12 mt-4">
                    <div className="row row_keys">
                      <div className="col-8 col-md-8">
                        <h6>Identity Verification</h6>
                        {this.state.userKYC.is_kyc_verify === "1" ? (
                          <p style={{ color: "green" }}>Approved</p>
                        ) : this.state.userKYC.is_kyc_verify === "2" ? (
                          <p style={{ color: "red" }}>Rejected</p>
                        ) : (
                          ""
                        )}
                      </div>
                      <div className="col-4 col-md-4">
                        {this.state.userKYC.is_kyc_verify === "0" ? (
                          <a className="setup btn btn-primary">
                            Wait for Approval
                          </a>
                        ) : this.state.userKYC.is_kyc_verify === "1" ? (
                          <a className="setup btn btn-primary">Approved</a>
                        ) : this.state.userKYC.is_kyc_verify === "2" ? (
                          <a
                            href={`${config.baseUrl}setting`}
                            className="setup btn btn-primary"
                          >
                            Re-Apply
                          </a>
                        ) : (
                          <a
                            href={`${config.baseUrl}setting`}
                            className="setup btn btn-primary"
                          >
                            Verify
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="col-12 col-md-6">
                <div className="authtication pl-0 pr-0">
                  <div className="inden_verify">
                    <h1>SMS Authentication</h1>
                  </div>
                  <div className="col-sm-12 mt-4">
                    <div className="row">
                      <div className="col-8 col-md-8">
                        <h6>SMS Authentication</h6>
                        <p>
                          To secure your account please enable SMS
                          Authentication. Once you enable it the authentication
                          code will be required to login into the system.
                        </p>
                      </div>
                      <div className="col-4 col-md-4">
                        {this.state.twoAuthenticationData.sms_auth === 1 ? (
                          <a
                            onClick={(e) =>
                              this.SMSAuthenticationAPI(e, "sms_auth")
                            }
                            data-toggle="modal"
                            data-target="#exampleModalsmsCenter"
                            className="setup btn btn-primary"
                          >
                            Disable
                          </a>
                        ) : this.state.twoAuthenticationData.sms_auth === 0 ? (
                          <a
                            onClick={(e) => this.SMSAuthenticationAPI(e)}
                            data-toggle="modal"
                            data-target="#exampleModalsmsCenter"
                            className="setup btn btn-primary"
                          >
                            Enable
                          </a>
                        ) : (
                          ""
                        )}{" "}
                      </div>

                      <div
                        class="modal fade"
                        id="exampleModalsmsCenter"
                        tabindex="-1"
                        role="dialog"
                        aria-labelledby="exampleModalCenterTitle"
                        aria-hidden="true"
                      >
                        <div
                          class="modal-dialog modal-dialog-centered"
                          role="document"
                        >
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5
                                class="modal-title"
                                id="exampleModalLongTitle"
                              >
                                SMS Verification
                              </h5>
                              <button
                                type="button"
                                class="close"
                                onClick={(e) => this.closeOtpModal(e)}
                                data-dismiss="modal"
                                aria-label="Close"
                              >
                                <span aria-hidden="true">&times;</span>
                              </button>
                            </div>
                            <div class="table-responsive pl-5 pr-5">
                              <form className="text-left mt-2">
                                <label for="email">Enter Code</label>
                                <input
                                  type="text"
                                  id="email"
                                  name="sms_otp"
                                  placeholder="Your Code"
                                  onChange={this.handleChange}
                                  value={this.state.sms_otp}
                                />
                                <p
                                  style={{
                                    textAlign: "left",
                                    color: "rgb(45 212 191)",
                                  }}
                                >
                                  {this.state.sms_msg}{" "}
                                </p>
                                {this.state.currentCount == 60 ? (
                                  <label
                                    onClick={(e) =>
                                      this.SMSAuthenticationAPI(e, "resend")
                                    }
                                    id="resend_otp"
                                  >
                                    Resend code
                                  </label>
                                ) : (
                                  <label id="resend_otp">
                                    Please Wait : {this.state.currentCount}
                                  </label>
                                )}
                                <input
                                  type="submit"
                                  onClick={(e) => this.SMSAuthenticationAPI(e)}
                                  disabled={!this.state.sms_otp}
                                  value="Submit"
                                  className="crypt-button-red-full"
                                />
                              </form>
                            </div>
                            <div class="modal-footer"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="col-12 col-md-6">
                <div className="authtication pl-0 pr-0">
                  <div className="inden_verify">
                    <h1>Account Deactivate</h1>
                  </div>
                  <div className="col-sm-12 mt-4">
                    <div className="row row_keys">
                      <div className="col-8 col-md-8">
                        <h6>Account Deactivate</h6>
                      </div>
                      <div className="col-4 col-md-4">
                        <a
                          onClick={(e) =>
                            this.ModelOpenFun(e, "send", "deactivate")
                          }
                          className="setup btn btn-primary"
                        >
                          De-Active
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Modal
            isOpen={this.state.passmodelOpen}
            // onAfterOpen={afterOpenModal}
            onRequestClose={(e) => this.setState({ passmodelOpen: false })}
            style={modalcustomStyles}
            contentLabel="Example Modal"
          >
            <div class="modal-content" style={{ backgroundColor: "#242e3e" }}>
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">
                  Email Verification
                </h5>
                <button
                  type="button"
                  style={{ color: "rgb(42 118 135)" }}
                  class="close"
                  onClick={(e) =>
                    this.setState({
                      passmodelOpen: false,
                      email_otp: "",
                      email_success_msg: "",
                      email_err_msg: "",
                    })
                  }
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="table-responsive pl-5 pr-5">
                <form className="text-left">
                  <label for="email">Enter Code</label>
                  <input
                    type="text"
                    id="email"
                    name="email_otp"
                    placeholder="Your Code"
                    onChange={(e) => this.handleChange(e)}
                    value={this.state.email_otp}
                  />
                  <p style={{ textAlign: "left", color: "rgb(218 150 1)" }}>
                    {this.state.email_success_msg}{" "}
                  </p>
                  <p style={{ textAlign: "left", color: "red" }}>
                    {this.state.email_err_msg}
                  </p>
                  <span
                    onClick={(e) => this.ModelOpenFun(e, "resend")}
                    id="resend_otp"
                  >
                    Resend Code
                  </span>
                  <input
                    type="submit"
                    onClick={(e) => this.finalSubmitEmail(e, "deactivate")}
                    disabled={!this.state.email_otp}
                    value="Submit"
                    className="crypt-button-red-full"
                  />
                </form>
              </div>
              <div class="modal-footer"></div>
            </div>
          </Modal>

          <Modal
            isOpen={this.state.smsModal}
            // onAfterOpen={afterOpenModal}
            onRequestClose={(e) => this.setState({ smsModal: false })}
            style={modalcustomStyles}
            contentLabel="Example Modal"
          >
            <div class="modal-content" style={{ backgroundColor: "#242e3e" }}>
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">
                  Mobile Verification
                </h5>
                <button
                  type="button"
                  style={{ color: "rgb(42 118 135)" }}
                  class="close"
                  onClick={(e) =>
                    this.setState({
                      smsModal: false,
                      sms_otp: "",
                      email_otp: "",
                      email_success_msg: "",
                      email_err_msg: "",
                    })
                  }
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="table-responsive pl-5 pr-5">
                <form className="text-left">
                  <label for="email">Enter Code</label>
                  <input
                    type="text"
                    id="email"
                    name="sms_otp"
                    placeholder="Your Code"
                    onChange={(e) => this.handleChange(e)}
                    value={this.state.sms_otp}
                  />
                  <p style={{ textAlign: "left", color: "rgb(218 150 1)" }}>
                    {this.state.email_success_msg}{" "}
                  </p>
                  <p style={{ textAlign: "left", color: "red" }}>
                    {this.state.email_err_msg}
                  </p>
                  <span
                    onClick={(e) => this.SMSModalOpen(e, "resend")}
                    id="resend_otp"
                  >
                    Resend Code
                  </span>
                  <input
                    type="submit"
                    onClick={(e) => this.finalSubmitSMS(e, "deactivate")}
                    disabled={!this.state.sms_otp}
                    value="Submit"
                    className="crypt-button-red-full"
                  />
                </form>
              </div>
              <div class="modal-footer"></div>
            </div>
          </Modal>

          {/* -------------- Start 2FA Disable Model------------------------ */}
          <Modal
            isOpen={this.state.twofaModal}
            // onAfterOpen={afterOpenModal}
            onRequestClose={(e) => this.setState({ twofaModal: false })}
            style={modalcustomStyles}
            contentLabel="Example Modal"
          >
            <div class="modal-content" style={{ backgroundColor: "#242e3e" }}>
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">
                  2FA Verification
                </h5>
                <button
                  type="button"
                  class="close"
                  onClick={(e) =>
                    this.setState({
                      smsModal: false,
                      twofaModal: false,
                      sms_otp: "",
                      email_otp: "",
                      email_success_msg: "",
                      email_err_msg: "",
                    })
                  }
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="table-responsive p-5 pb-0">
                <form className="text-left ">
                  <label for="email">Enter Code</label>
                  <input
                    type="text"
                    id="email"
                    name="SecretKey"
                    placeholder="Your Code"
                    onChange={this.handleChange}
                    value={this.state.SecretKey}
                  />
                  <p style={{ textAlign: "left", color: "rgb(45 212 191)" }}>
                    {this.state.msg}{" "}
                  </p>
                  <input
                    type="submit"
                    onClick={(e) => this.twoAuthenticationVerifyAPI(e)}
                    disabled={!this.state.SecretKey}
                    value="Submit"
                    className="crypt-button-red-full"
                  />
                </form>
              </div>
              <div class="modal-footer"></div>
            </div>
          </Modal>

          {/* ----------------End 2FA Disable Model------------------- */}

          <Footer />
        </body>
      </>
    );
  }
}
