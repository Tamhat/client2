import React, { Component } from "react";
import Header from "./directives/header";
import Footer from "./directives/footer";
import config from "./config/config";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import moment from "moment";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { Loader } from "rsuite";
import copy from "copy-to-clipboard";
import Modal from "react-modal";
import TradeRules from "./config/tradevalue";
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

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notification_list: [],
      userorder: [],
      downloadList: [],
      devicelistData: [],
      getOrderList: [],
      TotalBalanceIUSD: 0,
      loader: false,
      getData: "",
      coinList: [],
      showMe: true,
      iseditModalOpen: false,
      editForm: {
        price: "",
        quantity: "",
        remaining_amount: "",
        usdt_price: "",
        isInternal: 0,
        symbol: "",
        leftSymbol: "",
        orderid: "",
        binance_order_id: "",
      },
      from_date: "",
      to_date: "",
      left_coin: "",
      order_type: "",
      right_coin: "",
      isModalOpen: false,
      submitBtn: false,
      copymsg: "",
    };
    this.loginData = !Cookies.get("loginSuccess")
      ? []
      : JSON.parse(Cookies.get("loginSuccess"));
    this.DeactivateAccountAPI = this.DeactivateAccountAPI.bind(this);
    this.operation = this.operation.bind(this);

    this.notificationDetails = this.notificationDetails.bind(this);
  }

  componentDidMount() {
    if (!Cookies.get("loginSuccess")) {
      this.props.history.push(`${config.baseUrl}`);
      // window.location.href = `${config.baseUrl}`
      return false;
    }
    this.DeviceList();
    this.notificationDetails();
    this.getUserOrder();
    this.getPortfolio();

    this.BTCTOUSD();

    this.getProfile();
  }

  copyToClipboard(id) {
    copy(id);

    this.setState({
      copymsg: "copied",
    });
  }

  async getProfile() {
    if (this.loginData.data?.user_email) {
      await axios({
        method: "post",
        url: `${config.apiUrl}/getAPIkey`,
        headers: { Authorization: this.loginData?.Token },
        data: {
          email: this.loginData?.data?.user_email,
          user_id: this.loginData?.data?.id,
        },
      })
        .then((result) => {
          if (result.data.success === true) {
            this.setState({
              api_key: result.data.response.api_key,
            });
          }
        })
        .catch((err) => {
          if (err == "Error: Request failed with status code 403") {
            toast.error("Session expired please re-login");
          }
          this.setState({
            getCountriesList: [],
          });
        });
    }
  }

  async createAPIKEY() {
    let data = {
      email: this.loginData.data?.user_email,
      user_id: this.loginData.data?.id,
    };
    await axios({
      method: "post",
      url: `${config.apiUrl}/createapikey`,
      // headers: { "Authorization": this.loginData?.Token },
      data: data,
    })
      .then((result) => {
        if (result.data.success === true) {
          this.getProfile();
          this.setState({
            api_key: result.data.response.api_key,
          });
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        }
        console.log("err", err.response?.data?.msg);
        this.setState({
          getCountriesList: [],
          copymsg: err.response?.data?.msg,
        });
      });
  }

  async orderListAPI() {
    await axios({
      method: "post",
      url: `${config.apiUrl}/orderHistory` + "?nocache=" + new Date().getTime(),
      headers: { Authorization: this.loginData?.Token },
      data: {
        email: this.loginData?.data.user_email,
        user_id: this.loginData.data?.id,
        status: 0,
        from_date: moment(this.state.from_date).format(),
        to_date: moment(this.state.to_date).format(),
        left_coin: this.state.left_coin,
        order_type: this.state.order_type,
        right_coin: this.state.right_coin,
      },
    })
      .then((result) => {
        if (result.data.success === true) {
          let newarr = [];
          if (result.data.response.length > 0) {
            for (let x in result.data.response) {
              let obj = result.data.response[x];
              obj.status =
                result.data.response[x].status == 0
                  ? "Open"
                  : result.data.response[x].status == 1
                  ? "Completed"
                  : "Cancelled";
              newarr.push(obj);
            }
          }
          this.setState({
            userorder: result.data.response,
            downloadList: newarr,
          });
        } else if (result.data.success === false) {
          this.setState({
            userorder: [],
          });
        }
      })

      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        } else {
          toast.error(err.result?.data?.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      });
    setTimeout(() => {
      this.setState({
        submitBtn: false,
      });
    }, 900);
  }

  filterSubmit(e) {
    e.preventDefault();
    this.setState({
      submitBtn: true,
    });
    this.orderListAPI();
  }

  resetFilter(e) {
    e.preventDefault();
    this.setState({
      from_date: "",
      to_date: "",
      left_coin: "",
      right_coin: "",
    });
    this.orderListAPI();
  }

  async BTCTOUSD() {
    const response2 = await fetch(
      "https://min-api.cryptocompare.com/data/price?fsym=USDT&tsyms=BTC",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const usdPrice = await response2.json();
    this.setState({
      getData: usdPrice.BTC,
    });
  }
  async notificationDetails() {
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };
    await axios
      .get(`${config.apiUrl}/getusernotification`, {}, { headers })
      .then((result) => {
        if (result.data.success === true) {
          this.setState({
            notification_list: result.data.response,
          });
        } else if (result.data.success === false) {
        }
      })

      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        }
      });
  }

  async getUserOrder(e) {
    var data = {
      user_id: this.loginData.data?.id,
    };
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };
    axios
      .post(`${config.apiUrl}/getdashuserorder`, data, { headers: headers })
      .then((response) => {
        if (response.data.success === true) {
          if (response.data.response.length > 0) {
            for (let x in response.data.response) {
              let obj = response.data.response[x];
              obj.status =
                response.data.response[x].status == 0
                  ? "Open"
                  : response.data.response[x].status == 1
                  ? "Completed"
                  : "Cancelled";
            }
          }
          this.setState({
            userorder: response.data.response,
          });
        } else if (response.data.success === false) {
          toast.error(response.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          });
        }
      })

      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        }
        this.setState({
          userorder: [],
        });
      });
  }

  countPlaces(num) {
    var text = num.toString();
    var index = text.indexOf(".");
    return index == -1 ? 0 : text.length - index - 1;
  }

  modifyOrder(e) {
    e.preventDefault();
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };

    let URL =
      `${config.apiUrl}/modifyOrder` + "?nocache=" + new Date().getTime();
    if (this.state.editForm.isInternal == 1) {
      URL =
        `${config.apiUrl}/modifyInternalOrder` +
        "?nocache=" +
        new Date().getTime();
    }

    axios
      .post(
        `${URL}`,
        {
          user_id: this.loginData.data?.id,
          email: this.loginData.data?.user_email,
          order_id: this.state.editForm.orderid,
          binance_order_id: this.state.editForm.binance_order_id,
          symbol: this.state.editForm.symbol,
          leftSymbol: this.state.editForm.leftSymbol,
          remaining_amount:
            this.state.editForm.remaining_amount +
            (this.state.editForm.quantity -
              this.state.editForm.remaining_amount),
          price: this.state.editForm.price,
          quantity: this.state.editForm.quantity,
          usdt_price: this.state.editForm.usdt_price,
          decimal_places: this.countPlaces(
            parseFloat(this.state.editForm.usdt_price)
          ),
        },
        { headers: headers }
      )
      .then((result) => {
        if (result.data.success === true) {
          toast.success(result.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          });

          this.setState({ iseditModalOpen: false });
          this.componentDidMount();
        } else if (result.data.success === false) {
          toast.error(result.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          });

          this.setState({ iseditModalOpen: false });
          this.componentDidMount();
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

  cancelOrderAPI(id) {
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };
    let URL =
      `${config.apiUrl}/cancelOrder` + "?nocache=" + new Date().getTime();
    if (id.isInternal == 1) {
      URL =
        `${config.apiUrl}/cancelInternalOrder` +
        "?nocache=" +
        new Date().getTime();
    }

    confirmAlert({
      title: "Confirm to submit",
      message: "Are you sure to Cancel order",
      buttons: [
        {
          label: "Yes",
          onClick: () =>
            axios
              .post(
                `${URL}`,
                {
                  user_id: this.loginData.data?.id,
                  email: this.loginData.data?.user_email,
                  order_id: id.order_id,
                  binance_order_id: id.binance_order_id,
                  symbol: `${id.leftSymbol}${id.rightSymbol}`,
                },
                { headers: headers }
              )
              .then((result) => {
                if (result.data.success === true) {
                  toast.success(result.data.msg, {
                    position: toast.POSITION.TOP_CENTER,
                  });

                  this.componentDidMount();
                } else if (result.data.success === false) {
                  toast.error(result.data.msg, {
                    position: toast.POSITION.TOP_CENTER,
                  });
                  this.componentDidMount();
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
              }),
        },
        {
          label: "No",
        },
      ],
    });
  }

  logout() {
    window.location.href = `${config.baseUrl}login`;
    Cookies.remove("loginSuccess");
    // window.location.href = "http://15.207.99.96/vnds/users/logout"
  }

  async logOutActivity() {
    await axios({
      method: "post",
      url: `${config.apiUrl}/logout`,
      headers: { Authorization: this.loginData?.Token },
      data: {
        email: this.loginData?.data.user_email,
        user_id: this.loginData?.data.id,
      },
    })
      .then((result) => {
        if (result.data.success === true) {
          window.location.href = `${config.baseUrl}login`;
          Cookies.remove("loginSuccess");
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        }
        console.log("err", err.response?.data?.msg);
        this.setState({
          getCountriesList: [],
          copymsg: err.response?.data?.msg,
        });
      });
  }

  DeactivateAccountAPI() {
    let headers = {
      Authorization: this.loginData?.Token,
      "Content-Type": "application/json",
    };

    confirmAlert({
      title: "Confirm to submit",
      message: "Are you sure to DeActivate Account",
      buttons: [
        {
          label: "Yes",
          onClick: () =>
            axios
              .post(
                `${config.apiUrl}/deactivate`,
                {
                  user_id: this.loginData.data?.id,
                  email: this.loginData.data.user_email,
                },
                { headers: headers }
              )
              .then((result) => {
                if (result.data.success === true) {
                  toast.success(result.data.msg, {
                    position: toast.POSITION.TOP_CENTER,
                  });

                  this.logout();
                  this.componentDidMount();
                } else if (result.data.success === false) {
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
              }),
        },
        {
          label: "No",
        },
      ],
    });
  }

  async DeviceList() {
    axios({
      method: "post",
      url: `${config.apiUrl}/getuserdevice`,
      data: { user_id: this.loginData.data?.id },
    }).then((response) => {
      if (response.data.success === true) {
        this.setState({
          devicelistData: response.data.response,
        });
      }
    });
  }

  async getPortfolio() {
    var lastprice = 0;
    await axios({
      method: "get",
      url: `${config.apiUrl}/getPortfolio?user_id=${this.loginData.data?.id}`,
    }).then(async (response) => {
      this.setState({ TotalBalanceIUSD: response?.data?.total_balance });
    });
  }

  operation() {
    this.setState({
      showMe: !this.state.showMe,
    });
  }

  handleChangeStart = (date) => {
    this.setState({
      from_date: date,
    });
  };

  handleChangeEnd = (date) => {
    this.setState({
      to_date: date,
    });
  };

  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  downloadCSVFromJson = (filename, arrayOfJson) => {
    if (arrayOfJson.length > 0) {
      // convert JSON to CSV
      const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
      const header = Object.keys(arrayOfJson[0]);
      let csv = arrayOfJson.map((row) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(",")
      );
      csv.unshift(header.join(","));
      csv = csv.join("\r\n");

      // Create link and download
      var link = document.createElement("a");
      link.setAttribute(
        "href",
        "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csv)
      );
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  editModal(e, data) {
    this.setState({ iseditModalOpen: true });
    setTimeout(() => {
      this.setState({
        editForm: {
          ...this.state.editForm,
          remaining_amount: data.remaining_amount,
          price: data.price,
          isInternal: data.isInternal,
          quantity: parseFloat(
            data.amount + data.fee_amount + data.tds_vda_fee
          ).toFixed(6),
          usdt_price: parseFloat(
            parseFloat(data.usdt_amount) + data.usdt_fee + data.tds_usdt_fee
          ).toFixed(4),
          leftSymbol: data.leftSymbol,
          symbol: `${data.leftSymbol}${data.rightSymbol}`,
          orderid: data.order_id,
          binance_order_id: data.binance_order_id,
        },
      });
    }, 200);
  }

  closeModal(e) {
    this.setState({ iseditModalOpen: false });
  }

  handleChange(e) {
    const { name, value } = e.target;
    const re = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
    if (re.test(value) || value == "") {
      var field = "";
      var fieldvalue = 0;

      if (name == "price") {
        this.setState({
          editForm: {
            ...this.state.editForm,
            [name]: value,
            ["usdt_price"]: parseFloat(
              parseFloat(this.state.editForm.quantity).toFixed(
                TradeRules[this.state.editForm.leftSymbol]
              ) * parseFloat(value)
            ).toFixed(5),
          },
        });
      } else {
        if (name == "usdt_price") {
          field = "quantity";
          fieldvalue = parseFloat(
            parseFloat(value) / parseFloat(this.state.editForm.price)
          ).toFixed(5);
        } else if (name == "quantity") {
          field = "usdt_price";
          fieldvalue = parseFloat(
            parseFloat(value).toFixed(
              TradeRules[this.state.editForm.leftSymbol]
            ) * parseFloat(this.state.editForm.price)
          ).toFixed(5);
        }

        this.setState({
          editForm: {
            ...this.state.editForm,
            [name]: value,
            [field]: fieldvalue,
          },
        });
      }
    }
  }

  closeISModal(e) {
    this.setState({ isModalOpen: false, copymsg: "" });
  }

  openISModal(e) {
    this.setState({ isModalOpen: true });
  }

  render() {
    // console.log(this.state.userorder)

    return (
      <>
        <Header />
        <div class="container-fluid">
          <div class="row sm-gutters" id="row_marketplace">
            <div class="col-12 col-lg-7 col-md-12">
              <div>
                <div
                  class="crypt-market-status_rd mt-4 p-2"
                  style={{ minHeight: "284px;" }}
                >
                  <div class="balance-detail">
                    <div class="row">
                      <div class="col-sm-8">
                        <h4 class="pt-2 pb-2 pl-2">Balance Detail</h4>
                      </div>
                      <div class="col-sm-4 text-right">
                        <button
                          type="button"
                          onClick={this.openISModal.bind(this)}
                          class="btn btn-primary btn-sm mt-2"
                        >
                          API Key
                        </button>
                      </div>

                      <div class="col-sm-4 text-right"></div>

                      <Modal
                        isOpen={this.state.isModalOpen}
                        onRequestClose={(e) => this.closeISModal(e)}
                        style={customStyles}
                        contentLabel="Example Modal"
                      >
                        <button
                          className=" btn_close"
                          onClick={(e) => this.closeISModal(e)}
                          style={{ float: "right" }}
                        >
                          X
                        </button>
                        <div className=" time-modal">
                          <div className="row">
                            <div className="col-md-12">
                              <h2>API Key !!</h2>
                              <br />
                              <div className="timing_container">
                                {this.state.api_key == null ? (
                                  <button
                                    className="crypt-button-red-full"
                                    onClick={this.createAPIKEY.bind(this)}
                                  >
                                    Create API Key
                                  </button>
                                ) : (
                                  <>
                                    <b>
                                      {this.state.api_key
                                        .toString()
                                        .substring(0, 25) +
                                        "..." +
                                        this.state.api_key
                                          .toString()
                                          .substr(
                                            this.state.api_key.length - 25
                                          )}
                                    </b>
                                    <button
                                      style={{
                                        background:
                                          "linear-gradient(45deg, rgb(45 212 191), rgb(45 212 191))",
                                      }}
                                      onClick={this.copyToClipboard.bind(
                                        this,
                                        this.state.api_key
                                      )}
                                    >
                                      Copy
                                    </button>
                                  </>
                                )}
                                <p style={{ color: "green" }}>
                                  {this.state.copymsg}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Modal>
                    </div>
                  </div>
                  <div class="mt-4 pt-3 pb-5">
                    <div class="row">
                      <div class="col-sm-12 text-center">
                        <div class="text-white">
                          <span>Account balance:</span>&nbsp;&nbsp;
                          <button
                            class="btn-primary "
                            style={{ border: " none" }}
                            onClick={this.operation}
                          >
                            <i class="fa fa-eye"></i>
                          </button>
                        </div>

                        <div class="mt-2 text-white">
                          {this.state.showMe ? (
                            this.state.loader == true ? (
                              <span>Loading...</span>
                            ) : (
                              <h2>
                                {parseFloat(
                                  this.state.getData *
                                    this.state.TotalBalanceIUSD
                                ).toFixed(6)}
                                <span class="btn-accountbalance">BTC</span>
                              </h2>
                            )
                          ) : (
                            "**************"
                          )}
                        </div>
                        <div class="text-white mt-2">
                          <span>Account balance:</span>
                          {this.state.showMe ? (
                            this.state.loader == true ? (
                              <span> Loading...</span>
                            ) : (
                              <h5 class="amount-account mt-1">
                                {!this.state.TotalBalanceIUSD
                                  ? "0.0000"
                                  : "USDT" +
                                    parseFloat(
                                      this.state.TotalBalanceIUSD
                                    ).toFixed(2)}
                              </h5>
                            )
                          ) : (
                            <h5>{"*******"}</h5>
                          )}{" "}
                        </div>
                      </div>
                      <div class="col-sm-6 text-right"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 col-lg-5 col-md-12">
              <div>
                <div class="crypt-market-status_anno mt-4 Announcement-box">
                  <div class="balance-detail">
                    <div class="row">
                      <div class="col-sm-8">
                        <h4 class="pt-2 pb-2 pl-2">Announcement</h4>
                      </div>
                      <div class="col-sm-4 text-right">
                        <a href={`${config.baseUrl}announcements`}>
                          <button
                            type="button"
                            class="btn btn-primary btn-sm mt-2"
                          >
                            More
                          </button>
                        </a>{" "}
                      </div>
                    </div>
                  </div>
                  {this.state.notification_list.map((item, i) =>
                    i < 3 ? (
                      <div class="Announcement-list">
                        <Link to={`${config.baseUrl}announcements`}>
                          <p
                            rel="noopener noreferrer"
                            text-decoration="none"
                            class=""
                          >
                            <div class="LinesEllipsis d-inline  ">
                              {item.title} <wbr />
                            </div>
                            <div class="pull-right">
                              {item.datetime.slice(0, 10)}
                            </div>
                          </p>
                        </Link>
                      </div>
                    ) : (
                      ""
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="container-fluid mt-0">
          <div class="row sm-gutters" style={{ marginBottom: "20px" }}>
            <div class="col-12 col-lg-7 col-md-12">
              <div class="crypt-market-status_a mt-4 Announcement-box">
                <div>
                  <h4 class="pt-2 pb-2 pl-2">Open Orders</h4>

                  <div class="tab-content">
                    <div
                      role="tabpanel"
                      className="tab-pane active mb-4"
                      id="usd"
                      style={{ display: "block" }}
                    >
                      <form onSubmit={(e) => this.filterSubmit(e)}>
                        <div className="row p-3">
                          <div className="col-md-6">
                            {/* <form> */}
                            <div className="row justify-content-md-center">
                              <div className="col-lg-4 col-12">
                                <div className="form-group">
                                  <label for="pure-date">From Date</label>
                                  <div className="input-group mb-4">
                                    <div className="input-group-prepend"></div>
                                    <DatePicker
                                      placeholderText="From Date"
                                      className="input-control"
                                      autoComplete={false}
                                      onChange={(e) =>
                                        this.handleChangeStart(e)
                                      }
                                      selected={this.state.from_date}
                                      name="from_date"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-12">
                                <div className="form-group">
                                  <label for="from-date">To Date</label>
                                  <div className="input-group mb-4 constrained">
                                    <div className="input-group-prepend"></div>
                                    <DatePicker
                                      placeholderText="To Date"
                                      className="input-control"
                                      autoComplete={false}
                                      onChange={(e) => this.handleChangeEnd(e)}
                                      selected={this.state.to_date}
                                      name="to_date"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-12">
                                <div className="form-group">
                                  <label
                                    for="exampleInputEmail1"
                                    className="form-label"
                                  >
                                    Type
                                  </label>
                                  <select
                                    className="form-select"
                                    aria-label="Default select example"
                                    onChange={(e) => this.onChange(e)}
                                    name="order_type"
                                  >
                                    <option selected value="">
                                      All
                                    </option>
                                    <option value="BUY">Buy </option>
                                    <option value="SELL">Sell </option>

                                    <i classname="fa fa-chevron-down"></i>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6 d-flex align-items-center">
                            <div className="row mt-4">
                              <div className="col-lg-4 col-12 pb-2">
                                <button
                                  className="btn btn-primary btn-reset w-100"
                                  type="button"
                                  onClick={this.resetFilter.bind(this)}
                                >
                                  Reset
                                </button>
                              </div>
                              <div className="col-lg-4 col-12 pb-2">
                                <button
                                  className="btn btn-primary btn-submit w-100"
                                  type="submit"
                                  disabled={this.state.submitBtn}
                                >
                                  {this.state.submitBtn
                                    ? "Loading..."
                                    : "Search"}
                                </button>
                              </div>
                              <div className="col-lg-4 col-12 pb-2">
                                <button
                                  class="btn btn-primary btn-reset w-100"
                                  type="button"
                                  onClick={(e) =>
                                    this.downloadCSVFromJson(
                                      "openorders.csv",
                                      this.state.userorder
                                    )
                                  }
                                  style={{
                                    fontSize: "13px",
                                    padding: "10px 5px",
                                  }}
                                >
                                  <i class="fa fa-download"></i> Download
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div role="tabpanel" class="tab-pane active">
                      <div class="table-responsive">
                        <table class="table table-striped">
                          <thead>
                            <tr>
                              <th scope="col">Time</th>
                              <th scope="col">Type</th>
                              <th>Pair</th>
                              <th scope="col">Price</th>
                              <th scope="col">Amount</th>
                              <th scope="col">Total</th>
                              {/* <th scope="col">Filled</th> */}
                              <th scope="col">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.userorder.length === 0 ? (
                              <tr>
                                <td
                                  colspan="8"
                                  className="text-center"
                                  id="nodata_found"
                                >
                                  No Data Found
                                </td>
                              </tr>
                            ) : (
                              this.state.userorder.map((item) => (
                                <tr>
                                  <td>{moment(item.datetime).format("lll")}</td>
                                  <td
                                    className={`${
                                      item.order_type == "BUY"
                                        ? "crypt-up"
                                        : "crypt-down"
                                    }`}
                                  >
                                    {item.order_type}
                                  </td>
                                  <td>
                                    {item.leftSymbol}/{item.rightSymbol}
                                  </td>
                                  <td>{parseFloat(item.price).toFixed(6)}</td>
                                  <td>{parseFloat(item.amount).toFixed(6)}</td>
                                  <td>
                                    {parseFloat(
                                      item.amount +
                                        item.gst_quantity_fee +
                                        item.tds_vda_fee +
                                        item.fee_amount
                                    ).toFixed(6)}
                                  </td>

                                  <td>
                                    <button
                                      type="button"
                                      className="btn-danger"
                                      onClick={this.cancelOrderAPI.bind(
                                        this,
                                        item
                                      )}
                                      data-toggle="tooltip"
                                      data-original-title=""
                                    >
                                      {" "}
                                      <i
                                        class="ico-times"
                                        role="img"
                                        aria-label="Cancel"
                                      ></i>
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-danger"
                                      onClick={(e) => this.editModal(e, item)}
                                      data-toggle="tooltip"
                                      data-original-title=""
                                    >
                                      {" "}
                                      <i
                                        class="fa fa-edit"
                                        role="img"
                                        aria-label="Cancel"
                                      ></i>
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 col-lg-5 col-md-12 account_activity">
              <div class="crypt-market-status mt-4 Announcement-box">
                <div>
                  <div className="row">
                    <div className="col-sm-6">
                      <h4 class="pt-2 pb-2 pl-2">Account Activity</h4>
                    </div>
                    <div className="col-sm-3">
                      <a
                        onClick={(e) => this.logOutActivity(e)}
                        device_managment
                        className="pull-right mt-2 mb-2"
                      >
                        <button type="button" class="btn btn-primary btn-sm">
                          Logout Activity
                        </button>
                      </a>
                    </div>
                    <div className="col-sm-3">
                      <a
                        href={`${config.baseUrl}device_managment`}
                        device_managment
                        className="pull-right mt-2 mb-2"
                      >
                        <button type="button" class="btn btn-primary btn-sm">
                          More
                        </button>
                      </a>
                    </div>
                  </div>
                  <ul class="nav nav-tabs activity">
                    <li role="presentation">
                      <a href="#activity" class="active" data-toggle="tab">
                        Activity
                      </a>
                    </li>
                    <li role="presentation">
                      <a href="#devices" data-toggle="tab">
                        Devices
                      </a>
                    </li>
                  </ul>
                  <div class="tab-content">
                    <div role="tabpanel" class="tab-pane active" id="activity">
                      <table class="table table-striped">
                        <tbody>
                          {this.state.devicelistData.slice(0, 4).map((item) => (
                            <tr>
                              <td class="col-sm-6">
                                <div>
                                  {/* <div class="">{item.browsername}  {item.browserversion}</div> */}
                                  <div class="">
                                    {item.city} {item.country}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div class="">{item.ip_address}</div>
                                <div>{item.datetime}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div role="tabpanel" class="tab-pane" id="devices">
                      <table class="table table-striped">
                        <tbody>
                          {this.state.devicelistData.slice(0, 4).map((item) => (
                            <tr>
                              <td class=" col-sm-6">
                                <div>
                                  <div class="">
                                    {item.browsername} {item.browserversion}
                                  </div>
                                  <div class="">
                                    {item.city} {item.country}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div class="">{item.ip_address}</div>
                                <div>{item.datetime}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />

        <Modal
          isOpen={this.state.iseditModalOpen}
          onRequestClose={(e) => this.closeModal(e)}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <button
            className=" btn_close"
            onClick={(e) => this.closeModal(e)}
            style={{ float: "right" }}
          >
            X
          </button>
          <form onSubmit={(e) => this.modifyOrder(e)}>
            <div class="content-padding-modal AppFormLeft">
              <div>
                <div class="quotes-view" id="bank_details_new">
                  <div class="quotes-view-container" id="bank_details">
                    <h2>Modify Order</h2>
                    <div class="qtyccy-selector cs-special">
                      <div class="quantityWrapper">
                        <span inputmode="numeric" selected>
                          <input
                            type="text"
                            name="price"
                            autocomplete="off"
                            value={this.state.editForm.price}
                            onChange={(e) => this.handleChange(e)}
                            className="input-control"
                          />
                        </span>
                        <div class="quantity-input-label cs-subtext cs-special-subtext">
                          Price
                        </div>
                      </div>
                    </div>
                    &nbsp;
                    <div class="qtyccy-selector cs-special">
                      <div class="quantityWrapper">
                        <span>
                          <input
                            type="text"
                            min="0"
                            inputmode="numeric"
                            autocomplete="off"
                            name="quantity"
                            class="inputField"
                            for="amount"
                            onChange={(e) => this.handleChange(e)}
                            value={this.state.editForm.quantity}
                          />
                        </span>
                        <div class="quantity-input-label cs-subtext cs-special-subtext">
                          Quantity
                        </div>
                      </div>
                    </div>
                    &nbsp;
                    <div class="qtyccy-selector cs-special">
                      <div class="quantityWrapper">
                        <span>
                          <input
                            type="text"
                            min="0"
                            inputmode="numeric"
                            autocomplete="off"
                            name="usdt_price"
                            class="inputField"
                            for="amount"
                            onChange={(e) => this.handleChange(e)}
                            value={this.state.editForm.usdt_price}
                          />
                        </span>
                        <div class="quantity-input-label cs-subtext cs-special-subtext">
                          USDT amount
                        </div>
                      </div>
                    </div>
                    &nbsp;
                    <br />
                    <p style={{ color: "red" }}>{this.state.errorMsg1}</p>
                    <div className="modal-footer">
                      <button
                        type="submit"
                        className="btn btn-primary btn-confirm col-sm-12"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Modal>
      </>
    );
  }
}
