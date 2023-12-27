import React, { Component } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import "./newStyle.scss";
import axios from "axios";
import config from "./config/config";
import Header from "./directives/header";
import Footer from "./directives/footer";
import Countdown from "react-countdown";
import Cookies from "js-cookie";
import ReactPlayer from "react-player";
import { Player } from "video-react";
import { Link, Redirect } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

import { Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react/swiper-react";
import "swiper/swiper.min.css";
import "swiper/modules/pagination/pagination.min.css";

import Timer from "./Timer";
import HomeWelcome from "./HomeWelcome";
import HeroSlider from "./HeroSlider";
import Startup from "./Startup";
import Activities from "./Activities";
import VotingResultSlider from "./VotingResultSlider";
import PopularCryptocurrencies from "./PopularCryptocurrencies";
import Robinhood from "./Robinhood";
import Trade from "./Trade";
import Faq from "./Faq";
import EasyTask from "./EasyTask";
import ProdService from "./ProdService";
import './home.css';

// IMAGE & ICONS
import iconPng1 from '../src/assets/icons/ator.png';
import iconPng2 from '../src/assets/icons/blz.png';
import iconPng3 from '../src/assets/icons/bnb.png';
import iconPng4 from '../src/assets/icons/bonk.png';
import iconPng5 from '../src/assets/icons/btc.png';
import iconPng6 from '../src/assets/icons/dash.png';
import iconPng7 from '../src/assets/icons/dent.png';
import iconPng8 from '../src/assets/icons/fil.png';
import iconPng9 from '../src/assets/icons/lsk.png';
import iconPng10 from '../src/assets/icons/mtl.png';
import iconPng11 from '../src/assets/icons/qkc.png';
import iconPng12 from '../src/assets/icons/usdt.png';
import iconPng13 from '../src/assets/icons/xrp.png';
import iconPng14 from '../src/assets/icons/zec.png';
import iconPng15 from '../src/assets/icons/eth.png';
import iconPng16 from '../src/assets/icons/exchange-white.png';
import iconPng17 from '../src/assets/icons/Floki.png';
import iconPng18 from '../src/assets/icons/SUSHI.png';
import iconPng19 from '../src/assets/icons/audius-footer.png';
import iconPng20 from '../src/assets/icons/Meta.png';
import iconPng21 from '../src/assets/icons/IRON.png';
import iconPng22 from '../src/assets/icons/Vcore_token.png';
import iconPng23 from '../src/assets/icons/bit.jpg';
import iconPng24 from '../src/assets/icons/EVERYGAMETiker.png';
import iconPng25 from '../src/assets/icons/form.png';
import iconPng26 from '../src/assets/icons/APE.png';
import rightArrow from '../src/assets/icons/right-arrow.svg';
import apiIcon from '../src/assets/icons/api.png';
import appleIcon from '../src/assets/icons/apple.png';
import winIcon from '../src/assets/icons/win.png';
import playIcon from '../src/assets/icons/play.png';
import macIcon from '../src/assets/icons/mac.png';
import andIcon from '../src/assets/icons/android.png';
import item1 from '../src/assets/action/item1.png';
import item2 from '../src/assets/action/item2.png';
import item3 from '../src/assets/action/item3.png';
import poster from '../src/assets/792146.png';
import mobile from '../src/assets/mobile.png';
import qrImg from '../src/assets/qr.png';
import wh1 from '../src/assets/action/2593468.png';
import wh2 from '../src/assets/action/6675953.png';
import wh3 from '../src/assets/action/3243443.png';
import wh4 from '../src/assets/action/9767122.png';
import gi1 from '../src/assets/action/5252334.png';
import gi2 from '../src/assets/action/25533443.png';
import gi3 from '../src/assets/action/23455332.png';
import { baseUrl, filebaseUrl } from "./services/config";

const headers = {
  "Content-Type": "application/json",
};

export default class extends Component {
  constructor(props) {
    super(props);

    this.loginData = !Cookies.get("loginSuccess")
      ? []
      : JSON.parse(Cookies.get("loginSuccess"));
    // const { match: { params } } = this.props;
    this.loginId = !this.loginData.data ? 0 : this.loginData.data.id;
    this.href = window.location.href;
    this.coin_symbol = this.href.substring(this.href.lastIndexOf("/") + 1);

    this.state = {
      headerSeacrhCoin: ["BTCUSDT", "ETHUSDT", "BCHUSDT", "BNBUSDT"],
      mainMarketData: [],
      AllMainMarketData: [],
      my_pair_list: [],
      email: "",
      notification_list: [],
      sliderImages: [],
      HotText: '',
      hotList: [],
      topGainers: [],
      newCoins: []

    };
    this.mainMarketDataFun = this.mainMarketDataFun.bind(this);
    this.pairListAPI = this.pairListAPI.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.mainMarketDataFun();
    this.pairListAPI();
    this.notificationDetails();
    this.getSliderImages()
    this.getText()
    this.getHotList()
    this.getNewCoins()
    this.getTopgainers()
  }



  getSliderImages() {
    fetch(`${baseUrl}/images`)
      .then(res => res.json())
      .then((data) => {
        this.setState({
          sliderImages: data.images
        })
      }).catch(err => {
        console.log(err)
      })
  }

  getText() {
    fetch(`${baseUrl}/text`)
      .then(res => res.json())
      .then((data) => {
        this.setState({
          HotText: data.text.content
        })
      }).catch(err => {
        console.log(err)
      })
  }

  // get hot list
  getHotList() {
    fetch(`${baseUrl}/hotlists`)
      .then(res => res.json())
      .then((data) => {
        this.setState({
          hotList: data.cryptos
        })
      }).catch(err => {
        console.log(err)
      })
  }

  // get hot list

  getNewCoins() {
    fetch(`${baseUrl}/newcoins`)
      .then(res => res.json())
      .then((data) => {
        this.setState({
          newCoins: data.cryptos
        })
      }).catch(err => {
        console.log(err)
      })
  }

  // get top gainers

  getTopgainers() {
    fetch(`${baseUrl}/topgainers`)
      .then(res => res.json())
      .then((data) => {
        this.setState({
          topGainers: data.cryptos
        })
      }).catch(err => {
        console.log(err)
      })
  }





  async notificationDetails() {
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

  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  gotSignup() {
    Cookies.set("email", this.state.email, {
      secure: config.Secure,
      HttpOnly: config.HttpOnly,
    });
    if (this.state.email) {
      if (this.loginId) {
        window.location.href = `${config.baseUrl}Exchange`;
      } else {
        window.location.href = `${config.baseUrl}signup`;
      }
    }
  }
  async pairListAPI(id) {
    if (id === undefined) {
      this.searchData = "";
    } else {
      this.searchData = id;
    }
    await axios({
      method: "post",
      url: `${config.apiUrl}/pairlist` + "?nocache=" + new Date().getTime(),
      headers: { Authorization: this.loginData?.Token },
      data: { search: this.searchData },
    })
      .then(async (result) => {
        if (result.data.success === true) {
          this.setState({
            my_pair_list: result.data.response,
          });
          let MainArr = [];
          // alert(this.state.my_pair_list.length)
          for (var i = 0; i < this.state.my_pair_list.length; i++) {
            var symbol =
              this.state.my_pair_list[i].left_symbol +
              this.state.my_pair_list[i].right_symbol;
            var dataGet = await fetch(
              "https://api.binance.com/api/v3/ticker/24hr?symbol=" + symbol
            );
            var resData = await dataGet.json();
            MainArr[i] = resData;
            MainArr[i].left_symbol = this.state.my_pair_list[i].left_symbol;
            MainArr[i].right_symbol = this.state.my_pair_list[i].right_symbol;
          }
          this.setState({
            AllMainMarketData: MainArr,
          });
        }
      })

      .catch((err) => {
        if (err == "Error: Request failed with status code 403") {
          toast.error("Session expired please re-login");
        }
        // toast.error(err.result?.data?.msg, {
        //     position: toast.POSITION.TOP_CENTER
        // })
      });
  }

  async mainMarketDataFun() {
    let MainArr = [];
    for (var i = 0; i < this.state.headerSeacrhCoin.length; i++) {
      var data = await fetch(
        "https://api.binance.com/api/v3/ticker/24hr?symbol=" +
        this.state.headerSeacrhCoin[i]
      );
      var resData = await data.json();
      MainArr[i] = resData;
    }
    this.setState({
      mainMarketData: MainArr,
    });
  }

  render() {
    return (
      <>
        <Header />
        <section className="max-w-[1400px] w-11/12 mx-auto sl-pt-10">
          <div className="flex flex-wrap p-4">
            <div className="xl:w-3/5 lg:w-1/2 w-full lg:sl-py-20 md:sl-py-8 sl-py-4  lg:sl-order-1- sl-order-2-">
              <h1 className="xl:text-4xl md:text-3xl text-2xl font-bold">Worldwide Leading Digital Coin Trading Website</h1>
              <p className="md:text-lg text-base sl-pt-2 sl-pb-6">Royalbit Exchange: A Global Era Trading Platform for <br />Collecting Various Coins with Fiat Currency
              </p>
              <a href="https://royalbit.exchange/signup">
                 <button className="inline-flex sl-mr-2 items-center uppercase md:text-base text-sm font-medium sl-px-4 sl-py-2 bg-teal-400 rounded-sm hover:bg-teal-700 sl-animated-lg" href="https://royalbit.exchange/signup">sing up for free <img className="w-4 sl-ml-2" src={rightArrow} alt="" /></button>
              </a>
              <a href="https://royalbit.exchange/Exchange"><button className="inline-flex items-center uppercase md:text-base text-sm font-medium sl-px-4 sl-py-2 bg-neutral-800 rounded-sm hover:bg-neutral-950 sl-animated-lg">market <img className="w-4 sl-ml-2" src={rightArrow} alt="" /></button>
              </a>
            </div>
            <div className="xl:w-2/5 lg:w-1/2 w-full lg:sl-order-2- sl-order-1-"><img className="lg:w-full sm:w-1/2 mx-auto" src={mobile} alt="" /></div>
          </div>
          <div className="sl-mb-6">
            <Swiper
              autoplay={{ delay: 1500 }}
              spaceBetween={10}
              slidesPerView={1}
              loop={true}
              modules={[Autoplay]}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 15,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1264: {
                  slidesPerView: 4,
                  spaceBetween: 10,
                }
              }}>
              {
                this.state.sliderImages && this.state.sliderImages.map(img => (
                  <SwiperSlide>
                    <a href=""><img src={img.imageUrl} className="w-full rounded" alt="" /></a>
                  </SwiperSlide>
                ))
              }

              {/* <SwiperSlide>
                <a href=""><img src={poster} className="w-full rounded" alt="" /></a>
              </SwiperSlide>
              <SwiperSlide>
                <a href=""><img src={poster} className="w-full rounded" alt="" /></a>
              </SwiperSlide>
              <SwiperSlide>
                <a href=""><img src={poster} className="w-full rounded" alt="" /></a>
              </SwiperSlide>
              <SwiperSlide>
                <a href=""><img src={poster} className="w-full rounded" alt="" /></a>
              </SwiperSlide> */}
            </Swiper>
          </div>
        </section>

        <div className="bg-teal-400 text-center p-2 lg:text-base text-sm">
          {this.state.HotText}
        </div>
        {/* <div className="bg-teal-400 text-center p-2 lg:text-base text-sm">
          Temporarily close the ADA coin deposit and withdrawal system from 24/11/2023 at 2:40 PM onwards. Sorry for the inconvenience.
        </div> */}

        <section className="sl-container xl:sl-pt-28 lg:sl-pt-24 sl-pt-12 xl:sl-pb-40 lg:sl-pb-32 sl-pb-20">
          <h2 className="text-center xl:text-5xl md:text-3xl text-2xl font-medium lg:sl-pb-20 md:sl-pb-14 sl-pb-8">Build Your <br /> <span className="text-teal-400">Cryptocurrency Portfolio</span></h2>
          <Swiper
            autoplay={{ delay: 700 }}
            spaceBetween={10}
            slidesPerView={3}
            loop={true}
            modules={[Autoplay]}
            breakpoints={{
              520: {
                slidesPerView: 4,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 5,
                spaceBetween: 15,
              }
            }}   >
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng1} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">ator</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng2} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">blz</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng3} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">bnb</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng4} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">bonk</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng5} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">btc</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng6} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">dash</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng7} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">dent</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng8} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">fil</h3>
              </div>
            </SwiperSlide>
          </Swiper>
          <Swiper
            autoplay={{ delay: 500 }}
            spaceBetween={10}
            slidesPerView={3}
            loop={true}
            modules={[Autoplay]}
            breakpoints={{
              520: {
                slidesPerView: 4,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 5,
                spaceBetween: 15,
              }
            }}   >
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng10} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">ew</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng11} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">eth</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng12} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">zec</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng13} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">xrp</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng14} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">usdt</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng15} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">qkc</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng16} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">mtl</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng17} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">lsk</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng18} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">fil</h3>
              </div>
            </SwiperSlide>
          </Swiper>
          <Swiper
            autoplay={{ delay: 900 }}
            spaceBetween={10}
            slidesPerView={3}
            loop={true}
            modules={[Autoplay]}
            breakpoints={{
              520: {
                slidesPerView: 4,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 5,
                spaceBetween: 15,
              }
            }}   >
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng19} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">lsk</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng20} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">ator</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng21} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">mtl</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng22} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">blz</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng23} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">bnb</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng24} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">qkc</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng25} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">bonk</h3>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="flex justify-center items-center sm:sl-py-2.5 sl-py-1.5 sm:sl-px-4 sl-px-2 md:rounded-3xl rounded-xl bg-teal-700 border border-teal-900 xl:sl-mb-9 md:sl-mb-5 sl-mb-3">
                <img src={iconPng26} alt="" className="lg:w-10 sm:w-8 w-6 lg:h-10 sm:h-8 h-6 rounded-full" />
                <h3 className="uppercase lg:text-2xl md:text-xl text-base md:sl-ml-4 sl-ml-2">usdt</h3>
              </div>
            </SwiperSlide>
          </Swiper>
        </section>

        <section className="sl-container">
          <div className="flex flex-wrap xl:justify-between justify-evenly">
            <div className="max-w-sm w-full sl-mb-9">
              <div className="relative flex flex-col justify-end md:h-80 h-60 border border-teal-400 rounded-3xl md:sl-px-5 sl-px-3 md:sl-py-12 sl-py-4">
                <div className="md:absolute -top-1/2 w-full md:translate-y-1/2"><img src={item1} alt="" className="md:w-48 w-28 mx-auto" /></div>
                <div>
                  <h3 className="md:text-xl text-lg font-semibold">300+ cryptocurrencies.</h3>
                  <span className="md:text-xl text-lg font-medium text-neutral-400">40.000+ trading pairs</span>
                  <p className="text-sm text-neutral-400 md:mt-4">Trade with the innovative trading platform designed to facilitate your trading.</p>
                </div>
              </div>
            </div>
            <div className="max-w-sm w-full sl-mb-9">
              <div className="relative flex justify-end md:h-80 h-60 border border-teal-400 rounded-3xl md:sl-px-0 sl-px-3 md:sl-py-8 sl-py-4">
                <div className="md:absolute left-0 bottom-16"><img src={item2} alt="" className="md:w-36 w-24" /></div>
                <div className="w-60">
                  <h3 className="md:text-xl text-lg font-semibold">Royalbit Exchange Club</h3>
                  <span className="md:text-xl text-lg font-medium text-neutral-400">Discover the privileges</span>
                  <p className="text-sm text-neutral-400 md:mt-4">Discover endless opportunities and start earning on Royalbit Exchange Club mobile app by staking fan and social tokens.</p>
                </div>
              </div>
            </div>
            <div className="max-w-sm w-full sl-mb-9">
              <div className="relative flex flex-col justify-end md:items-end md:h-80 h-60 border border-teal-400 rounded-3xl sl-px-2 md:sl-py-8 sl-py-4">
                <div className="md:absolute left-0 -top-10"><img src={item3} alt="" className="md:w-56 w-44" /></div>
                <div className="md:w-56">
                  <h3 className="md:text-xl text-lg font-semibold">Fan & Social Tokens</h3>
                  <span className="md:text-xl text-lg font-medium text-neutral-400">Be part of your team and community</span>
                  <p className="text-sm text-neutral-400 md:mt-4">Trade fan and social tokens, support your football or sports team and social community.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sl-container xl:sl-pt-32 lg:sl-pt-20 sl-pt-12">
          <h2 className="text-center xl:text-5xl md:text-3xl text-2xl font-medium lg:sl-pb-20 md:sl-pb-14 sl-pb-8">Crypto Market <span className="text-teal-400">Today</span></h2>
          <div className="flex flex-wrap justify-center">
            <div className="lg:w-1/3 sm:w-1/2 w-full sl-px-2 sl-mb-4">
              <div className="border border-teal-900 rounded-3xl md:sl-px-4 sl-px-3 md:sl-py-6 sl-py-4">
                <h3 className="border-l-4 border-teal-400 pl-2 font-semibold">Hot List</h3>
                <ul className="md:space-y-4 space-y-2 md:mt-6 mt-4">
                  {
                    this.state.hotList.map((lis) => (
                      <a href={lis.link} target="_blank">
                        <li className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img src={`${filebaseUrl}/${lis.symbolImage}`} className="w-6" alt="" />
                            <p className="leading-4 uppercase">{lis.name} <br /> <span className="text-sm text-neutral-400">{lis.symbol}</span></p>
                          </div>
                          <div className="">
                            <p>${lis.price}</p>
                            <p style={{ color: lis?.percentageChange < 0 ? 'red' : lis?.percentageChange > 0 ? 'green' : 'black' }} className="text-sm text-teal-400">
                              {typeof lis?.percentageChange === 'number' ? `${lis.percentageChange}%` : 'N/A'}
                            </p>
                          </div>
                        </li>
                      </a>
                    ))
                  }

                  {/* <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng2} className="w-6" alt="" />
                      <p className="leading-4 uppercase">blz <br /> <span className="text-sm text-neutral-400">blz</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng3} className="w-6" alt="" />
                      <p className="leading-4 uppercase">bnb <br /> <span className="text-sm text-neutral-400">bnb</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng4} className="w-6" alt="" />
                      <p className="leading-4 uppercase">bonk <br /> <span className="text-sm text-neutral-400">bonk</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng5} className="w-6" alt="" />
                      <p className="leading-4 uppercase">btc <br /> <span className="text-sm text-neutral-400">btc</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li> */}
                </ul>
              </div>
            </div>
            <div className="lg:w-1/3 sm:w-1/2 w-full sl-px-2 sl-mb-4">
              <div className="border border-teal-900 rounded-3xl md:sl-px-4 sl-px-3 md:sl-py-6 sl-py-4">
                <h3 className="border-l-4 border-teal-400 pl-2 font-semibold">New Coins</h3>
                <ul className="md:space-y-4 space-y-2 md:mt-6 mt-4">
                  {
                    this.state.newCoins.map((lis) => (
                      <a href={lis.link} target="_blank">
                        <li className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img src={`${filebaseUrl}/${lis.symbolImage}`} className="w-6" alt="" />
                            <p className="leading-4 uppercase">{lis.name} <br /> <span className="text-sm text-neutral-400">{lis.symbol}</span></p>
                          </div>
                          <div className="">
                            <p>${lis.price}</p>
                            <p style={{ color: lis?.percentageChange < 0 ? 'red' : lis?.percentageChange > 0 ? 'green' : 'black' }} className="text-sm text-teal-400">
                              {typeof lis?.percentageChange === 'number' ? `${lis.percentageChange}%` : 'N/A'}
                            </p>
                          </div>
                        </li>
                      </a>
                    ))
                  }
                  {/* <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng6} className="w-6" alt="" />
                      <p className="leading-4 uppercase">dash <br /> <span className="text-sm text-neutral-400">dash</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng7} className="w-6" alt="" />
                      <p className="leading-4 uppercase">dent <br /> <span className="text-sm text-neutral-400">dent</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng8} className="w-6" alt="" />
                      <p className="leading-4 uppercase">fil <br /> <span className="text-sm text-neutral-400">fil</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng9} className="w-6" alt="" />
                      <p className="leading-4 uppercase">lsk <br /> <span className="text-sm text-neutral-400">lsk</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng10} className="w-6" alt="" />
                      <p className="leading-4 uppercase">mtl <br /> <span className="text-sm text-neutral-400">mtl</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li> */}
                </ul>
              </div>
            </div>
            <div className="lg:w-1/3 sm:w-1/2 w-full sl-px-2 sl-mb-4">
              <div className="border border-teal-900 rounded-3xl md:sl-px-4 sl-px-3 md:sl-py-6 sl-py-4">
                <h3 className="border-l-4 border-teal-400 pl-2 font-semibold">Top Gainers</h3>
                <ul className="md:space-y-4 space-y-2 md:mt-6 mt-4">

                  {
                    this.state.topGainers.map((lis) => (
                      <a href={lis.link} target="_blank">
                        <li className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img src={`${filebaseUrl}/${lis.symbolImage}`} className="w-6" alt="" />
                            <p className="leading-4 uppercase">{lis.name} <br /> <span className="text-sm text-neutral-400">{lis.symbol}</span></p>
                          </div>
                          <div className="">
                            <p>${lis.price}</p>
                            <p style={{ color: lis?.percentageChange < 0 ? 'red' : lis?.percentageChange > 0 ? 'green' : 'black' }} className="text-sm text-teal-400">
                              {typeof lis?.percentageChange === 'number' ? `${lis.percentageChange}%` : 'N/A'}
                            </p>
                          </div>
                        </li>
                      </a>
                    ))
                  }

                  {/* <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng11} className="w-6" alt="" />
                      <p className="leading-4 uppercase">qkc <br /> <span className="text-sm text-neutral-400">qkc</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng13} className="w-6" alt="" />
                      <p className="leading-4 uppercase">xrp <br /> <span className="text-sm text-neutral-400">xrp</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng12} className="w-6" alt="" />
                      <p className="leading-4 uppercase">usdt <br /> <span className="text-sm text-neutral-400">usdt</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng14} className="w-6" alt="" />
                      <p className="leading-4 uppercase">ZEC <br /> <span className="text-sm text-neutral-400">ZEC</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img src={iconPng15} className="w-6" alt="" />
                      <p className="leading-4 uppercase">eth <br /> <span className="text-sm text-neutral-400">eth</span></p>
                    </div>
                    <div className="">
                      <p>$28.95</p>
                      <p className="text-sm text-teal-400">+1.31%</p>
                    </div>
                  </li> */}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="sl-container sl-pt-32">
          <h2 className="text-center xl:text-5xl md:text-3xl text-2xl font-medium">Why <span className="text-teal-400">Royalbit Exchange?</span></h2>
          <div className="w-full flex flex-wrap xl:justify-between justify-evenly mt-24">
            <div className="group flex flex-col items-center justify-center w-64 md:h-[28rem] h-80 xl:sl-px-8 md:sl-px-6 sl-px-4 rounded-3xl cursor-pointer hover:bg-teal-400 hover:xl:-translate-y-20 hover:md:-translate-y-12 hover:-translate-y-10 sl-animated-xl">
              <div className="md:w-28 w-24 md:h-28 h-24 lg:sl-mb-12 sm:sl-mb-9 sl-mb-6"><img src={wh1} alt="" /></div>
              <h3 className="lg:text-2xl sm:text-xl text-lg font-semibold lg:sl-mb-8 sm:sl-mb-6 sl-mb-4 group-hover:text-black sl-animated-lg">Secure</h3>
              <p className="md:text-lg text-sm text-center text-neutral-400 group-hover:text-black sl-animated-lg">We offer industry-leading secure cryptocurrency trading platform, maintaining a robust reserve fund that exceeds 1:1 ratio against user holdings.</p>
            </div>
            <div className="group flex flex-col items-center justify-center w-64 md:h-[28rem] h-80 xl:sl-px-8 md:sl-px-6 sl-px-4 rounded-3xl cursor-pointer hover:bg-teal-400 hover:xl:-translate-y-20 hover:md:-translate-y-12 hover:-translate-y-10 sl-animated-xl">
              <div className="md:w-28 w-24 md:h-28 h-24 lg:sl-mb-12 sm:sl-mb-9 sl-mb-6"><img src={wh2} alt="" /></div>
              <h3 className="lg:text-2xl sm:text-xl text-lg font-semibold lg:sl-mb-8 sm:sl-mb-6 sl-mb-4 group-hover:text-black sl-animated-lg">Seamless</h3>
              <p className="md:text-lg text-sm text-center text-neutral-400 group-hover:text-black sl-animated-lg">Enjoy the benefits of efficient and real-time online trading. Start your crypto journey with just $10 investment.</p>
            </div>
            <div className="group flex flex-col items-center justify-center w-64 md:h-[28rem] h-80 xl:sl-px-8 md:sl-px-6 sl-px-4 rounded-3xl cursor-pointer hover:bg-teal-400 hover:xl:-translate-y-20 hover:md:-translate-y-12 hover:-translate-y-10 sl-animated-xl">
              <div className="md:w-28 w-24 md:h-28 h-24 lg:sl-mb-12 sm:sl-mb-9 sl-mb-6"><img src={wh3} alt="" /></div>
              <h3 className="lg:text-2xl sm:text-xl text-lg font-semibold lg:sl-mb-8 sm:sl-mb-6 sl-mb-4 group-hover:text-black sl-animated-lg">Insights</h3>
              <p className="md:text-lg text-sm text-center text-neutral-400 group-hover:text-black sl-animated-lg">Get real-time updates and sharp insights about the cryptocurrency market.</p>
            </div>
            <div className="group flex flex-col items-center justify-center w-64 md:h-[28rem] h-80 xl:sl-px-8 md:sl-px-6 sl-px-4 rounded-3xl cursor-pointer hover:bg-teal-400 hover:xl:-translate-y-20 hover:md:-translate-y-12 hover:-translate-y-10 sl-animated-xl">
              <div className="md:w-28 w-24 md:h-28 h-24 lg:sl-mb-12 sm:sl-mb-9 sl-mb-6"><img src={wh4} alt="" /></div>
              <h3 className="lg:text-2xl sm:text-xl text-lg font-semibold lg:sl-mb-8 sm:sl-mb-6 sl-mb-4 group-hover:text-black sl-animated-lg">Service</h3>
              <p className="md:text-lg text-sm text-center text-neutral-400 group-hover:text-black sl-animated-lg">Experience unparalleled assistance with multilingual 24/7 customer support. Ensuring a seamless and satisfying trading experience.</p>
            </div>
          </div>
        </section>

        <section className="sl-container xl:sl-pt-32 lg:sl-pt-20 sl-pt-12">
          <div className="flex flex-wrap items-center">
            <div className="xl:w-1/2 md:w-1/3 sl-px-2 md:sl-mb-0 sm:sl-mb-9 sl-mb-6">
              <h2 className="sm:text-2xl text-xl font-semibold md:sl-pb-4 sl-pb-2">Your Portal to <br />Web3 Innovation</h2>
              <span className="text-sm">Empowering Your Decentralized Future</span>
            </div>
            <div className="xl:w-1/2 md:w-2/3 sl-px-2 sl-mb-4">
              <div className="rounded-3xl bg-neutral-900/20 sl-px-4 sl-py-6">
                <span className="text-sm">01/</span>
                <h3 className="text-lg font-semibold sm:sl-pt-2 sl-pt-1 sm:sl-pb-4 sl-pb-2">Exchanges</h3>
                <p className="text-sm sm:leading-7 leading-normal">Royalbit Exchange Exchange is now live, ushering in a new era of cryptocurrency trading. With a user-friendly interface and robust security measures, it offers a seamless experience for buying and selling digital assets. The platform`s advanced tools and real-time market data empower users to make informed decisions. Royalbit Exchange Exchange is set to redefine the crypto trading landscape with its commitment to transparency and reliability. Welcome to a new age of secure and efficient cryptocurrency exchange.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center">
            <div className="md:sl-order-1- sl-order-2- xl:w-1/2 md:w-2/3 sl-px-2 sl-mb-4">
              <div className="rounded-3xl bg-neutral-900/20 sl-px-4 sl-py-6">
                <span className="text-sm">02/</span>
                <h3 className="text-lg font-semibold sm:sl-pt-2 sl-pt-1 sm:sl-pb-4 sl-pb-2">Launchpad</h3>
                <p className="text-sm sm:leading-7 leading-normal">Royalbit Exchange is gearing up to launch its highly anticipated Launchpad, providing users with access to upcoming token launches and ICOs. This strategic move aims to simplify the investment process for users, offering a secure platform to discover and participate in innovative blockchain projects. As Royalbit Exchange diversifies its offerings, the Launchpad emerges as a pivotal feature, contributing to the platform`s commitment to fostering growth and innovation in the cryptocurrency landscape. Stay tuned for exciting opportunities in the evolving crypto space with Royalbit Exchange`s upcoming Launchpad.
                </p>
              </div>
            </div>
            <div className="md:sl-order-2- sl-order-1- xl:w-1/2 md:w-1/3 sl-px-2 sl-mb-4"><img src={gi1} alt="" className="xl:w-2/3 md:w-full w-1/2 xl:sl-ml-auto mx-auto" /></div>
          </div>
          <div className="flex flex-wrap items-center">
            <div className="xl:w-1/2 md:w-1/3 sl-px-2 sl-mb-4"><img src={gi2} alt="" className="xl:w-2/3 md:w-full w-1/2 xl:sl-mr-auto mx-auto" /></div>
            <div className="xl:w-1/2 md:w-2/3 sl-px-2 sl-mb-4">
              <div className="rounded-3xl bg-neutral-900/20 sl-px-4 sl-py-6">
                <span className="text-sm">03/</span>
                <h3 className="text-lg font-semibold sm:sl-pt-2 sl-pt-1 sm:sl-pb-4 sl-pb-2">Marketplaces</h3>
                <p className="text-sm sm:leading-7 leading-normal">Royalbit Exchange Exchange is set to unveil a groundbreaking NFT marketplace with a distinctive focus on low gas fees, ensuring that anyone can seamlessly list their NFTs and earn rewards. This initiative reaffirms Royalbit Exchange Exchange`s commitment to accessibility and affordability, providing artists and creators a unique platform to showcase their digital assets. Prepare for a transformative NFT experience within the Royalbit Exchange Exchange ecosystem, where innovation converges with cost-effectiveness, opening up exciting opportunities for the NFT community.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center">
            <div className="md:sl-order-1- sl-order-2- xl:w-1/2 md:w-2/3 sl-px-2 sl-mb-4">
              <div className="rounded-3xl bg-neutral-900/20 sl-px-4 sl-py-6">
                <span className="text-sm">04/</span>
                <h3 className="text-lg font-semibold sm:sl-pt-2 sl-pt-1 sm:sl-pb-4 sl-pb-2">NFT De-Fi</h3>
                <p className="text-sm sm:leading-7 leading-normal">Get ready for a game-changer! Royalbit Exchange Exchange is gearing up to launch an NFT De-Fi project that`s set to revolutionize the crypto landscape. Investors, seize the opportunity to ride the wave of innovation with Royalbit Exchange – where NFTs meet decentralized finance for a truly groundbreaking experience!</p>
              </div>
            </div>
            <div className="md:sl-order-2- sl-order-1- xl:w-1/2 md:w-1/3 sl-px-2 sl-mb-4"><img src={gi3} alt="" className="xl:w-2/3 md:w-full w-1/2 xl:sl-ml-auto mx-auto" /></div>
          </div>
        </section>

        <section className="sl-container xl:sl-py-28 lg:sl-py-24 sl-py-12">
          <h2 className="text-center xl:text-5xl md:text-3xl text-2xl font-medium">Trade Crypto Anywhere <span className="text-teal-400">Anytime?</span></h2>
          <div className="flex flex-wrap mt-12">
            <div className="md:w-1/2 w-full sl-px-2"><img src={mobile} alt="" /></div>
            <div className="md:w-1/2 w-full sl-px-2 xl:text-base text-sm">
              <div className="flex items-center bg-neutral-900/20 p-2 lg:sl-mb-9 sm:sl-mb-6 sl-mb-4 rounded">
                <div className="md:w-32 w-20 sm:sl-mr-6 sl-mr-4"><img src={qrImg} alt="" /></div>
                <div>
                  <h3 className="font-medium xl:text-lg text-base sl-mb-1">Scan QR Code</h3>
                  <span>Download Fate io App for Android/iOS</span>
                </div>
              </div>
              <ul className="flex flex-wrap">
                <li className="w-1/3 sl-px-2 text-center sm:sl-mb-6 sl-mb-4">
                  <img src={appleIcon} alt="" className="h-10 object-contain sl-mb-2" />
                  <span>App Store</span>
                </li>
                <li className="w-1/3 sl-px-2 text-center sm:sl-mb-6 sl-mb-4">
                  <img src={andIcon} alt="" className="h-10 object-contain sl-mb-2" />
                  <span>Android</span>
                </li>
                <li className="w-1/3 sl-px-2 text-center sm:sl-mb-6 sl-mb-4">
                  <img src={playIcon} alt="" className="h-10 object-contain sl-mb-2" />
                  <span>Google Play</span>
                </li>
                <li className="w-1/3 sl-px-2 text-center sm:sl-mb-6 sl-mb-4">
                  <img src={macIcon} alt="" className="h-10 object-contain sl-mb-2" />
                  <span>Mac OS</span>
                </li>
                <li className="w-1/3 sl-px-2 text-center sm:sl-mb-6 sl-mb-4">
                  <img src={winIcon} alt="" className="h-10 object-contain sl-mb-2" />
                  <span>Windows</span>
                </li>
                <li className="w-1/3 sl-px-2 text-center sm:sl-mb-6 sl-mb-4">
                  <img src={apiIcon} alt="" className="h-10 object-contain sl-mb-2" />
                  <span>API</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }
}
