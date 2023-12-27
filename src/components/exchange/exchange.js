import React, { Component } from "react";
import Header from "../../directives/header";
import Footer from "../../directives/footer";
import socketIOClient, { Socket } from "socket.io-client";
import axios from "axios";
import config from "../../config/config";
import Cookies from "js-cookie";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import Countdown, { zeroPad } from "react-countdown";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import Modal from "react-modal";
import { Link, Redirect } from "react-router-dom";
import Binance from "binance-api-node";
import TradeRules from "../../config/tradevalue";
import Websocket from "react-websocket";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import Loader from "react-loader-spinner";
import moment from "moment";
import { createChart, CrosshairMode } from "lightweight-charts";
const ENDPOINT = config.socketUrl;
const socket = socketIOClient(ENDPOINT, {
  transports: ["websocket", "polling", "flashsocket"],
});
var W3CWebSocket = require("websocket").w3cwebsocket;
// var growfinexclient = new W3CWebSocket('wss://espsofttech.org:6010/', 'echo-protocol');
// var growfinexclient = new W3CWebSocket(`${config.webSocketUrl}`, 'echo-protocol');
const clientList = Binance();
var candleSeries;
var chart;

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
export default class exchange extends Component {
  constructor(props) {
    super(props);

    this.loginData = !Cookies.get("loginSuccess")
      ? []
      : JSON.parse(Cookies.get("loginSuccess"));

    this.loginId = !this.loginData.data ? 0 : this.loginData.data.id;
    this.href = window.location.href;
    this.coin_symbol = this.href.substring(this.href.lastIndexOf("/") + 1);

    this.state = {
      headerFilters: ["ALL", "FAVOURITE", "GAINERS", "LOSERS"],
      headerSeacrhCoin: ["INR", "USDT", "BTC", "BNB", "ETH"],
      filtertab: "ALL",
      isTimerModalOpen: false,
      currency: "USDT",
      my_pair_list: [],
      tradeData: [],
      selectPairsToken: [],
      livebookOrderbuy: [],
      livebookOrdersell: [],
      openTab: 1,
      isModalOpen: false,
      iseditModalOpen: false,
      editForm: {
        price: "",
        quantity: "",
        usdt_price: "",
        remaining_amount: "",
        isInternal: 0,
        symbol: "",
        leftSymbol: "",
        rightSymbol: "",
        orderid: "",
        binance_order_id: "",
      },
      search: "",
      my_order_list: [],
      user_order_list: [],
      order_list_spinner: false,
      sell_amount: 0,
      buy_amount: 0,
      buy_price: 0,
      sell_price: 0,
      ws1: "",
      ws2: "",
      ws3: "",
      buy_usd_amount: 0,
      sell_usd_amount: 0,
      clickOncoin: "",
      total_sell_amount: 0,
      total_buy_amount: 0,
      SelectSellPercentange: 0,
      SelectBuyPercentange: 0,
      redTotalBuyAmount: false,
      redTotalSellAmount: false,
      isMarket: 0,
      resp: false,
      mainData1: [],
      chartUpdate: false,
      favoritePair: [],
      adminFeesPrices: [],
      selectCoin: [],
      coinList: [],
      webSocketReset: true,
      interval: 1,
      graph_type: "binance_graph",
      inr_price: 0,
      dai_inrprice: 0,
      usdt_btc: 0,
      toCheckCoinVisible: false,
      disableButtons: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.selectPairsTokenFun = this.selectPairsTokenFun.bind(this);
    // this.sell_submit = this.sell_submit.bind(this)
    // this.buy_submit = this.buy_submit.bind(this)
    this.onChange = this.onChange.bind(this);
    this.userOrder = this.userOrder.bind(this);
    this.pairListAPI = this.pairListAPI.bind(this);
    this.Favorite_Pair = this.Favorite_Pair.bind(this);
    this.liveOrderFromBinance = this.liveOrderFromBinance.bind(this);
  }

  async coinListAPI() {
    await axios({
      method: "get",
      url: `${config.apiUrl}/coinList` + "?nocache=" + new Date().getTime(),
    }).then((result) => {
      if (result.data.success === true) {
        var selectCooin = result.data.response.findIndex(
          (i) => i.symbol == this.coin_symbol
        );
        if (selectCooin < 0) {
          selectCooin = 0;
        }
        this.setState({
          selectCoin: result.data.response[selectCooin],
          coinList: result.data.response,
        });
        //   console.log('---------',this.state.selectCoin);
      } else if (result.data.success === false) {
        this.setState({
          coinList: [],
        });
      }
    });
  }

  async componentDidMount() {
    this.orderBook();
    this.userOrder(this.state.openTab);
    this.coinListAPI();
    this.liveInrUsdt();
    this.getUSDTBTCPrice();
    this.getadminFeePrices();
    // console.log(JSON.parse(localStorage.getItem("selectedPair")))
    if (this.coin_symbol.length > 2 && this.coin_symbol != "Exchange") {
      this.pairListAPIforCoin(`${this.coin_symbol}`);
      // alert('1111')
    } else {
      if (Cookies.get("tradeCoin")) {
        // alert('2222222')
        this.pairListAPI(Cookies.get("tradeCoin"));
        Cookies.set("tradeCoin", "", {
          secure: config.Secure,
          HttpOnly: config.HttpOnly,
        });
      } else {
        // alert('333333333')
        this.pairListAPI();
      }
    }
  }

  async pairListAPIforCoin(id) {
    if (id) {
      this.searchData = id;
    }

    if (id == "exchange") {
      this.searchData = `/USDT`;
    }

    // console.log('444444444444',this.searchData,JSON.parse(localStorage.getItem("selectedPair")))
    var data = {
      user_id: this.loginData?.data?.id,
      email: this.loginData?.data?.user_email,
      search: this.searchData,
    };
    await axios({
      method: "post",
      url: `${config.apiUrl}/pairlist` + "?nocache=" + new Date().getTime(),
      headers: { Authorization: this.loginData?.Token },
      // data: { search: this.searchData }
      data: data,
    })
      .then(async (result) => {
        if (result.data.success === true) {
          var mainData = result.data.response;
          localStorage.setItem("selectedPair", JSON.stringify(mainData[0]));
          setTimeout(() => {
            this.pairListAPI();
          }, 200);
        } else if (result.data.success === false) {
          toast.error(result.data.msg);
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        }
      });
  }

  async getToCheckCoinVisible(symbol) {
    this.SingalCoin = this.coin_symbol;

    // if (this.SingalCoin == 'exch' || this.SingalCoin == 'Exch' || this.SingalCoin == 'Exchange') {
    //     return false;
    // } else {
    let data = {
      newcoin: symbol,
    };
    await axios({
      method: "post",
      url: `${config.apiUrl}/toCheckCoinVisible`,
      // headers: { "Authorization": this.loginData.message },
      data: data,
    })
      .then(async (result) => {
        if (result.data.success === true) {
          this.setState({
            isTimerModalOpen: true,
            opening_date: result.data.response.opening_date,
            Comingsymbol: result.data.response.symbol,
          });
        } else if (result.data.success === false) {
          this.setState({
            isTimerModalOpen: false,
          });
        }
      })

      .catch((err) => {
        this.setState({
          isTimerModalOpen: false,
        });
      });
    // }
  }

  async getadminFeePrices() {
    await axios({
      method: "get",
      url: `${config.apiUrl}/getAdminfeePrices`,
      headers: { Authorization: this.loginData.message },
    })
      .then((result) => {
        if (result.data.success === true) {
          this.setState({
            adminFeesPrices: result.data.response,
          });
        } else if (result.data.success === false) {
          this.setState({
            adminFeesPrices: [],
          });
        }
      })
      .catch((err) => {
        this.setState({
          adminFeesPrices: [],
        });
      });
  }

  buyonUsdtChange(e) {
    const toFix =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol !== "BTC"
        ? 4
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol == "BTC"
        ? 10
        : TradeRules[this.state.selectPairsToken.left_symbol];

    const re =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol == "BTC"
        ? /^[0-9]*(\.[0-9]{0,10})?$/
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol !== "BTC"
        ? /^[0-9]*(\.[0-9]{0,4})?$/
        : /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;

    if (re.test(e.target.value) || e.target.value == "") {
      this.setState({ buy_usd_amount: e.target.value });
      if (
        this.state.my_pair_list &&
        this.state.my_pair_list.length > 0 &&
        e.target.value
      ) {
        var livep = this.state.my_pair_list.filter(
          (item) => item.pair == this.state.selectPairsToken.pair
        );
        if (this.state.isMarket == 0) {
          this.setState({
            buy_amount: parseFloat(
              parseFloat(e.target.value.replace(/(\.\d{4})\d+/g, "$1")) /
                parseFloat(this.state.buy_price)
            ).toFixed(toFix),
          });
        } else {
          this.setState({
            buy_amount: parseFloat(
              parseFloat(e.target.value.replace(/(\.\d{4})\d+/g, "$1")) /
                parseFloat(livep[0].livePrice)
            ).toFixed(toFix),
          });
        }
      }
    }
  }

  sellonUsdtChange(e) {
    const toFix =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol !== "BTC"
        ? 4
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol == "BTC"
        ? 10
        : TradeRules[this.state.selectPairsToken.left_symbol];

    // const re = this.state.graph_type == 'custom_graph' ? /^[0-9]*(\.[0-9]{0,4})?$/ : /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/
    const re =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol == "BTC"
        ? /^[0-9]*(\.[0-9]{0,10})?$/
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol !== "BTC"
        ? /^[0-9]*(\.[0-9]{0,4})?$/
        : /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;

    if (re.test(e.target.value) || e.target.value == "") {
      this.setState({ sell_usd_amount: e.target.value });

      if (
        this.state.my_pair_list &&
        this.state.my_pair_list.length > 0 &&
        e.target.value
      ) {
        var livep = this.state.my_pair_list.filter(
          (item) => item.pair == this.state.selectPairsToken.pair
        );
        if (this.state.isMarket == 0) {
          this.setState({
            sell_amount: parseFloat(
              parseFloat(e.target.value.replace(/(\.\d{4})\d+/g, "$1")) /
                parseFloat(this.state.sell_price)
            ).toFixed(toFix),
          });
        } else {
          this.setState({
            sell_amount: parseFloat(
              parseFloat(e.target.value.replace(/(\.\d{4})\d+/g, "$1")) /
                parseFloat(livep[0].livePrice)
            ).toFixed(toFix),
          });
        }
      }
    }
  }

  onChange(e, type) {
    // console.log('e.target.name == "buy_amount"',e.target.name,e.target.value)
    // console.log('this.state.buy_amount', this.state.buy_amount)
    const toFix =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol !== "BTC"
        ? 4
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol == "BTC"
        ? 10
        : TradeRules[this.state.selectPairsToken.left_symbol];
    // const re = this.state.graph_type == 'custom_graph' ? /^[0-9]*(\.[0-9]{0,4})?$/ : /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/
    const re =
      this.state.graph_type == "custom_graph"
        ? /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/
        : /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
    const priceRe = /^[0-9]*(\.[0-9]{0,6})?$/;
    // console.log('ree',re.test(e.target.value))
    if (!e.target.value) {
      e.target.value = 0;
    }
    if (e.target.value.indexOf(".") < 0) {
      if (e.target.value.charAt(0) == 0) {
        var newVal = e.target.value.substring(1);
        if (newVal) {
          e.target.value = parseInt(newVal);
        }
      }
    }

    var livep = this.state.my_pair_list.filter(
      (item) => item.pair == this.state.selectPairsToken.pair
    );

    this.state.redTotalSellAmount = false;
    this.state.redTotalBuyAmount = false;
    if (e.target.name == "total_sell_amount") {
      var sell_amount =
        parseFloat(e.target.value) / parseFloat(this.state.sell_price);
      this.setState({
        [e.target.name]: e.target.value,
        sell_amount: sell_amount.toFixed(toFix),
      });
    } else if (e.target.name == "sell_amount" && re.test(e.target.value)) {
      var total_sell_amount =
        parseFloat(e.target.value) * parseFloat(this.state.sell_price);
      this.setState({
        [e.target.name]: e.target.value.replace(`/(\.\d{${toFix}})\d+/g, '$1'`),
        total_sell_amount: total_sell_amount.toFixed(8),
        sell_usd_amount: parseFloat(
          parseFloat(e.target.value).toFixed(toFix) *
            parseFloat(
              this.state.isMarket == 0
                ? this.state.sell_price
                : livep[0].livePrice
            )
        ).toFixed(toFix),
      });
    } else if (
      e.target.name == "sell_price" &&
      (priceRe.test(e.target.value) || e.target.value == "")
    ) {
      var total_sell_amount =
        parseFloat(e.target.value) * parseFloat(this.state.sell_amount);
      this.setState({
        [e.target.name]: e.target.value,
        sell_usd_amount: total_sell_amount.toFixed(toFix),
      });
    } else if (e.target.name == "total_buy_amount") {
      var buy_amount =
        parseFloat(e.target.value) / parseFloat(this.state.buy_price);

      this.setState({
        [e.target.name]: e.target.value,
        buy_amount: buy_amount.toFixed(toFix),
      });
    } else if (e.target.name == "buy_amount" && re.test(e.target.value)) {
      var total_buy_amount =
        parseFloat(e.target.value) * parseFloat(this.state.buy_price);
      // console.log('total_buy_amount',e.target.value,this.state.buy_price, total_buy_amount)
      this.setState({
        [e.target.name]: e.target.value.replace(`/(\.\d{${toFix}})\d+/g, '$1'`),
        total_buy_amount: total_buy_amount.toFixed(toFix),
        buy_usd_amount: parseFloat(
          parseFloat(e.target.value).toFixed(toFix) *
            parseFloat(
              this.state.isMarket == 0
                ? this.state.buy_price
                : livep[0].livePrice
            )
        ).toFixed(toFix),
      });
    } else if (
      e.target.name == "buy_price" &&
      (priceRe.test(e.target.value) || e.target.value == "")
    ) {
      var total_buy_amount =
        parseFloat(e.target.value) * parseFloat(this.state.buy_amount);
      this.setState({
        [e.target.name]: e.target.value,
        buy_usd_amount: total_buy_amount.toFixed(toFix),
      });
    } else if (
      re.test(e.target.value) &&
      !e.target.name == "buy_price" &&
      !e.target.name == "sell_price"
    ) {
      // console.log('3344334433')
      this.setState({
        [e.target.name]: e.target.value,
      });
    }

    // console.log([e.target.name], e.target.value, this.state.buy_amount)
    setTimeout(() => {
      var buyPercentange =
        this.state.buy_usd_amount == 0
          ? 0
          : (this.state.buy_usd_amount /
              this.state.selectPairsToken.right_balance) *
            100;
      // console.log('buyPercentange', buyPercentange)
      if (buyPercentange > 100) {
        buyPercentange = 100;
      }
      if (type != "SelectBuyPercentange") {
        this.setState({
          SelectBuyPercentange: buyPercentange.toFixed(0),
        });
      }
    }, 100);

    setTimeout(() => {
      var sellPercentange =
        this.state.sell_amount == 0
          ? 0
          : (this.state.sell_amount /
              this.state.selectPairsToken.left_balance) *
            100;
      if (sellPercentange > 100) {
        sellPercentange = 100;
      }
      if (type != "SelectSellPercentange") {
        this.setState({
          SelectSellPercentange: sellPercentange.toFixed(0),
        });
      }
    }, 100);
  }

  sellPercentange(val) {
    const toFix =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol !== "BTC"
        ? 4
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol == "BTC"
        ? 10
        : TradeRules[this.state.selectPairsToken.left_symbol];

    if (this.state.selectPairsToken.left_balance == 0) {
      toast.warn("Don`t have sufficient balance");
    } else {
      var e = {
        target: {
          name: "sell_amount",
          value: (
            (this.state.selectPairsToken.left_balance * val) /
            100
          ).toFixed(toFix),
        },
      };
      this.onChange(e, "SelectSellPercentange");
      this.setState({
        SelectSellPercentange: val,
      });
    }
  }
  buyPercentange(val) {
    const toFix =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol !== "BTC"
        ? 4
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol == "BTC"
        ? 10
        : TradeRules[this.state.selectPairsToken.left_symbol];

    var livep = this.state.my_pair_list.filter(
      (item) => item.pair == this.state.selectPairsToken.pair
    );
    const livebuypercentage = parseFloat(
      (parseFloat(this.state.selectPairsToken.right_balance) *
        parseFloat(val)) /
        100 /
        this.state.buy_price
    ).toFixed(toFix);
    console.log(
      "livebuypercentage",
      this.state.selectPairsToken.right_balance,
      val,
      this.state.buy_price
    );
    if (this.state.selectPairsToken.right_balance == 0) {
      toast.warn("Don`t have sufficient balance");
    } else {
      var e = {
        target: {
          name: "buy_amount",
          value: livebuypercentage,
        },
      };
      this.setState({
        SelectBuyPercentange: val,
      });
      this.onChange(e, "SelectBuyPercentange");
    }
  }

  countPlaces(num) {
    var text = num.toString();
    var index = text.indexOf(".");
    return index == -1 ? 0 : text.length - index - 1;
  }

  async buy_submit(e) {
    // e.stopPropagation();
    e.preventDefault();

    if (this.state.buy_amount == 0 || this.state.buy_price == 0) {
      return false;
    }

    if (
      this.state.selectPairsToken.right_balance < this.state.total_buy_amount
    ) {
      toast.warn(
        `Insufficient ${this.state.selectPairsToken.right_symbol} in your wallet`
      );
      this.setState({
        redTotalBuyAmount: true,
      });
      return false;
    }

    var reqData = {
      user_id: this.loginId,
      pair_id: this.state.selectPairsToken.pair_id,
      amount: parseFloat(this.state.buy_amount),
      price: this.state.buy_price,
      type: "BUY",
      email: this.loginData.data.user_email,
      coin_fee: (
        (parseFloat(this.state.buy_amount) *
          parseFloat(
            this.state.adminFeesPrices.length > 0
              ? this.state.adminFeesPrices[1].fee_percentage
              : 0
          )) /
        100
      ).toFixed(6),
      usdt_amount: this.state.buy_usd_amount,
      decimal_places: this.countPlaces(parseFloat(this.state.buy_usd_amount)),
      isMarket: this.state.isMarket,
    };

    let URL =
      `${config.apiUrl}/createOrder` + "?nocache=" + new Date().getTime();
    if (this.state.graph_type == "custom_graph") {
      URL =
        `${config.apiUrl}/createInternalOrder` +
        "?nocache=" +
        new Date().getTime();
    }
    this.setState({ disableButtons: true });
    await axios({
      method: "post",
      url: URL,
      headers: { Authorization: this.loginData?.Token },
      data: reqData,
    })
      .then((result) => {
        if (result.data.success === true) {
          this.setState({ disableButtons: false });
          // -------------------Socket-------------------------------------
          socket.emit(
            "updateOrder",
            JSON.stringify({
              type: "order_book",
              pair_id: this.state.selectPairsToken.pair_id,
            })
          );

          // -------------------Socket-------------------------------------
          this.setState({
            buy_amount: 0,
            buy_price: 0,
            buy_usd_amount: 0,
            SelectSellPercentange: 0,
            SelectBuyPercentange: 0,
            openTab: 2,
            disableButtons: false,
          });

          toast.warn(result.data.msg, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: "",
          });
          this.orderBook();
          this.userOrder(3);
          this.selectPairsTokenFun11(this.state.selectPairsToken, true, false);
        } else if (result.data.success === false) {
          this.setState({ disableButtons: false });
          toast.warn(result.data.msg, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: "",
          });
        }
      })
      .catch((err) => {
        this.setState({ disableButtons: false });
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        } else {
          toast.warn(err.response.data?.msg, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: "",
          });
        }
      });

    console.log("disableButtons", this.state.disableButtons);
  }

  async sell_submit(e) {
    e.preventDefault();

    if (this.state.sell_amount == 0 || this.state.sell_price == 0) {
      return false;
    }

    if (this.state.selectPairsToken.left_balance < this.state.sell_amount) {
      toast.warn(
        `Insufficient ${this.state.selectPairsToken.left_symbol} in your wallet`
      );

      this.setState({
        redTotalSellAmount: true,
      });
      return false;
    }
    var reqData = {
      user_id: this.loginId,
      pair_id: this.state.selectPairsToken.pair_id,
      amount: parseFloat(this.state.sell_amount),
      price: this.state.sell_price,
      type: "SELL",
      email: this.loginData.data.user_email,
      coin_fee: (
        (parseFloat(this.state.sell_amount) *
          parseFloat(
            this.state.adminFeesPrices.length > 0
              ? this.state.adminFeesPrices[0].fee_percentage
              : 0
          )) /
        100
      ).toFixed(6),
      usdt_amount: this.state.sell_usd_amount,
      isMarket: this.state.isMarket,
      decimal_places: this.countPlaces(parseFloat(this.state.sell_usd_amount)),
    };

    let URL =
      `${config.apiUrl}/createOrder` + "?nocache=" + new Date().getTime();
    if (this.state.graph_type == "custom_graph") {
      URL =
        `${config.apiUrl}/createInternalOrder` +
        "?nocache=" +
        new Date().getTime();
    }
    this.setState({ disableButtons: true });
    await axios({
      method: "post",
      url: URL,
      headers: { Authorization: this.loginData?.Token },
      data: reqData,
    })
      .then((result) => {
        if (result.data.success === true) {
          this.setState({ disableButtons: false });
          // -------------------Socket-------------------------------------
          socket.emit(
            "updateOrder",
            JSON.stringify({
              type: "order_book",
              pair_id: this.state.selectPairsToken.pair_id,
            })
          );
          // -------------------Socket-------------------------------------

          this.setState({
            sell_amount: 0,
            sell_usd_amount: 0,
            sell_price: 0,
            SelectSellPercentange: 0,
            SelectBuyPercentange: 0,
            disableButtons: false,
          });

          toast.warn(result.data.msg, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: "",
          });

          this.orderBook();
          this.userOrder(3);
          this.selectPairsTokenFun11(this.state.selectPairsToken, true, false);
        } else if (result.data.success === false) {
          this.setState({ disableButtons: false });
          toast.warn(result.data.msg, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: "",
          });
        }
      })
      .catch((err) => {
        this.setState({ disableButtons: false });
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        } else {
          toast.warn(err.response.data?.msg, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: "",
          });
        }
      });
  }

  async getBeforeSocketData(data) {
    var getData = await fetch(`https://api.binance.com/api/v3/ticker/24hr`);
    var livePrices = await getData.json();

    if (this.state.mainData1.length > 0) {
      let coinList1 = this.state.mainData1;
      var i = 0;
      for (i = 0; i < coinList1.length; i++) {
        var item = coinList1[i];
        var right_symbol = item.right_symbol;
        var left_symbol = item.left_symbol;
        var pair = `${left_symbol}${right_symbol}`;

        var si = livePrices.findIndex((el) => el["symbol"] === pair);
        if (si > -1 && pair !== "USDTDAI") {
          var live_price = livePrices[si].askPrice; //old

          coinList1[i].livePrice = live_price;
          coinList1[i].changePercantage = livePrices[si].priceChangePercent;
        } else if (si > -1 && pair == "USDTDAI") {
          coinList1[i].livePrice = await this.liveInrUsdt();
          coinList1[i].changePercantage = livePrices[si].priceChangePercent;
        } else if (si == -1 && pair == "USDTBTC") {
          const indx = livePrices.findIndex((el) => el["symbol"] === "BTCUSDT");
          coinList1[i].livePrice = 1 / livePrices[indx].askPrice;
          coinList1[i].changePercantage = 1 / livePrices[si].priceChangePercent;
        }
      }

      const toFix =
        this.state.graph_type == "custom_graph"
          ? 4
          : TradeRules[this.state.selectPairsToken.left_symbol];

      this.setState({
        my_pair_list: coinList1,
        buy_price: data
          ? data.livePrice
          : parseFloat(coinList1[0].livePrice).toFixed(toFix),
        sell_price: data
          ? data.livePrice
          : parseFloat(coinList1[0].livePrice).toFixed(toFix),
      });
    }
  }

  async livePairDataFromPlatinx(leftcoin, rightcoin) {
    let coinList1 = this.state.mainData1;
    if (!this.state.webSocketReset) {
      if (this.state.ws1 !== "") {
        this.state.ws1.close();
      }
      const binanceclientorder = new W3CWebSocket(
        `${
          config.webSocketUrl
        }${leftcoin?.toUpperCase()}/${rightcoin?.toUpperCase()}/@ticker/${
          this.loginId
        }`,
        "echo-protocol"
      );

      // const heartbeat = (binanceclientorder, delay) => {
      //     clearTimeout(binanceclientorder.pingTimeout)

      //     binanceclientorder.pingTimeout = setTimeout(() => {
      //         binanceclientorder.terminate()
      //     }, delay)
      // }

      // const ping = () => { heartbeat(binanceclientorder, 5000) }

      this.setState({
        ws1: binanceclientorder,
      });

      binanceclientorder.onclose = function () {
        console.log("WebSocket closed");
        // clearTimeout(binanceclientorder.pingTimeout)
      };
      binanceclientorder.onopen = function () {
        console.log("WebSocket Client Connected 1");
        // binanceclientorder.send('ping', ping)
      };

      binanceclientorder.onmessage = (e) => {
        const socketData = JSON.parse(e.data);
        if (socketData.type === "LIVEPRICE") {
          let socketmainData = socketData.data;

          if (coinList1.length > 0) {
            var i = 0;
            for (i = 0; i < coinList1.length; i++) {
              var item = coinList1[i];
              var pair = `${item.left_symbol}${item.right_symbol}`;
              var si = socketmainData.findIndex((el) => el["symbol"] === pair);
              if (
                si > -1 &&
                item.right_symbol !== "INR" &&
                item.right_symbol !== "BTC"
              ) {
                coinList1[i].livePrice = socketmainData[si].price;
                coinList1[i].changePercantage =
                  socketmainData[si].changePerentage;
              }
              if (
                si > -1 &&
                item.right_symbol == "INR" &&
                item.right_symbol !== "BTC"
              ) {
                coinList1[i].livePrice = socketmainData[si].price;
                coinList1[i].changePercantage =
                  socketmainData[si].changePerentage;
              }
              if (
                si > -1 &&
                item.right_symbol == "BTC" &&
                item.right_symbol !== "INR"
              ) {
                // console.log('sddsds',socketmainData[si].price,this.state.usdt_btc)
                // coinList1[i].livePrice = socketmainData[si].price * this.state.usdt_btc;
                coinList1[i].livePrice = socketmainData[si].price;
                coinList1[i].changePercantage =
                  socketmainData[si].changePerentage;
              }
            }
          }
          this.setState({
            my_pair_list: coinList1,
          });
        }
      };
    }
  }

  async liveTradeDataFromPlatinx(leftcoin, rightcoin) {
    if (!this.state.webSocketReset) {
      if (this.state.ws2 !== "") {
        this.state.ws2.close();
      }
      let binanceclientorder = new W3CWebSocket(
        `${
          config.webSocketUrl
        }${leftcoin?.toUpperCase()}/${rightcoin?.toUpperCase()}/@trade/${
          this.loginId
        }`,
        "echo-protocol"
      );
      this.setState({
        ws2: binanceclientorder,
      });

      // const heartbeat = (binanceclientorder, delay) => {
      //     clearTimeout(binanceclientorder.pingTimeout)

      //     binanceclientorder.pingTimeout = setTimeout(() => {
      //         binanceclientorder.terminate()
      //     }, delay)
      // }

      // const ping = () => { heartbeat(binanceclientorder, 100) }

      binanceclientorder.onclose = function () {
        console.log("WebSocket closed");
        // clearTimeout(binanceclientorder.pingTimeout)
      };
      binanceclientorder.onopen = function () {
        console.log("WebSocket Client Connected 1");
        // binanceclientorder.send('ping', ping)
      };
      binanceclientorder.onmessage = (e) => {
        const socketData = JSON.parse(e.data);

        if (socketData.type === "TRADE") {
          if (JSON.parse(e.data).data) {
            let tradedaa = JSON.parse(e.data).newTradeData;
            let left_symbol = JSON.parse(e.data).left_symbol;
            let right_symbol = JSON.parse(e.data).right_symbol;
            // console.log('tradedaatradedaa', tradedaa)
            if (
              tradedaa &&
              tradedaa.length > 0 &&
              this.state.selectPairsToken.left_symbol == left_symbol &&
              this.state.selectPairsToken.right_symbol == right_symbol
            ) {
              let newArr = this.state.tradeData;
              // const check = this.state.tradeData.find(item => item.T == tradedaa.T)
              const results = tradedaa.filter(
                ({ T: id1 }) =>
                  !this.state.tradeData.some(({ T: id2 }) => id2 === id1)
              );
              // console.log('results',results)
              // const results1 = this.state.tradeData.find(({ T: id1 }) => !tradedaa.some(({ T: id2 }) => id2 === id1));
              // console.log('results1',results1)
              // if (newArr.length <= 51) {
              //     newArr = tradedaa
              //     if (newArr.length > 50) {
              //         newArr.shift()
              //     }
              // }
              if (results.length > 0 && !this.state.tradeData.length == 0) {
                newArr = tradedaa;
                this.getGraphData(this.state.selectPairsToken?.pair_id);
              } else if (this.state.tradeData.length == 0) {
                newArr = tradedaa;
                this.getGraphData(this.state.selectPairsToken?.pair_id);
              }
              this.setState({ tradeData: newArr });
            }
          }
        }
      };
    }
  }

  async liveOrderFromPlatinx(leftcoin, rightcoin) {
    if (!this.state.webSocketReset) {
      console.log("2222222", config.webSocketUrl);
      if (this.state.ws3 !== "") {
        // this.state.ws3.close();
      }
      let binanceclientorder = new W3CWebSocket(
        `${
          config.webSocketUrl
        }${leftcoin?.toUpperCase()}/${rightcoin?.toUpperCase()}/@depth/${
          this.loginId
        }`,
        "echo-protocol"
      );
      this.setState({
        ws3: binanceclientorder,
      });

      // const heartbeat = (binanceclientorder, delay) => {
      //     clearTimeout(binanceclientorder.pingTimeout)

      //     binanceclientorder.pingTimeout = setTimeout(() => {
      //         binanceclientorder.terminate()
      //     }, delay)
      // }

      // const ping = () => { heartbeat(binanceclientorder, 100) }

      binanceclientorder.onclose = function () {
        console.log("WebSocket closed");
        // clearTimeout(binanceclientorder.pingTimeout)
      };
      binanceclientorder.onopen = function () {
        console.log("WebSocket Client Connected 1");
        // binanceclientorder.send('ping', ping)
      };

      binanceclientorder.onmessage = (e) => {
        const socketData = JSON.parse(e.data);

        if (socketData.type === "OPENORDER") {
          // console.log('JSON.parse(e.data).data',JSON.parse(e.data),JSON.parse(e.data).left_symbol,JSON.parse(e.data).right_symbol,this.state.selectPairsToken.left_symbol,this.state.selectPairsToken.right_symbol)
          if (
            JSON.parse(e.data) &&
            JSON.parse(e.data).data.b &&
            JSON.parse(e.data).data.b.length > 0 &&
            JSON.parse(e.data).left_symbol ==
              this.state.selectPairsToken.left_symbol &&
            JSON.parse(e.data).right_symbol ==
              this.state.selectPairsToken.right_symbol
          ) {
            this.getLoopData1(JSON.parse(e.data).data.b.reverse(), "platinx");
          }

          if (
            JSON.parse(e.data) &&
            JSON.parse(e.data).data.b &&
            JSON.parse(e.data).data.b.length > 0 &&
            JSON.parse(e.data).data?.a &&
            JSON.parse(e.data).data.a.length == 0 &&
            JSON.parse(e.data).left_symbol ==
              this.state.selectPairsToken.left_symbol &&
            JSON.parse(e.data).right_symbol ==
              this.state.selectPairsToken.right_symbol
          ) {
            this.getLoopData([], "platinx");
            console.log("Empty Data A");
          }

          if (
            JSON.parse(e.data) &&
            JSON.parse(e.data).data.a &&
            JSON.parse(e.data).data.a.length > 0 &&
            JSON.parse(e.data).data?.b &&
            JSON.parse(e.data).data.b.length == 0 &&
            JSON.parse(e.data).left_symbol ==
              this.state.selectPairsToken.left_symbol &&
            JSON.parse(e.data).right_symbol ==
              this.state.selectPairsToken.right_symbol
          ) {
            this.getLoopData1([], "platinx");
            console.log("Empty Data B");
          }

          if (
            JSON.parse(e.data) &&
            JSON.parse(e.data).data.b &&
            JSON.parse(e.data).data.b.length == 0 &&
            JSON.parse(e.data).data?.a &&
            JSON.parse(e.data).data.a.length == 0 &&
            JSON.parse(e.data).left_symbol ==
              this.state.selectPairsToken.left_symbol &&
            JSON.parse(e.data).right_symbol ==
              this.state.selectPairsToken.right_symbol
          ) {
            this.getLoopData([], "platinx");
            this.getLoopData1([], "platinx");
            console.log("Empty Data A and B");
          }

          if (
            JSON.parse(e.data) &&
            JSON.parse(e.data).data.a &&
            JSON.parse(e.data).data.a.length > 0 &&
            JSON.parse(e.data).left_symbol ==
              this.state.selectPairsToken.left_symbol &&
            JSON.parse(e.data).right_symbol ==
              this.state.selectPairsToken.right_symbol
          ) {
            this.getLoopData(JSON.parse(e.data).data.a.reverse(), "platinx");
            // console.log('JSON.parse(e.data).data.a',JSON.parse(e.data).data.a)
          }
        }
      };
    }
  }

  async liveOrderFromBinance(wsdata) {
    wsdata = JSON.parse(wsdata);

    if (wsdata && wsdata.a.length > 0 && wsdata.b.length > 0) {
      this.getLoopData(wsdata.a);
    }

    if (wsdata && wsdata.b.length > 0 && wsdata.a.length > 0) {
      this.getLoopData1(wsdata.b);
    }
  }

  async liveTradeDataFromBinance(tradedaa) {
    tradedaa = JSON.parse(tradedaa);
    var newArr = this.state.tradeData;
    if (newArr.length <= 51) {
      newArr.push(tradedaa);
      if (newArr.length > 50) {
        newArr.shift();
      }
    }
    this.setState({ tradeData: newArr.reverse() });
  }

  getLoopData1(data, type) {
    let buynewArray;
    const toFix =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol !== "BTC"
        ? 4
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol == "BTC"
        ? 10
        : TradeRules[this.state.selectPairsToken.left_symbol];

    buynewArray = this.state.livebookOrderbuy;

    if (
      data.length == 0 &&
      this.state.graph_type == "custom_graph" &&
      buynewArray.length > 0 &&
      buynewArray[0]?.symbol ==
        `${this.state.selectPairsToken.left_symbol}${this.state.selectPairsToken.right_symbol}`
    ) {
      buynewArray = [];
    }
    if (this.state.graph_type == "custom_graph") {
      let arr = [];
      for (let k in data) {
        arr.push(data[k][0]);
      }
      if (buynewArray.length > 0) {
        for (let n in buynewArray) {
          if (!arr.includes(buynewArray[n]?.usdtprice)) {
            buynewArray = buynewArray.splice(n, 1);
          }
        }
      }
    }

    for (let x = 0; x < data.length; x++) {
      let obj = {};
      if (data && data.length > 0) {
        obj.usdtprice = parseFloat(data[x][0]).toFixed(toFix);
        obj.coinorderamount = data[x][1];
        obj.totalprice = parseFloat(data[x][0] * data[x][1]).toFixed(4);
        obj.quantity = parseFloat(data[x][1]).toFixed(4);
        obj.symbol = data[x][2]
          ? data[x][2]
          : `${this.state.selectPairsToken.left_symbol}${this.state.selectPairsToken.right_symbol}`;
        obj.orderType = "Buy";
      }

      if (obj.totalprice > 0 && buynewArray.length <= 50) {
        const objIndex = buynewArray.findIndex(
          (objs) => objs.usdtprice == parseFloat(data[x][0]).toFixed(toFix)
        );
        const filter = data.filter(
          (item) =>
            parseFloat(item[0]).toFixed(6) == parseFloat(data[x][0]).toFixed(6)
        );

        if (objIndex > -1) {
          const totalQuantity = filter.reduce(
            (accum, item) => accum + parseFloat(item[1]),
            0
          );

          buynewArray[objIndex].quantity = parseFloat(totalQuantity).toFixed(6);
        } else {
          buynewArray.push(obj);
        }

        if (buynewArray.length > 49) {
          buynewArray.shift();
        }
      }
    }
    var uniq = {};
    buynewArray = buynewArray.sort((a, b) => b.usdtprice - a.usdtprice);
    buynewArray = buynewArray.filter(
      (obj) =>
        !uniq[obj.usdtprice] &&
        (uniq[obj.usdtprice] =
          true &&
          obj.symbol ==
            `${this.state.selectPairsToken.left_symbol}${this.state.selectPairsToken.right_symbol}`)
    );
    this.setState({ livebookOrderbuy: buynewArray });
  }

  getLoopData(data, type) {
    let sellnewArray = this.state.livebookOrdersell;
    const toFix =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol !== "BTC"
        ? 4
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol == "BTC"
        ? 10
        : TradeRules[this.state.selectPairsToken.left_symbol];

    if (
      data.length == 0 &&
      this.state.graph_type == "custom_graph" &&
      sellnewArray.length > 0 &&
      sellnewArray[0]?.symbol ==
        `${this.state.selectPairsToken.left_symbol}${this.state.selectPairsToken.right_symbol}`
    ) {
      sellnewArray = [];
    }
    if (this.state.graph_type == "custom_graph") {
      let arr = [];
      for (let k in data) {
        arr.push(data[k][0]);
      }
      if (sellnewArray.length > 0) {
        for (let n in sellnewArray) {
          if (!arr.includes(sellnewArray[n]?.usdtprice)) {
            sellnewArray = sellnewArray.splice(n, 1);
          }
        }
      }
    }

    for (let x = 0; x < data.length; x++) {
      let obj = {};

      if (data && data.length > 0) {
        obj.usdtprice = parseFloat(data[x][0]).toFixed(toFix);
        obj.coinorderamount = data[x][1];
        obj.totalprice = parseFloat(data[x][0] * data[x][1]).toFixed(toFix);
        obj.symbol = data[x][2]
          ? data[x][2]
          : `${this.state.selectPairsToken.left_symbol}${this.state.selectPairsToken.right_symbol}`;
        obj.quantity = parseFloat(data[x][1]).toFixed(4);
        obj.orderType = "Sell";
      }

      if (obj.totalprice > 0 && sellnewArray.length <= 50) {
        const objIndex = sellnewArray.findIndex(
          (objs) => objs.usdtprice == parseFloat(data[x][0]).toFixed(toFix)
        );
        const filter = data.filter(
          (item) =>
            parseFloat(item[0]).toFixed(6) == parseFloat(data[x][0]).toFixed(6)
        );

        if (objIndex > -1) {
          const totalQuantity = filter.reduce(
            (accum, item) => accum + parseFloat(item[1]),
            0
          );

          sellnewArray[objIndex].quantity =
            parseFloat(totalQuantity).toFixed(6);
        } else {
          sellnewArray.push(obj);
        }
        if (sellnewArray.length > 49) {
          sellnewArray.shift();
        }
      }
    }

    sellnewArray = sellnewArray.sort((a, b) => a.usdtprice - b.usdtprice);
    sellnewArray = sellnewArray.filter(
      (obj) =>
        obj.symbol ==
        `${this.state.selectPairsToken.left_symbol}${this.state.selectPairsToken.right_symbol}`
    );

    this.setState({ livebookOrdersell: sellnewArray });
  }

  async livePairDataFromBinance(socketData) {
    //  console.log('socketData',socketData)
    socketData = JSON.parse(socketData);

    if (this.state.mainData1.length > 0) {
      let coinList1 = this.state.mainData1;
      var i = 0;
      for (i = 0; i < coinList1.length; i++) {
        var item = coinList1[i];
        // var right_symbol = (item.left_symbol == 'USDT' && item.right_symbol == 'INR') ? 'DAI' : (item.right_symbol == 'INR') ? 'USDT' : item.right_symbol;
        var right_symbol = item.right_symbol;
        var pair = `${item.left_symbol}${right_symbol}`;
        var si = socketData.findIndex((el) => el["s"] === pair);
        if (si > -1) {
          var live_price = socketData[si].c; //old

          coinList1[i].livePrice = live_price;
          coinList1[i].changePercantage = socketData[si].P;
        }
      }

      this.setState({
        my_pair_list: coinList1,
      });
    }
  }

  async getInrLivevalue(coin, liveprice) {
    var lastprice;
    await axios({
      method: "get",
      url: `${config.apiUrl}/liveInrUsdt`,
    }).then(async (response) => {
      lastprice = response.data.price;
      return lastprice;
    });
    this.setState({ inr_price: lastprice });
    return liveprice * lastprice;
  }

  async liveInrUsdt() {
    var lastprice = 0;
    await axios({
      method: "get",
      url: `${config.apiUrl}/liveInrUsdt`,
    }).then(async (response) => {
      lastprice = response.data.price;
      return lastprice;
    });
    this.setState({ inr_price: lastprice });
    return lastprice;
  }

  async getUSDTBTCPrice() {
    var lastprice = 0;
    await axios({
      method: "get",
      url: `${config.apiUrl}/currencyExchange?symbol=USDTBTC`,
    }).then(async (response) => {
      lastprice = response.data.price;
      return lastprice;
    });
    this.setState({ usdt_btc: lastprice });
    return lastprice;
  }

  async getDaiInrPrice() {
    var lastprice = 0;
    await axios({
      method: "get",
      url: `${config.apiUrl}/currencyExchange?symbol=DAIINR`,
    }).then(async (response) => {
      lastprice = response.data.price;
      return lastprice;
    });
    this.setState({ dai_inrprice: lastprice });
    return lastprice;
  }

  async GetCoinLivePriceOLD(e) {
    if (this.state.mainData1.length > 0) {
      let coinList1 = this.state.mainData1;
      var i = 0;
      for (i = 0; i < coinList1.length; i++) {
        var item = coinList1[i];
        var right_symbol =
          item.right_symbol == "INR" ? "USDT" : item.right_symbol;
        var pair = `${item.left_symbol}${right_symbol}`;
        var livePirce1 = await clientList.prices({ symbol: pair });
        coinList1[i].livePrice =
          item.right_symbol == "INR"
            ? await this.getInrLivevalue(item.left_symbol, livePirce1[pair])
            : livePirce1[pair]; //old
      }
      setTimeout(() => {
        this.setState({
          my_pair_list: coinList1,
        });
      }, 4000);
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "search") {
      const div = document.getElementsByClassName("tv-lightweight-charts");
      while (div.length > 0) {
        div[0].parentNode.removeChild(div[0]);
      }
      this.pairListAPI(e.target.value);
    }
  };

  async pairListAPI(id) {
    this.searchData = "";

    if (
      !id &&
      JSON.parse(localStorage.getItem("selectedPair")) &&
      JSON.parse(localStorage.getItem("selectedPair")).right_symbol
    ) {
      this.searchData = `/${
        JSON.parse(localStorage.getItem("selectedPair"))?.right_symbol
      }`;
    }
    // else if (id === undefined) {
    //     this.searchData = ''
    // }
    else if (id) {
      this.searchData = id;
    }

    // console.log('444444444444',this.searchData,JSON.parse(localStorage.getItem("selectedPair")))
    var data = {
      user_id: this.loginData?.data?.id,
      email: this.loginData?.data?.user_email,
      search: this.searchData,
    };
    await axios({
      method: "post",
      url: `${config.apiUrl}/pairlist` + "?nocache=" + new Date().getTime(),
      headers: { Authorization: this.loginData?.Token },
      // data: { search: this.searchData }
      data: data,
    })
      .then(async (result) => {
        if (result.data.success === true) {
          var mainData = result.data.response;

          this.setState({
            mainData1: mainData,
          });

          if (!id && JSON.parse(localStorage.getItem("selectedPair"))) {
            setTimeout(() => {
              this.selectPairsTokenFun11(
                JSON.parse(localStorage.getItem("selectedPair")),
                false,
                true
              );
            }, 200);
          } else {
            setTimeout(() => {
              this.selectPairsTokenFun11(mainData[0], false, true);
            }, 200);
          }

          setTimeout(() => {
            if (!id && JSON.parse(localStorage.getItem("selectedPair"))) {
              this.getBeforeSocketData(
                JSON.parse(localStorage.getItem("selectedPair"))
              );
            } else {
              this.getBeforeSocketData();
            }

            this.getUSDTBTCPrice();
          }, 3000);
        } else if (result.data.success === false) {
          toast.error(result.data.msg);
          if (this.state.isTimerModalOpen == false) {
            setTimeout(() => {
              window.location.href = `${config.baseUrl}exchange`;
            }, 1000);
          }
        }
      })
      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        }
      });
  }

  async orderBook() {
    await axios({
      method: "post",
      url: `${config.apiUrl}/orderbook` + "?nocache=" + new Date().getTime(),
      headers: { Authorization: this.loginData?.Token },
      data: {
        pair_id: this.state.selectPairsToken.pair_id,
        email: this.loginData?.data?.user_email,
        user_id: this.loginData.data?.id,
      },
    })
      .then((result) => {
        if (result.data.success === true) {
          this.setState({
            my_order_list: result.data.response,
          });
        } else if (result.data.success === false) {
          this.setState({
            my_order_list: [],
          });
        }
      })

      .catch((err) => {
        this.setState({
          my_order_list: [],
        });
      });
  }

  async selectPairsTokenFun11(item, chartupdate, connectwebsocket) {
    localStorage.setItem("selectedPair", JSON.stringify(item));
    var left_balance = 0;
    var right_balance = 0;

    this.setState({
      chartUpdate: chartupdate,
      SelectSellPercentange: 0,
      SelectBuyPercentange: 0,
      webSocketReset: false,
    });

    if (this.loginId) {
      var resData = await axios({
        method: "post",
        url:
          `${config.apiUrl}/getUserPiarBalance` +
          "?nocache=" +
          new Date().getTime(),
        headers: { Authorization: this.loginData?.Token },
        data: { pair_id: item.pair_id, user_id: this.loginId },
      });
      if (resData.data.success == true) {
        var left_balance = parseFloat(resData.data.response.left_balance);
        var right_balance = parseFloat(resData.data.response.right_balance);
      }
    }

    if (this.state.selectPairsToken.left_symbol !== item.left_symbol) {
      setTimeout(() => {
        this.setState({ tradeData: [] });
      }, [500]);
    }

    item.left_balance = left_balance;
    item.right_balance = right_balance;
    const toFix =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol !== "BTC"
        ? 4
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol == "BTC"
        ? 10
        : TradeRules[this.state.selectPairsToken.left_symbol];

    setTimeout(async () => {
      this.setState({
        selectPairsToken: item,
        currency: item.right_symbol,
        buy_price: parseFloat(item.livePrice).toFixed(toFix),
        sell_price: parseFloat(item.livePrice).toFixed(toFix),
        sell_amount: 0,
        buy_amount: 0,
        buy_usd_amount: 0,
        sell_usd_amount: 0,
        chartUpdate: true,
      });
    }, 100);

    if (connectwebsocket) {
      this.liveTradeDataFromPlatinx(item.left_symbol, item.right_symbol);
      this.liveOrderFromPlatinx(item.left_symbol, item.right_symbol);

      this.livePairDataFromPlatinx(item.left_symbol, item.right_symbol);
    }

    this.orderBook();
    this.getToCheckCoinVisible(item.left_symbol);

    setTimeout(() => {
      this.setState({
        webSocketReset: true,
      });
      this.getGraphData(item.pair_id);
    }, 500);
  }
  async selectPairsTokenFun(item) {
    var left_balance = 0;
    var right_balance = 0;

    this.setState({
      webSocketReset: false,
      chartUpdate: false,
    });

    if (this.loginId) {
      var resData = await axios({
        method: "post",
        url:
          `${config.apiUrl}/getUserPiarBalance` +
          "?nocache=" +
          new Date().getTime(),
        headers: { Authorization: this.loginData?.Token },
        data: { pair_id: item.pair_id, user_id: this.loginId },
      });
      if (resData.data.success == true) {
        var left_balance = parseFloat(resData.data.response.left_balance);
        var right_balance = parseFloat(resData.data.response.right_balance);
      }
    }

    //  console.log('4444444', item)
    item.left_balance = left_balance;
    item.right_balance = right_balance;

    const toFix =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol !== "BTC"
        ? 4
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol == "BTC"
        ? 10
        : TradeRules[this.state.selectPairsToken.left_symbol];

    setTimeout(() => {
      this.setState({
        selectPairsToken: item,
        buy_price: parseFloat(item.livePrice).toFixed(toFix),
        sell_price: parseFloat(item.livePrice).toFixed(toFix),
        chartUpdate: true,
      });
    }, 100);
    this.orderBook();

    setTimeout(() => {
      this.setState({
        webSocketReset: true,
      });
      this.getGraphData(item.pair_id);
    }, 200);
  }

  changeGraphInterval(value) {
    this.setState({ interval: value });
    setTimeout(() => {
      const filteritem = this.state.my_pair_list.filter(
        (item) => item.pair == this.state.selectPairsToken.pair
      );
      this.selectPairsTokenFun11(filteritem[0], false, false);
    }, 200);
  }

  async getGraphData(pair_id) {
    await axios({
      method: "post",
      url: `${config.apiUrl}/getGraphData`,
      headers: {
        Authorization: this.loginData.message,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      data: {
        pair_id: pair_id,
        type: this.state.interval,
        symbol: `${this.state.selectPairsToken.left_symbol}`,
        currency: this.state.currency,
      },
    })
      .then((result) => {
        if (result.data.success === true) {
          const length = result.data.response.length;
          this.setState({
            highValue: result.data.response[length - 1].high,
            lowValue: result.data.response[length - 1].low,
            lastPrice: result.data.response[length - 1].close,
            volumeValue: result.data.response[length - 1].volume,
            graph_type: result.data.response[length - 1].type,
          });

          setTimeout(async () => {
            if (result.data.response[0].type == "custom_graph") {
              if (document.getElementById("chartContainer")) {
                const div = await document.getElementsByClassName(
                  "tv-lightweight-charts"
                );
                while (div.length > 0) {
                  // console.log('div000', div[0])
                  div[0].parentNode.removeChild(div[0]);
                }
                chart = createChart(document.getElementById("chartContainer"), {
                  width: 600,
                  height: 415,
                  crosshair: {
                    mode: CrosshairMode.Normal,
                  },
                  timeScale: {
                    timeVisible: true,
                    secondsVisible: true,
                    borderColor: "#485c7b",
                  },
                  layout: {
                    backgroundColor: "#000",
                    textColor: "rgba(255, 255, 255, 0.9)",
                  },
                  grid: {
                    vertLines: {
                      color: "#334158",
                    },
                    horzLines: {
                      color: "#334158",
                    },
                  },
                  // crosshair: {
                  //     mode: CrosshairMode.Normal,
                  // },
                  priceScale: {
                    borderColor: "#485c7b",
                  },
                });
                // console.log('chartchart', document.getElementById("chartContainer"))
                candleSeries = chart.addCandlestickSeries({
                  upColor: "#4bffb5",
                  downColor: "#ff4976",
                  borderDownColor: "#ff4976",
                  borderUpColor: "#4bffb5",
                  wickDownColor: "#838ca1",
                  wickUpColor: "#838ca1",
                });

                candleSeries.setData(result.data.response);
              }
            }
          }, 200);
        } else if (result.data.code === false) {
        }
      })
      .catch((err) => {});
  }

  async userOrder(tab) {
    this.setState({ order_list_spinner: true, openTab: tab });
    if (this.loginId) {
      await axios({
        method: "post",
        url: `${config.apiUrl}/userorder` + "?nocache=" + new Date().getTime(),
        headers: { Authorization: this.loginData?.Token },
        data: { user_id: this.loginId },
      })
        .then((result) => {
          if (result.data.success === true) {
            this.setState({
              user_order_list: result.data.response,
              order_list_spinner: false,
            });
          } else if (result.data.success === false) {
            this.setState({
              user_order_list: [],
              order_list_spinner: false,
            });
          }
        })
        .catch((err) => {
          this.setState({
            user_order_list: [],
            order_list_spinner: false,
          });
        });
    }
  }

  async pairListAPIBYcoin(e, type) {
    e.preventDefault();

    if (!this.loginId && e.target.value == "FAVOURITE") {
      toast.error("Please login account!");
    } else if (type == 1) {
      this.componentDidMount();
      this.setState({
        search: ``,
        filtertab: e.target.value,
      });
    } else {
      this.setState({
        search: ``,
        currency: `${e.target.value}`,
        my_pair_list: [],
      });
      this.pairListAPI(`/${e.target.value}`);
    }
  }

  async textExpression(evt) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      evt.preventDefault();
    }

    if (evt.target.value.indexOf(".") > -1 && evt.which == 46) {
      evt.preventDefault();
    }
  }

  async tradingType(i) {
    const toFix =
      this.state.graph_type == "custom_graph" &&
      this.state.selectPairsToken.right_symbol !== "BTC"
        ? 4
        : this.state.graph_type == "custom_graph" &&
          this.state.selectPairsToken.right_symbol == "BTC"
        ? 10
        : TradeRules[this.state.selectPairsToken.left_symbol];

    // const toFix = this.state.graph_type == 'custom_graph' ? 4 : TradeRules[this.state.selectPairsToken.left_symbol]
    var mInimunsellPrice = Math.min.apply(
      Math,
      this.state?.livebookOrdersell.map(function (o) {
        return o.usdtprice;
      })
    );
    // console.log('mInimunsellPrice',mInimunsellPrice)
    var maxbuyPrice = Math.max.apply(
      Math,
      this.state?.livebookOrderbuy.map(function (o) {
        return o.usdtprice;
      })
    );
    // console.log('maxbuyPrice',maxbuyPrice)
    this.setState({
      isMarket: i,
      buy_price:
        this.state?.livebookOrdersell.length > 0 && i == 1
          ? parseFloat(mInimunsellPrice).toFixed(toFix)
          : parseFloat(this.state.selectPairsToken?.livePrice).toFixed(toFix),
      sell_price:
        this.state?.livebookOrderbuy.length > 0 && i == 1
          ? parseFloat(maxbuyPrice).toFixed(toFix)
          : parseFloat(this.state.selectPairsToken?.livePrice).toFixed(toFix),
    });
  }

  async Favorite_Pair(id) {
    if (this.loginData != "" && this.loginData.data.id) {
      const data = {
        user_id: this.loginData.data.id,
        email: this.loginData?.data.user_email,
        pair_id: id.pair_id,
      };

      let headers = {
        Authorization: this.loginData?.Token,
        "Content-Type": "application/json",
      };

      axios
        .post(
          `${config.apiUrl}/favoritepair` + "?nocache=" + new Date().getTime(),
          data,
          { headers: headers }
        )
        .then(async (result) => {
          if (result.data.success == true) {
            toast.success(result.data?.msg, {
              position: toast.POSITION.TOP_CENTER,
            });
          }
          var id = this.state.search ? this.state.search : "";

          this.pairListAPI(id);
        })
        .catch((err) => {
          if (err == "Error: Request failed with status code 403") {
            toast.error("Session expired please re-login");
          }
          var id = this.state.search ? this.state.search : "";

          this.pairListAPI(id);
        });
    } else {
      toast.warn("You have to login first");
    }
  }

  editModal(e, data) {
    this.setState({ iseditModalOpen: true });
    setTimeout(() => {
      this.setState({
        editForm: {
          ...this.state.editForm,
          price: data.price,
          quantity: data.amount,
          remaining_amount: data.remaining_amount,
          isInternal: data.isInternal,
          usdt_price: data.usdt_amount,
          leftSymbol: data.left_symbol,
          rightSymbol: data.right_symbol,
          symbol: `${data.left_symbol}${data.right_symbol}`,
          orderid: data.order_id,
          binance_order_id: data.binance_order_id,
        },
      });
    }, 200);
  }

  closeModal(e) {
    this.setState({ iseditModalOpen: false });
  }
  closeISModal(e) {
    this.setState({ isModalOpen: false });
    window.location.href = `${config.baseUrl}exchange`;
  }

  async modifyOrder(e) {
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
    await axios
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
          quantity: parseFloat(this.state.editForm.quantity),
          usdt_price: parseFloat(this.state.editForm.usdt_price),
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

          this.orderBook();
          this.userOrder(2);
          this.selectPairsTokenFun11(this.state.selectPairsToken, false, false);
        } else if (result.data.success === false) {
          toast.error(result.data.msg, {
            position: toast.POSITION.TOP_CENTER,
          });

          this.setState({ iseditModalOpen: false });

          this.orderBook();
          this.userOrder(2);
          this.selectPairsTokenFun11(this.state.selectPairsToken, false, false);
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
                  symbol: `${id.left_symbol}${id.right_symbol}`,
                },
                { headers: headers }
              )
              .then((result) => {
                if (result.data.success === true) {
                  toast.success(result.data.msg, {
                    position: toast.POSITION.TOP_CENTER,
                  });

                  this.orderBook();
                  this.userOrder(2);
                  this.selectPairsTokenFun11(
                    this.state.selectPairsToken,
                    false,
                    false
                  );
                } else if (result.data.success === false) {
                  toast.error(result.data.msg, {
                    position: toast.POSITION.TOP_CENTER,
                  });
                  this.orderBook();
                  this.userOrder(2);
                  this.selectPairsTokenFun11(
                    this.state.selectPairsToken,
                    false,
                    false
                  );
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

  modalhandleChange(e) {
    const { name, value } = e.target;
    const re = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;

    const toFix =
      this.state.graph_type == "custom_graph" &&
      this.state.editForm.rightSymbol !== "BTC"
        ? 4
        : this.state.graph_type == "custom_graph" &&
          this.state.editForm.rightSymbol == "BTC"
        ? 10
        : TradeRules[this.state.editForm.rightSymbol];
    // console.log('toFix', toFix, this.state.editForm, this.state.graph_type)

    if (re.test(value) || value == "") {
      var field = "";
      var fieldvalue = 0;
      if (name == "usdt_price") {
        field = "quantity";
        fieldvalue = parseFloat(
          parseFloat(value) / parseFloat(this.state.editForm.price)
        ).toFixed(toFix);
      } else if (name == "quantity") {
        field = "usdt_price";
        fieldvalue = parseFloat(
          parseFloat(value) * parseFloat(this.state.editForm.price)
        ).toFixed(toFix);
      } else if (name == "price") {
        field = "usdt_price";
        fieldvalue = parseFloat(
          parseFloat(value) * parseFloat(this.state.editForm.quantity)
        ).toFixed(toFix);
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
  closeISTimerModal = (e) => {
    this.setState({ isTimerModalOpen: false });
    window.location.href = `${config.baseUrl}exchange`;
  };

  CountdownTimer({ days, hours, minutes, seconds, completed }) {
    if (completed) {
      // Render a completed state
      return "Starting";
    } else {
      // Render a countdowns
      var dayPrint = days > 0 ? days + " d" : "";

      return (
        <span>
          {dayPrint} {zeroPad(hours)} h {zeroPad(minutes)} m {zeroPad(seconds)}{" "}
          s
        </span>
      );
    }
  }

  getTimeOfStartDate(dateTime) {
    var date = new Date(dateTime); // some mock date
    var milliseconds = date.getTime();
    return milliseconds;
  }

  getTimeOfStartDate(dateTime) {
    var date = new Date(dateTime); // some mock date
    var milliseconds = date.getTime();
    return milliseconds;
  }

  CountdownTimer({ days, hours, minutes, seconds, completed }) {
    if (completed) {
      // Render a completed state
      return "Starting";
    } else {
      // Render a countdowns
      var dayPrint = days > 0 ? days + " d" : "";

      return (
        <span>
          {dayPrint} {zeroPad(hours)} h {zeroPad(minutes)} m {zeroPad(seconds)}{" "}
          s
        </span>
      );
    }
  }

  render() {
    //  console.log(this.state.livebookOrderbuy,this.state.livebookOrdersell)
    // console.log('disableButtonsdisableButtons', this.state.disableButtons)
    return (
      <>
        <Header />

        <Websocket
          url="wss://stream.binance.com:9443/ws/!ticker@arr"
          onMessage={this.livePairDataFromBinance.bind(this)}
        />

        {!this.state.webSocketReset ? (
          ""
        ) : (
          <Websocket
            url={`wss://stream.binance.com:9443/ws/${this.state.selectPairsToken?.left_symbol?.toLowerCase()}usdt@depth`}
            onMessage={this.liveOrderFromBinance.bind(this)}
          />
        )}
        {!this.state.webSocketReset ? (
          ""
        ) : (
          <Websocket
            url={`wss://stream.binance.com:9443/ws/${this.state.selectPairsToken?.left_symbol?.toLowerCase()}usdt@trade`}
            onMessage={this.liveTradeDataFromBinance.bind(this)}
          />
        )}

        <div className="container-fluid">
          <div className="row sm-gutters" id="row_exchange">
            <div className="col-12 col-sm-12 col-lg-3 col-md-12">
              <div className="crypt-market-status_btc">
                <ToastContainer />
                <div className="crypto-exchanges">
                  <ul className="nav nav-tabs pt-2 pb-3" id="crypt-tab">
                    {this.state.headerFilters.map((item) => (
                      <li
                        role="presentation"
                        style={{ padding: "0px 0px 5px 7px" }}
                      >
                        <input
                          type="button"
                          style={{
                            cursor: "pointer",
                            background: `${
                              item == this.state.filtertab ? "#000" : "rgb(45 212 191)"
                            }`,
                            color: "#fff",
                          }}
                          value={item}
                          onClick={(e) => this.pairListAPIBYcoin(e, 1)}
                          data-toggle="tab"
                        />
                      </li>
                    ))}
                    {this.state.headerSeacrhCoin.map((item) => (
                      <li
                        role="presentation"
                        style={{ padding: "0px 0px 5px 7px" }}
                      >
                        <input
                          type="button"
                          style={{
                            cursor: "pointer",
                            background: `${
                              item == this.state.currency ? "#000" : "rgb(45 212 191)"
                            }`,
                            color: "#fff",
                          }}
                          value={item}
                          onClick={(e) => this.pairListAPIBYcoin(e, 2)}
                          data-toggle="tab"
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="form-group has-search" id="search_bar">
                    <span className="fa fa-search form-control-feedback"></span>
                    <input
                      id="search_panel"
                      type="text"
                      className="form-control"
                      placeholder="Search"
                      name="search"
                      onChange={(e) => this.handleChange(e)}
                      value={this.state.search}
                    />
                  </div>
                  <div className="tab-content crypt-tab-content">
                    <div
                      role="tabpanel"
                      className="tab-pane active mb-4"
                      id="usd"
                      style={{
                        maxHeight: "335px",
                        minHeight: "335px",
                        overflowY: "scroll",
                        overflowX: "hidden",
                      }}
                    >
                      <table className="table table-striped data_table">
                        <thead>
                          <tr>
                            <th scope="col">Coin</th>

                            <th scope="col">Change</th>
                          </tr>
                        </thead>
                        <tbody className="crypt-table-hover">
                          {this.state.my_pair_list.length > 0 ? (
                            this.state.filtertab == "FAVOURITE" ? (
                              this.state.my_pair_list
                                .filter((items) => items.status == 1)
                                .map((item) => (
                                  <tr
                                    value={item}
                                    onClick={() =>
                                      this.selectPairsTokenFun11(
                                        item,
                                        false,
                                        true
                                      )
                                    }
                                  >
                                    <td className="align-middle">
                                      <img
                                        className="crypt-star pr-1 new-star"
                                        onClick={this.Favorite_Pair.bind(
                                          this,
                                          item
                                        )}
                                        alt="star"
                                        src={
                                          item.status == 1
                                            ? "images/starfill.png"
                                            : "images/star.svg"
                                        }
                                        width="15"
                                      />
                                      {item.pair}
                                    </td>
                                    <td>
                                      {" "}
                                      <span className="d-block">
                                        {" "}
                                        {parseFloat(item.livePrice).toFixed(
                                          6
                                        )}{" "}
                                      </span>
                                      {parseFloat(item.changePercantage) < 0 ? (
                                        <b className="crypt-down">
                                          {parseFloat(
                                            item.changePercantage
                                          ).toFixed(2)}
                                          %
                                        </b>
                                      ) : (
                                        <b className="crypt-up">
                                          {parseFloat(
                                            item.changePercantage
                                          ).toFixed(2)}
                                          %
                                        </b>
                                      )}
                                    </td>
                                  </tr>
                                ))
                            ) : this.state.filtertab == "GAINERS" ? (
                              this.state.my_pair_list
                                .filter((items) => items.changePercantage > 0)
                                .map((item) => (
                                  <tr
                                    value={item}
                                    onClick={() =>
                                      this.selectPairsTokenFun11(
                                        item,
                                        false,
                                        true
                                      )
                                    }
                                  >
                                    <td className="align-middle">
                                      <img
                                        className="crypt-star pr-1 new-star"
                                        onClick={this.Favorite_Pair.bind(
                                          this,
                                          item
                                        )}
                                        alt="star"
                                        src={
                                          item.status == 1
                                            ? "images/starfill.png"
                                            : "images/star.svg"
                                        }
                                        width="15"
                                      />
                                      {item.pair}
                                    </td>
                                    <td>
                                      {" "}
                                      <span className="d-block">
                                        {" "}
                                        {parseFloat(item.livePrice).toFixed(
                                          6
                                        )}{" "}
                                      </span>
                                      {parseFloat(item.changePercantage) < 0 ? (
                                        <b className="crypt-down">
                                          {parseFloat(
                                            item.changePercantage
                                          ).toFixed(2)}
                                          %
                                        </b>
                                      ) : (
                                        <b className="crypt-up">
                                          {parseFloat(
                                            item.changePercantage
                                          ).toFixed(2)}
                                          %
                                        </b>
                                      )}
                                    </td>
                                  </tr>
                                ))
                            ) : this.state.filtertab == "LOSERS" ? (
                              this.state.my_pair_list
                                .filter((items) => items.changePercantage < 0)
                                .map((item) => (
                                  <tr
                                    value={item}
                                    onClick={() =>
                                      this.selectPairsTokenFun11(
                                        item,
                                        false,
                                        true
                                      )
                                    }
                                  >
                                    <td className="align-middle">
                                      <img
                                        className="crypt-star pr-1 new-star"
                                        onClick={this.Favorite_Pair.bind(
                                          this,
                                          item
                                        )}
                                        alt="star"
                                        src={
                                          item.status == 1
                                            ? "images/starfill.png"
                                            : "images/star.svg"
                                        }
                                        width="15"
                                      />
                                      {item.pair}
                                    </td>
                                    <td>
                                      {" "}
                                      <span className="d-block">
                                        {" "}
                                        {parseFloat(item.livePrice).toFixed(
                                          6
                                        )}{" "}
                                      </span>
                                      {parseFloat(item.changePercantage) < 0 ? (
                                        <b className="crypt-down">
                                          {parseFloat(
                                            item.changePercantage
                                          ).toFixed(2)}
                                          %
                                        </b>
                                      ) : (
                                        <b className="crypt-up">
                                          {parseFloat(
                                            item.changePercantage
                                          ).toFixed(2)}
                                          %
                                        </b>
                                      )}
                                    </td>
                                  </tr>
                                ))
                            ) : (
                              this.state.my_pair_list.map((item) => (
                                <tr
                                  value={item}
                                  onClick={() =>
                                    this.selectPairsTokenFun11(
                                      item,
                                      false,
                                      true
                                    )
                                  }
                                >
                                  <td className="align-middle">
                                    <img
                                      className="crypt-star pr-1 new-star"
                                      onClick={this.Favorite_Pair.bind(
                                        this,
                                        item
                                      )}
                                      alt="star"
                                      src={
                                        item.status == 1
                                          ? "images/starfill.png"
                                          : "images/star.svg"
                                      }
                                      width="15"
                                    />
                                    {item.pair}
                                  </td>
                                  <td>
                                    {" "}
                                    <span className="d-block">
                                      {" "}
                                      {parseFloat(item.livePrice).toFixed(
                                        6
                                      )}{" "}
                                    </span>
                                    {parseFloat(item.changePercantage) < 0 ? (
                                      <b className="crypt-down">
                                        {parseFloat(
                                          item.changePercantage
                                        ).toFixed(2)}
                                        %
                                      </b>
                                    ) : (
                                      <b className="crypt-up">
                                        {parseFloat(
                                          item.changePercantage
                                        ).toFixed(2)}
                                        %
                                      </b>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )
                          ) : (
                            <tr>
                              <td colSpan="3" className="text-center">
                                <Loader
                                  className="assets-spiner"
                                  type="TailSpin"
                                  color="#2565c7"
                                  height={50}
                                  width={50}
                                  //3 secs
                                />{" "}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="col-12 col-lg-9 col-md-12 mt-4"
              id="col_mobile_view"
            >
              <div
                className="crypt-gross-market-cap mt-4"
                style={{ display: "none" }}
              >
                <div className="row" style={{ display: "none" }}>
                  <div className="col-3 col-sm-6 col-md-6 col-lg-6">
                    <div className="row">
                      <div className="col-sm-6 col-md-6 col-lg-6">
                        <p>84568.85</p>
                        <p>≈$8378.6850 USDT</p>
                      </div>
                      <div className="col-sm-6 col-md-6 col-lg-6">
                        <p>24H Change</p>
                        <p className="crypt-down">-0.0234230 -3.35%</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-3 col-sm-2 col-md-3 col-lg-2">
                    <p>24H High</p>
                    <p className="crypt-up">0.435453</p>
                  </div>
                  <div className="col-3 col-sm-2 col-md-3 col-lg-2">
                    <p>24H Low</p>
                    <p className="crypt-down">0.09945</p>
                  </div>
                  <div className="col-3 col-sm-2 col-md-3 col-lg-2">
                    <p>24H Volume</p>
                    <p>12.33445</p>
                  </div>
                </div>
              </div>
              <div className="tradingview-widget-container mb-3">
                <div id="crypt-candle-chart">
                  {this.state.chartUpdate &&
                  this.state.graph_type == "binance_graph" ? (
                    <TradingViewWidget
                      className="position-relative trading-view"
                      symbol={`${this.state.selectPairsToken.left_symbol}${this.state.selectPairsToken.right_symbol}`}
                      height="502px"
                      disabled_features="header_symbol_search"
                      interval="5"
                      width="100%"
                      theme={Themes.DARK}
                      locale="fr"
                    />
                  ) : this.state.chartUpdate &&
                    this.state.graph_type == "custom_graph" ? (
                    <div className="sc-bdfBQB sc-edoYdd fKVDSh chYhRm">
                      <div className="sc-bdfBQB fKVDSh">
                        <div className="row">
                          <div className="no-gutter col-xs-16">
                            <div className="sc-bdfBQB sc-bUrLeq fKVDSh eHjfQv">
                              <div className="sc-iWFTwQ bSemYi">
                                <div height="32px" className="sc-bdfBQB jdDjSt">
                                  <div
                                    height="24px"
                                    width="12px"
                                    className="sc-bdfBQB iEMYmK"
                                  />
                                  <div className="sc-bdfBQB bldeMl">
                                    <div className="sc-bdfBQB kWBRiA">
                                      <h1
                                        color="#1C1B21"
                                        className="sc-gsTEea gYrKRI"
                                      >
                                        {this.state.selectPairsToken.pair}
                                      </h1>
                                    </div>
                                    <div className="sc-bdfBQB sc-jvfqPk jVhKkh deYzLg">
                                      <span
                                        color="#929292"
                                        className="sc-gsTEea hVTESg"
                                      >
                                        Last Price
                                      </span>
                                      <span
                                        cursor="pointer"
                                        color="#1C1B21"
                                        className="sc-gsTEea dvKsmJ"
                                      >
                                        {this.state.selectPairsToken
                                          .right_symbol == "INR"
                                          ? "₹"
                                          : this.state.selectPairsToken
                                              .right_symbol == "ETH"
                                          ? "ETH"
                                          : this.state.selectPairsToken
                                              .right_symbol == "BNB"
                                          ? "BNB"
                                          : this.state.selectPairsToken
                                              .right_symbol == "BTC"
                                          ? "BTC"
                                          : this.state.selectPairsToken
                                              .right_symbol == "PTX"
                                          ? "PTX"
                                          : "$"}
                                        {parseFloat(
                                          this.state.selectPairsToken.livePrice
                                        ).toFixed(
                                          this.state.graph_type ==
                                            "custom_graph" &&
                                            this.state.selectPairsToken
                                              .right_symbol !== "BTC"
                                            ? 4
                                            : this.state.graph_type ==
                                                "custom_graph" &&
                                              this.state.selectPairsToken
                                                .right_symbol == "BTC"
                                            ? 10
                                            : TradeRules[
                                                this.state.selectPairsToken
                                                  .left_symbol
                                              ]
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="sc-fybuyZ cfoptc sc-jLiVFv fjVgNT">
                                <div className="sc-bdfBQB sc-cHjwLt fOxqyX ciDoqb">
                                  <div className="sc-bdfBQB sc-JAcba fOxqyX edpIdO">
                                    <div className="sc-bdfBQB jVhKkh">
                                      <span
                                        color="#929292"
                                        className="sc-gsTEea ehpksF"
                                      >
                                        Volume
                                      </span>
                                      <span
                                        color="#1C1B21"
                                        className="sc-gsTEea hRCAZK"
                                      >
                                        {this.state.volumeValue}
                                      </span>
                                    </div>
                                    <div className="sc-bdfBQB jVhKkh">
                                      <span
                                        color="#929292"
                                        className="sc-gsTEea ehpksF"
                                      >
                                        High
                                      </span>
                                      <span
                                        color="#1C1B21"
                                        className="sc-gsTEea hRCAZK"
                                      >
                                        {this.state.highValue}
                                      </span>
                                    </div>
                                    <div className="sc-bdfBQB jVhKkh">
                                      <span
                                        color="#929292"
                                        className="sc-gsTEea ehpksF"
                                      >
                                        Low
                                      </span>
                                      <span
                                        color="#1C1B21"
                                        className="sc-gsTEea hRCAZK"
                                      >
                                        {this.state.lowValue}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="sc-gHfsNP fSfKBP ">
                                    <span
                                      color="rgb(177, 177, 178)"
                                      onClick={(e) =>
                                        this.changeGraphInterval(1)
                                      }
                                      className="sc-gsTEea sc-dkAqVg iLjILG hraMki"
                                    >
                                      1Mi
                                    </span>
                                    <span
                                      color="rgb(177, 177, 178)"
                                      onClick={(e) =>
                                        this.changeGraphInterval(2)
                                      }
                                      className="sc-gsTEea sc-dkAqVg iLjILG hraMki"
                                    >
                                      30Mi
                                    </span>
                                    <span
                                      color="rgb(177, 177, 178)"
                                      onClick={(e) =>
                                        this.changeGraphInterval(3)
                                      }
                                      className="sc-gsTEea sc-dkAqVg iLjILG hraMki"
                                    >
                                      1Ho
                                    </span>
                                    <span
                                      color="rgb(177, 177, 178)"
                                      onClick={(e) =>
                                        this.changeGraphInterval(4)
                                      }
                                      className="sc-gsTEea sc-dkAqVg iLjILG hraMki"
                                    >
                                      1We
                                    </span>
                                  </div>
                                </div>
                                <div className="sc-bdfBQB sc-jifHHV fOxqyX hvpiJG">
                                  <div
                                    id="chartContainer"
                                    className="tv-lightweight-charts-div"
                                    style={{ height: "100%", width: "100%" }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              {/* <!-- <div id="depthchart" className="depthchart h-40 crypt-dark-segment"></div> --> */}
            </div>
          </div>
        </div>
        <div className="container-fluid" style={{ marginTop: "-10px" }}>
          <div className="row sm-gutters mt-3">
            <div className="col-12 col-lg-6 col-md-12">
              <div className="crypt-boxed-area mb-2">
                <h6 className="crypt-bg-head ml-1 mr-1">
                  <b className="crypt-up">BUY</b> /{" "}
                  <b className="crypt-down">SELL</b>
                </h6>
                <div className="row no-gutters">
                  <div className="col-sm-12">
                    <ul className="nav nav-tabs ml-3 mr-3">
                      <li role="presentation">
                        <a
                          href="#Limit"
                          className="active"
                          data-toggle="tab"
                          onClick={this.tradingType.bind(this, 0)}
                        >
                          Limit
                        </a>
                      </li>
                      <li role="presentation">
                        <a
                          href="#market"
                          data-toggle="tab"
                          onClick={this.tradingType.bind(this, 1)}
                        >
                          Market
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6 col-md-6 pr-0">
                    <form>
                      <div className="buy-sell-box ml-1">
                        <p>
                          Buy{" "}
                          <span className="crypt-up">
                            {this.state.selectPairsToken.left_symbol}
                          </span>{" "}
                          <span className="fright">
                            Available:{" "}
                            <b className="crypt-up">
                              {parseFloat(
                                this.state.selectPairsToken.right_balance
                              ).toFixed(6)}{" "}
                              {this.state.selectPairsToken.right_symbol}
                            </b>
                          </span>
                        </p>
                      </div>

                       <div className="crypt-buy-sell-form">
                        <div className="crypt-buy">
                        {this.state.isMarket==0?<div className="input-group mb-3">
                            <div className="input-group-prepend">
                              {" "}
                              <span className="input-group-text">
                                Price
                              </span>{" "}
                            </div>
                           <input
                              type="text"
                              onKeyPress={this.textExpression}
                              name="buy_price"
                              onChange={this.onChange}
                              value={this.state.buy_price}
                              className="form-control make-text-white"
                              placeholder="0.02323476"
                              disabled={
                                this.state.isMarket === 1 ? true : false
                              }
                            />
                            <div className="input-group-append">
                              {" "}
                              <span className="input-group-text">
                                {this.state.selectPairsToken.right_symbol}
                              </span>{" "}
                            </div>
                          </div>:""}
                          <div className="input-group mb-3">
                            <div className="input-group-prepend">
                              {" "}
                              <span className="input-group-text">
                                Amount
                              </span>{" "}
                            </div>
                            <input
                              type="text"
                              id="fixed5"
                              onKeyPress={this.textExpression}
                              name="buy_amount"
                              onChange={this.onChange}
                              value={this.state.buy_amount}
                              className="form-control"
                            />
                            <div className="input-group-append">
                              {" "}
                              <span className="input-group-text">
                                {this.state.selectPairsToken.left_symbol}
                              </span>{" "}
                            </div>
                          </div>
                          <div className="input-group mb-3">
                            <div className="input-group-prepend">
                              {" "}
                              <span className="input-group-text">
                                Amount
                              </span>{" "}
                            </div>
                            <input
                              type="text"
                              name="buy_usd_amount"
                              onChange={(e) => this.buyonUsdtChange(e)}
                              value={this.state.buy_usd_amount}
                              className="form-control"
                            />
                            <div className="input-group-append">
                              {" "}
                              <span className="input-group-text">
                                {this.state.selectPairsToken.right_symbol}
                              </span>{" "}
                            </div>
                          </div>

                          <div>
                            <p>
                              Fee:{" "}
                              <span className="fright">
                                {" "}
                                <span>
                                  {parseFloat(
                                    this.state.adminFeesPrices.length > 0
                                      ? (parseFloat(this.state.buy_amount) *
                                          parseFloat(
                                            this.state.adminFeesPrices[0]
                                              .fee_percentage
                                          )) /
                                          100 +
                                          (parseFloat(this.state.buy_amount) *
                                            parseFloat(
                                              this.state.selectPairsToken
                                                .right_symbol == "INR"
                                                ? this.state.adminFeesPrices[4]
                                                    .fee_percentage
                                                : this.state.adminFeesPrices[6]
                                                    .fee_percentage
                                            )) /
                                            100 +
                                          parseFloat(
                                            (parseFloat(
                                              (parseFloat(
                                                this.state.buy_amount
                                              ) *
                                                parseFloat(
                                                  this.state.adminFeesPrices[0]
                                                    .fee_percentage
                                                )) /
                                                100
                                            ) *
                                              parseFloat(
                                                this.state.adminFeesPrices[8]
                                                  .fee_percentage
                                              )) /
                                              100
                                          )
                                      : 0
                                  ).toFixed(6)}{" "}
                                  {this.state.selectPairsToken.left_symbol}
                                </span>
                              </span>
                            </p>
                          </div>
                          {this.loginId ? (
                            <div dir="ltr" className="css-1au5w6l">
                              <div className="css-8y9li2">
                                <div className="css-1axcs3s">
                                  <div
                                    className="css-1uqukx"
                                    style={{
                                      width: `${this.state.SelectBuyPercentange}%`,
                                    }}
                                  ></div>
                                </div>
                                <div
                                  className="bn-tradeSlider-ratioButton css-1cgmam8"
                                  style={{
                                    marginLeft: `${this.state.SelectBuyPercentange}%`,
                                  }}
                                ></div>
                                <label
                                  className="css-5kw7v8"
                                  style={{
                                    marginLeft: `${this.state.SelectBuyPercentange}%`,
                                  }}
                                >
                                  {this.state.SelectBuyPercentange}%
                                </label>
                                <div
                                  className="css-4l9ic"
                                  onClick={this.buyPercentange.bind(this, 0)}
                                ></div>
                                <div
                                  className="css-r5qggc"
                                  onClick={this.buyPercentange.bind(this, 25)}
                                  style={{
                                    background: `${
                                      this.state.SelectBuyPercentange > 25
                                        ? "#fff"
                                        : "#333"
                                    }`,
                                  }}
                                ></div>
                                <div
                                  className="css-nsqynb"
                                  onClick={this.buyPercentange.bind(this, 50)}
                                  style={{
                                    background: `${
                                      this.state.SelectBuyPercentange > 50
                                        ? "#fff"
                                        : "#333"
                                    }`,
                                  }}
                                ></div>
                                <div
                                  className="css-80wbqm"
                                  onClick={this.buyPercentange.bind(this, 75)}
                                  style={{
                                    background: `${
                                      this.state.SelectBuyPercentange > 75
                                        ? "#fff"
                                        : "#333"
                                    }`,
                                  }}
                                ></div>
                                <div
                                  className="css-v6fymx"
                                  onClick={this.buyPercentange.bind(this, 100)}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            ""
                          )}

                          {this.loginId ? (
                            <div className="menu-green">
                              {this.state.disableButtons ? (
                                <button
                                  type="button"
                                  className="crypt-button-green-full"
                                >
                                  Buy {this.state.selectPairsToken.left_symbol}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => this.buy_submit(e)}
                                  className="crypt-button-green-full"
                                >
                                  Buy {this.state.selectPairsToken.left_symbol}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div
                              className="text-center"
                              style={{ background: "unset" }}
                            >
                              <Link
                                to={`${config.baseUrl}login`}
                                style={{ color: "#38a0a1" }}
                              >
                                Login
                              </Link>{" "}
                              or{" "}
                              <Link
                                to={`${config.baseUrl}signup`}
                                style={{ color: "#38a0a1" }}
                              >
                                Register
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="col-lg-6 col-md-6 pl-0">
                    <form>
                      <div className="buy-sell-box bdr-none mr-1">
                        <p>
                          Sell{" "}
                          <span className="crypt-down">
                            {this.state.selectPairsToken.left_symbol}
                          </span>
                          <span className="fright">
                            Available:{" "}
                            <b className="crypt-down">
                              {parseFloat(
                                this.state.selectPairsToken.left_balance
                              ).toFixed(6)}{" "}
                              {this.state.selectPairsToken.left_symbol}
                            </b>
                          </span>
                        </p>
                      </div>
                      <div className="crypt-buy-sell-form bdr-none">
                        <div className="crypt-sell">
                        {this.state.isMarket==0?
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                              {" "}
                              <span className="input-group-text">
                                Price
                              </span>{" "}
                            </div>
                            <input
                              type="text"
                              onKeyPress={this.textExpression}
                              name="sell_price"
                              onChange={this.onChange}
                              value={this.state.sell_price}
                              className="form-control"
                              placeholder="0.02323476"
                              readonly
                              disabled={
                                this.state.isMarket === 1 ? true : false
                              }
                            />
                            <div className="input-group-append">
                              {" "}
                              <span className="input-group-text">
                                {this.state.selectPairsToken.right_symbol}
                              </span>{" "}
                            </div>
                          </div>:""}
                          <div
                            class={`input-group mb-3 ${
                              this.state.redTotalSellAmount
                                ? "box-shadow-red"
                                : ""
                            }`}
                          >
                            <div className="input-group-prepend">
                              {" "}
                              <span className="input-group-text">
                                Amount
                              </span>{" "}
                            </div>
                            <input
                              type="text"
                              id="fixed5"
                              onKeyPress={this.textExpression}
                              name="sell_amount"
                              onChange={this.onChange}
                              value={this.state.sell_amount}
                              className="form-control"
                            />
                            <div className="input-group-append">
                              {" "}
                              <span className="input-group-text">
                                {this.state.selectPairsToken.left_symbol}
                              </span>{" "}
                            </div>
                          </div>
                          <div
                            class={`input-group mb-3 ${
                              this.state.redTotalSellAmount
                                ? "box-shadow-red"
                                : ""
                            }`}
                          >
                            <div className="input-group-prepend">
                              {" "}
                              <span className="input-group-text">
                                Amount
                              </span>{" "}
                            </div>
                            <input
                              type="text"
                              onKeyPress={this.textExpression}
                              name="sell_amount"
                              onChange={(e) => this.sellonUsdtChange(e)}
                              value={this.state.sell_usd_amount}
                              className="form-control"
                            />
                            <div className="input-group-append">
                              {" "}
                              <span className="input-group-text">
                                {this.state.selectPairsToken.right_symbol}
                              </span>{" "}
                            </div>
                          </div>

                          <div>
                            <p>
                              Fee:{" "}
                              <span className="fright">
                                {" "}
                                <span>
                                  {parseFloat(
                                    this.state.adminFeesPrices.length > 0
                                      ? (parseFloat(this.state.sell_amount) *
                                          parseFloat(
                                            this.state.adminFeesPrices[1]
                                              .fee_percentage
                                          )) /
                                          100 +
                                          (parseFloat(this.state.sell_amount) *
                                            parseFloat(
                                              this.state.selectPairsToken
                                                .right_symbol == "INR"
                                                ? this.state.adminFeesPrices[5]
                                                    .fee_percentage
                                                : this.state.adminFeesPrices[7]
                                                    .fee_percentage
                                            )) /
                                            100 +
                                          parseFloat(
                                            (parseFloat(
                                              (parseFloat(
                                                this.state.sell_amount
                                              ) *
                                                parseFloat(
                                                  this.state.adminFeesPrices[1]
                                                    .fee_percentage
                                                )) /
                                                100
                                            ) *
                                              parseFloat(
                                                this.state.adminFeesPrices[8]
                                                  .fee_percentage
                                              )) /
                                              100
                                          )
                                      : 0
                                  ).toFixed(6)}{" "}
                                  {this.state.selectPairsToken.left_symbol}
                                </span>
                              </span>
                            </p>
                          </div>
                          {this.loginId ? (
                            <div dir="ltr" className="css-1au5w6l">
                              <div className="css-8y9li2">
                                <div className="css-1axcs3s">
                                  <div
                                    className="css-1uqukx"
                                    style={{
                                      width: `${this.state.SelectSellPercentange}%`,
                                    }}
                                  ></div>
                                </div>
                                <div
                                  className="bn-tradeSlider-ratioButton css-1cgmam8"
                                  style={{
                                    marginLeft: `${this.state.SelectSellPercentange}%`,
                                  }}
                                ></div>
                                <label
                                  className="css-5kw7v8"
                                  style={{
                                    marginLeft: `${this.state.SelectSellPercentange}%`,
                                  }}
                                >
                                  {this.state.SelectSellPercentange}%
                                </label>
                                <div
                                  className="css-4l9ic"
                                  onClick={this.sellPercentange.bind(this, 0)}
                                ></div>
                                <div
                                  className="css-r5qggc"
                                  onClick={this.sellPercentange.bind(this, 25)}
                                  style={{
                                    background: `${
                                      this.state.SelectSellPercentange > 25
                                        ? "#fff"
                                        : "#333"
                                    }`,
                                  }}
                                ></div>
                                <div
                                  className="css-nsqynb"
                                  onClick={this.sellPercentange.bind(this, 50)}
                                  style={{
                                    background: `${
                                      this.state.SelectSellPercentange > 50
                                        ? "#fff"
                                        : "#333"
                                    }`,
                                  }}
                                ></div>
                                <div
                                  className="css-80wbqm"
                                  onClick={this.sellPercentange.bind(this, 75)}
                                  style={{
                                    background: `${
                                      this.state.SelectSellPercentange > 75
                                        ? "#fff"
                                        : "#333"
                                    }`,
                                  }}
                                ></div>
                                <div
                                  className="css-v6fymx"
                                  onClick={this.sellPercentange.bind(this, 100)}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            ""
                          )}

                          {this.loginId ? (
                            <div>
                              {this.state.disableButtons ? (
                                <button
                                  className="crypt-button-red"
                                  type="button"
                                >
                                  Sell {this.state.selectPairsToken.left_symbol}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => this.sell_submit(e)}
                                  className="crypt-button-red"
                                >
                                  Sell {this.state.selectPairsToken.left_symbol}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div
                              className="text-center"
                              style={{ background: "unset" }}
                            >
                              <Link
                                to={`${config.baseUrl}login`}
                                style={{ color: "#38a0a1" }}
                              >
                                Login
                              </Link>{" "}
                              or{" "}
                              <Link
                                to={`${config.baseUrl}signup`}
                                style={{ color: "#38a0a1" }}
                              >
                                Register
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6 col-md-12">
              <div style={{ height: "100%" }}>
                <div className="crypt-market-status_iorder">
                  <div className="crypto_orders_tabsarea">
                    <ul className="nav nav-tabs">
                      <li role="presentation">
                        <a
                          href="#active-orders"
                          className={this.state.openTab == 1 ? "active" : ""}
                          data-toggle="tab"
                          onClick={this.userOrder.bind(this, 1)}
                        >
                          Trade History
                        </a>
                      </li>
                      <li role="presentation">
                        <a
                          href="#activeopen-orders"
                          data-toggle="tab"
                          className={this.state.openTab == 2 ? "active" : ""}
                          onClick={this.userOrder.bind(this, 2)}
                        >
                          Open Orders
                        </a>
                      </li>
                      <li role="presentation">
                        <a
                          href="#activeopen-orders"
                          data-toggle="tab"
                          className={this.state.openTab == 3 ? "active" : ""}
                          onClick={this.userOrder.bind(this, 3)}
                        >
                          Order Book
                        </a>
                      </li>
                      <li role="presentation">
                        <a
                          href="#activeopen-orders"
                          data-toggle="tab"
                          className={this.state.openTab == 4 ? "active" : ""}
                          onClick={this.userOrder.bind(this, 4)}
                        >
                          Market Trades
                        </a>
                      </li>
                    </ul>

                    <div
                      className="tab-content"
                      style={{ height: "95%", overflowY: "scroll" }}
                    >
                      {this.loginId ? (
                        <div>
                          {this.state.openTab == 1 ? (
                            <div
                              role="tabpanel"
                              className="tab-pane active"
                              id="active-orders"
                              style={{ overflowY: "scroll", height: "100%" }}
                            >
                              <table
                                className="table table-striped table-responsive-sm"
                                id="order_history"
                              >
                                <thead>
                                  <tr>
                                    <th scope="col">Pair</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Quantity</th>
                                    <th scope="col">Fee</th>
                                    <th scope="col">Price</th>
                                    <th scope="col">Average Price</th>
                                    <th scope="col">Time</th>
                                    <th scope="col">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {this.state.user_order_list.length > 0 &&
                                  this.state.user_order_list.filter(
                                    (items) => items.status == 1
                                  ).length > 0 ? (
                                    this.state.user_order_list
                                      .filter((items) => items.status == 1)
                                      .map((item) => (
                                        <tr>
                                          <td>{`${item.left_symbol}/${item.right_symbol}`}</td>

                                          <td
                                            className={
                                              item.order_type == "BUY"
                                                ? "crypt-up"
                                                : "crypt-down"
                                            }
                                          >
                                            {item.order_type}
                                          </td>
                                          <td>
                                            {parseFloat(item.amount).toFixed(6)}
                                          </td>
                                          <td>
                                            {parseFloat(
                                              item.fee_amount +
                                                item.gst_quantity_fee +
                                                item.tds_vda_fee
                                            ).toFixed(6)}
                                          </td>
                                          <td>
                                            {parseFloat(item.price).toFixed(6)}
                                          </td>
                                          <td>
                                            {parseFloat(
                                              item.average_price
                                            ).toFixed(6)}
                                          </td>
                                          <td>
                                            {moment(item.datetime).format(
                                              "lll"
                                            )}
                                          </td>
                                          <td
                                            className={
                                              item.status == 0
                                                ? "yellow-color-class"
                                                : item.status == 1
                                                ? "green-color-class"
                                                : "red-color-class"
                                            }
                                          >
                                            {item.status == 0
                                              ? "Open"
                                              : item.status == 1
                                              ? "Completed"
                                              : "Cancelled"}
                                          </td>
                                        </tr>
                                      ))
                                  ) : this.state.order_list_spinner == true ? (
                                    <tr>
                                      <td
                                        className="text-center p-5 "
                                        colSpan="6"
                                      >
                                        <Loader
                                          className="assets-spiner"
                                          type="TailSpin"
                                          color="#2565c7"
                                          height={50}
                                          width={50}
                                        />
                                      </td>
                                    </tr>
                                  ) : (
                                    <tr>
                                      <td
                                        className="text-center p-5 no_data_found"
                                        colSpan="12"
                                      >
                                        No Data Found
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            ""
                          )}
                          {this.state.openTab == 2 ? (
                            <div
                              role="tabpanel"
                              className="tab-pane active"
                              id="activeopen-orders"
                              style={{
                                overflowY: "scroll",
                                background: "#000",
                                height: "0%",
                              }}
                            >
                              <table
                                className="table table-striped table-responsive-sm"
                                id="order_history"
                              >
                                <thead>
                                  <tr>
                                    <th scope="col">Pair</th>
                                    <th scope="col">Type</th>
                                    {/* <th scope="col">Quantity</th> */}
                                    <th scope="col">Filled </th>
                                    <th scope="col">Price</th>
                                    <th scope="col">Time</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {this.state.user_order_list.filter(
                                    (item) => item.status == 0
                                  ).length > 0 ? (
                                    this.state.user_order_list
                                      .filter((item) => item.status == 0)
                                      .map((item) => (
                                        <tr>
                                          <td>{`${item.left_symbol}/${item.right_symbol}`}</td>

                                          <td
                                            className={
                                              item.order_type == "BUY"
                                                ? "crypt-up"
                                                : "crypt-down"
                                            }
                                          >
                                            {item.order_type}
                                          </td>
                                          {/* <td>{parseFloat(item.amount).toFixed(6)}</td> */}
                                          <td>
                                            {parseFloat(
                                              parseFloat(
                                                parseFloat(item.amount) +
                                                  parseFloat(item.fee_amount) +
                                                  parseFloat(
                                                    item.gst_quantity_fee
                                                  ) +
                                                  parseFloat(item.tds_vda_fee)
                                              ).toFixed(4) -
                                                parseFloat(
                                                  item.remaining_amount
                                                )
                                            ) < 0
                                              ? parseFloat(0).toFixed(4)
                                              : parseFloat(
                                                  parseFloat(
                                                    parseFloat(item.amount) +
                                                      parseFloat(
                                                        item.fee_amount
                                                      ) +
                                                      parseFloat(
                                                        item.gst_quantity_fee
                                                      ) +
                                                      parseFloat(
                                                        item.tds_vda_fee
                                                      )
                                                  ).toFixed(4) -
                                                    parseFloat(
                                                      item.remaining_amount
                                                    )
                                                ).toFixed(4)}{" "}
                                            /{" "}
                                            {parseFloat(
                                              parseFloat(
                                                parseFloat(item.amount) +
                                                  parseFloat(item.fee_amount) +
                                                  parseFloat(
                                                    item.gst_quantity_fee
                                                  ) +
                                                  parseFloat(item.tds_vda_fee)
                                              )
                                            ).toFixed(4)}
                                          </td>
                                          <td>{item.price}</td>
                                          <td>
                                            {moment(item.datetime).format(
                                              "lll"
                                            )}
                                          </td>
                                          <td
                                            className={
                                              item.status == 0
                                                ? "yellow-color-class"
                                                : item.status == 1
                                                ? "green-color-class"
                                                : "red-color-class"
                                            }
                                          >
                                            {item.status == 0
                                              ? "Open"
                                              : item.status == 1
                                              ? "Completed"
                                              : "Cancelled"}
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
                                              onClick={(e) =>
                                                this.editModal(e, item)
                                              }
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
                                  ) : this.state.order_list_spinner == true ? (
                                    <tr>
                                      <td
                                        className="text-center p-5"
                                        colSpan="6"
                                      >
                                        <Loader
                                          className="assets-spiner"
                                          type="TailSpin"
                                          color="#2565c7"
                                          height={50}
                                          width={50}
                                        />
                                      </td>
                                    </tr>
                                  ) : (
                                    <tr>
                                      <td
                                        className="text-center p-5 no_data_found"
                                        colSpan="12"
                                      >
                                        No Data Found
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      ) : this.state.openTab == 1 || this.state.openTab == 2 ? (
                        <div
                          className="order-history-login-register text-center"
                          style={{ background: "unset" }}
                        >
                          <Link
                            to={`${config.baseUrl}login`}
                            style={{ color: "#38a0a1" }}
                          >
                            Log In{" "}
                          </Link>
                          <label style={{ color: "#fff" }}>or</label>{" "}
                          <Link
                            to={`${config.baseUrl}signup`}
                            style={{ color: "#38a0a1" }}
                          >
                            Register Now{" "}
                          </Link>
                          <label style={{ color: "#fff" }}>to trade</label>
                        </div>
                      ) : (
                        ""
                      )}
                      {this.state.openTab == 3 ? (
                        <div
                          role="tabpanel"
                          className="tab-pane active"
                          id="activelive-orders"
                          style={{
                            overflowY: "scroll",
                            background: "#000",
                            height: "95%",
                          }}
                        >
                          <div className='class="orderbook"'>
                            <div className="orderbooklistcvr">
                              <div className="orderbooklist">
                                <div className="buy-item-head">
                                  <ul className="m-0 p-0">
                                    <li>Quantity</li>
                                    <li>Buy Price</li>
                                  </ul>
                                </div>
                              </div>
                              <div className="orderbooklist">
                                <div className="sell-item-head">
                                  <ul className="m-0 p-0">
                                    <li>Sell Price</li>
                                    <li>Quantity</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="orderlist">
                              {this.state?.livebookOrderbuy.length > 0 ||
                              this.state?.livebookOrdersell.length > 0 ? (
                                <div className="orderbooklistcvr">
                                  <div className="orderbooklist">
                                    <div className="buyprice">
                                      <div className="ordercover">
                                        {this.state?.livebookOrderbuy.length >
                                        0 ? (
                                          this.state?.livebookOrderbuy?.map(
                                            (item, i) => {
                                              return (
                                                <div
                                                  className="buy-item false"
                                                  style={{
                                                    position: "relative",
                                                    overflow: "hidden",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <ul
                                                    className="m-0 p-0"
                                                    style={{
                                                      position: "relative",
                                                      zIndex: 10,
                                                    }}
                                                  >
                                                    <li>{item.quantity}</li>

                                                    {this.state.isMarket ===
                                                    0 ? (
                                                      <li
                                                        className={`crypt-up`}
                                                        onClick={(e) =>
                                                          this.setState({
                                                            buy_price:
                                                              item.usdtprice,
                                                          })
                                                        }
                                                      >
                                                        {item.usdtprice}
                                                      </li>
                                                    ) : (
                                                      <li
                                                        className={`crypt-up`}
                                                      >
                                                        {item.usdtprice}
                                                      </li>
                                                    )}
                                                  </ul>
                                                </div>
                                              );
                                            }
                                          )
                                        ) : (
                                          <div
                                            className="buy-item false"
                                            style={{
                                              position: "relative",
                                              overflow: "hidden",
                                              cursor: "pointer",
                                            }}
                                          >
                                            <ul
                                              className="m-0 p-0"
                                              style={{
                                                position: "relative",
                                                zIndex: 10,
                                              }}
                                            >
                                              <li>{""}</li>

                                              <li className={`crypt-up`}>
                                                {""}
                                              </li>
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="orderbooklist">
                                    <div className="sellprice">
                                      <div className="ordercover">
                                        {this.state?.livebookOrdersell.length >
                                        0 ? (
                                          this.state?.livebookOrdersell?.map(
                                            (item, i) => {
                                              return (
                                                <div
                                                  className="sell-item false"
                                                  style={{
                                                    position: "relative",
                                                    overflow: "hidden",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <ul
                                                    className="m-0 p-0"
                                                    style={{
                                                      position: "relative",
                                                      zIndex: 10,
                                                    }}
                                                  >
                                                    {this.state.isMarket ===
                                                    0 ? (
                                                      <li
                                                        className={`crypt-down`}
                                                        onClick={(e) =>
                                                          this.setState({
                                                            sell_price:
                                                              item.usdtprice,
                                                          })
                                                        }
                                                      >
                                                        {item.usdtprice}
                                                      </li>
                                                    ) : (
                                                      <li
                                                        className={`crypt-down`}
                                                      >
                                                        {item.usdtprice}
                                                      </li>
                                                    )}
                                                    <li>{item.quantity}</li>
                                                  </ul>
                                                </div>
                                              );
                                            }
                                          )
                                        ) : (
                                          <div
                                            className="sell-item false"
                                            style={{
                                              position: "relative",
                                              overflow: "hidden",
                                              cursor: "pointer",
                                            }}
                                          >
                                            <ul
                                              className="m-0 p-0"
                                              style={{
                                                position: "relative",
                                                zIndex: 10,
                                              }}
                                            >
                                              <li className={`crypt-down`}>
                                                {""}
                                              </li>

                                              <li>{""}</li>
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : this.state?.livebookOrdersell.length == 0 &&
                                this.state?.livebookOrderbuy.length == 0 ? (
                                <tr className="text-center p-5 ">
                                  No Live Order
                                </tr>
                              ) : (
                                <div className="text-center p-5" colSpan="6">
                                  <Loader
                                    className="assets-spiner"
                                    type="TailSpin"
                                    color="#2565c7"
                                    height={50}
                                    width={50}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        ""
                      )}

                      {this.state.openTab == 4 ? (
                        <div
                          role="tabpanel"
                          className="tab-pane active"
                          id="active-orders"
                          style={{
                            overflowY: "scroll",
                            background: "#000",
                            height: "95%",
                          }}
                        >
                          <table
                            className="table table-striped table-responsive-sm"
                            id="order_history"
                          >
                            <thead>
                              <tr>
                                <th scope="col">Price</th>
                                <th scope="col">
                                  {this.state.selectPairsToken?.left_symbol}
                                </th>
                                <th scope="col">Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.tradeData.length > 0 ? (
                                this.state.tradeData.map((item) => (
                                  <tr>
                                    {/* <td className={(item.p > this.state.selectPairsToken?.livePrice) ? 'crypt-up' : 'crypt-down'}>{parseFloat(item.p).toFixed(4)}</td> */}
                                    <td
                                      className={
                                        item.m == true
                                          ? "crypt-down"
                                          : "crypt-up"
                                      }
                                    >
                                      {parseFloat(item.p).toFixed(
                                        this.state.graph_type ==
                                          "custom_graph" &&
                                          this.state.selectPairsToken
                                            .right_symbol !== "BTC"
                                          ? 4
                                          : this.state.graph_type ==
                                              "custom_graph" &&
                                            this.state.selectPairsToken
                                              .right_symbol == "BTC"
                                          ? 10
                                          : TradeRules[
                                              this.state.selectPairsToken
                                                .left_symbol
                                            ]
                                      )}
                                    </td>

                                    <td>
                                      {parseFloat(item.q).toFixed(
                                        this.state.graph_type ==
                                          "custom_graph" &&
                                          this.state.selectPairsToken
                                            .right_symbol !== "BTC"
                                          ? 4
                                          : this.state.graph_type ==
                                              "custom_graph" &&
                                            this.state.selectPairsToken
                                              .right_symbol == "BTC"
                                          ? 10
                                          : TradeRules[
                                              this.state.selectPairsToken
                                                .left_symbol
                                            ]
                                      )}
                                    </td>
                                    <td>{moment(item.E).format("LTS")}</td>
                                  </tr>
                                ))
                              ) : this.state.tradeData.length == 0 ? (
                                <tr className="text-center p-5 ">
                                  No Live Trades
                                </tr>
                              ) : (
                                <tr>
                                  <td className="text-center p-5 " colSpan="6">
                                    <Loader
                                      className="assets-spiner"
                                      type="TailSpin"
                                      color="#2565c7"
                                      height={50}
                                      width={50}
                                    />
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  <div className="timing_container">
                    <h2>Comming Soon !!</h2>
                    <h5>
                      The Coin <strong>{this.state.Comingsymbol}</strong>{" "}
                      Available for trade !!
                    </h5>
                    <div className="timer">
                      <Countdown
                        date={this.getTimeOfStartDate(this.state.opening_date)}
                        renderer={this.CountdownTimer}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </div>

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
                            onChange={(e) => this.modalhandleChange(e)}
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
                            onChange={(e) => this.modalhandleChange(e)}
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
                            onChange={(e) => this.modalhandleChange(e)}
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
        <Modal
          isOpen={this.state.isTimerModalOpen}
          onRequestClose={(e) => this.closeISTimerModal(e)}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <button
            className="btn_close-TIMER"
            onClick={(e) => this.closeISTimerModal(e)}
            style={{ float: "right" }}
          >
            X
          </button>
          <div className=" time-modal">
            <div className="row">
              <div className="col-md-12">
                <div className="timing_container">
                  <h2>Comming Soon !!</h2>
                  <h5>
                    The Coin <strong>{this.state.Comingsymbol}</strong>{" "}
                    Available for trade !!
                  </h5>
                  <div className="timer">
                    <Countdown
                      date={this.getTimeOfStartDate(this.state.opening_date)}
                      renderer={this.CountdownTimer}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <br />
        <Footer />
      </>
    );
  }
}
