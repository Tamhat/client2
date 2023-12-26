import React, { Component } from 'react';
import Header from '../../directives/header'
import Footer from '../../directives/footer'
import { confirmAlert } from 'react-confirm-alert';
import axios from 'axios'
import config from '../../config/config'
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import moment from 'moment'
const headers = {
  'Content-Type': 'application/json'
};

export default class orderHistory extends Component {

  constructor(props) {
    super(props)

    this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
    this.state = {
      getOrderList: [],
      downloadList: [],
      from_date: '',
      to_date: '',
      left_coin: '',
      order_type: '',
      right_coin: '',
      submitBtn: false,
      coinList: []
    }
    this.onChange = this.onChange.bind(this);
    this.filterSubmit = this.filterSubmit.bind(this);
  }
  onChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleChangeStart = (date) => {
    console.log('datefrom', date)
    this.setState({
      from_date: date
    })
  }

  handleChangeEnd = (date) => {
    this.setState({
      to_date: date
    })
  }

  componentDidMount() {
    this.orderListAPI();
    this.coinListAPI();
  }

  async coinListAPI() {
    await axios({
      method: 'get',
      url: `${config.apiUrl}/coinList` + '?nocache=' + new Date().getTime(),
    })
      .then(result => {
        if (result.data.success === true) {
          this.setState({
            coinList: result.data.response,
          })
        }
        else if (result.data.success === false) {
          this.setState({
            coinList: [],
          })
        }
      })
  }

  async orderListAPI() {

    await axios({
      method: 'post',
      url: `${config.apiUrl}/orderHistory` + '?nocache=' + new Date().getTime(),
      headers: { "Authorization": this.loginData?.Token },
      data: {
        "email": this.loginData?.data.user_email,
        'user_id': this.loginData.data?.id,
        'from_date': moment(this.state.from_date).format(),
        'to_date': moment(this.state.to_date).format(),
        'left_coin': this.state.left_coin,
        'order_type': this.state.order_type,
        'right_coin': this.state.right_coin,
      }
    })
      .then(result => {
        if (result.data.success === true) {

          let newarr = []
          if (result.data.response.length > 0) {

            for (let n in result.data.response) {
              let obj = {}
              obj.pair = result.data.response[n].pair
              obj.orderId = result.data.response[n].order_id
              obj.OrderType = result.data.response[n].order_type
              obj.Amount = result.data.response[n].amount
              obj.Fee = result.data.response[n].fee_amount
              obj.TDS = result.data.response[n].tds_vda_fee
              obj.orderPrice = result.data.response[n].price
              obj.AVGPrice = result.data.response[n].average_price
              obj.Date = moment(result.data.response[n].datetime).format('lll')
              obj.status = result.data.response[n].status == 0 ? 'Open' : result.data.response[n].status == 1 ? 'Completed' : 'Cancelled'
              newarr.push(obj)
            }

          }

          this.setState({
            getOrderList: result.data.response,
            downloadList: newarr

          })
        }

        else if (result.data.success === false) {
          this.setState({
            getOrderList: [],

          })
        }
      })

      .catch(err => {
        if (err == 'Error: Request failed with status code 403') {
          toast.error('Session expired please re-login')
        } else {
          toast.error(err.result?.data?.msg, {
            position: toast.POSITION.TOP_CENTER
          })
        }
      })
    setTimeout(() => {
      this.setState({
        submitBtn: false
      })
    }, 900);

  }


  filterSubmit(e) {
    e.preventDefault();
    this.setState({
      submitBtn: true
    })
    this.orderListAPI();
  }

  resetFilter(e) {
    e.preventDefault();
    this.setState({
      from_date: '',
      to_date: '',
      left_coin: '',
      right_coin: ''
    })
    this.orderListAPI();
  }

  downloadCSVFromJson = (filename, arrayOfJson) => {
    if (arrayOfJson.length > 0) {
      // convert JSON to CSV
      const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
      const header = Object.keys(arrayOfJson[0])
      let csv = arrayOfJson.map(row => header.map(fieldName =>
        JSON.stringify(row[fieldName], replacer)).join(','))
      csv.unshift(header.join(','))
      csv = csv.join('\r\n')

      // Create link and download
      var link = document.createElement('a');
      link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csv));
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  cancelOrderAPI(id) {
    let headers = {
      'Authorization': this.loginData?.Token,
      'Content-Type': 'application/json'
    }
    let URL = `${config.apiUrl}/cancelOrder` + '?nocache=' + new Date().getTime()
    if (id.isInternal == 1) {
      URL = `${config.apiUrl}/cancelInternalOrder` + '?nocache=' + new Date().getTime()
    }

    confirmAlert({
      title: 'Confirm to submit',
      message: 'Are you sure to Cancel order',
      buttons: [
        {

          label: 'Yes',
          onClick: () =>
            axios.post(`${URL}`, { 'user_id': this.loginData.data?.id, "email": this.loginData.data?.user_email, 'order_id': id.order_id, 'binance_order_id': id.binance_order_id, 'symbol': `${id.left_symbol}${id.right_symbol}` }, { headers: headers })
              .then(result => {

                if (result.data.success === true) {
                  toast.success(result.data.msg, {
                    position: toast.POSITION.TOP_CENTER
                  });


                  this.orderListAPI();
                }

                else if (result.data.success === false) {
                  toast.error(result.data.msg, {
                    position: toast.POSITION.TOP_CENTER
                  });
                  this.orderListAPI();
                }
              })

              .catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                  toast.error('Session expired please re-login')
                } else {
                  toast.error(err.response.data?.msg, {
                    position: toast.POSITION.TOP_CENTER
                  });
                }
              })
        },
        {
          label: 'No',
        }
      ]
    });

  }

  render() {

    return (
      <>

        <Header />
        <div className="container">
          <div className="row">
            <h1 className="History headerMargin" style={{ marginTop: '60px' }}>Order History</h1>
          </div>
          <div className="row sm-gutters">
            <div className="col-12 col-sm-12 col-md-12 p-0">
              <div className="crypt-market-status_order mt-4">
                <div>

                  <div className="tab-content crypt-tab-content">
                    <div role="tabpanel" className="tab-pane active mb-4" id="usd" style={{ display: 'block' }}>

                      <form onSubmit={this.filterSubmit}>
                        <div className='container'>
                          <div className="row">
                            <div className="col-12 col-md-4">
                              <div className="container2">
                                {/* <form> */}
                                <div className="row justify-content-md-center">
                                  <div className="col-6">
                                    <div className="form-group">
                                      <label for="pure-date">From Date</label>
                                      <div className="input-group mb-4">
                                        <div className="input-group-prepend">
                                        </div>
                                        <DatePicker
                                          className="input-control"
                                          autoComplete={false}
                                          onChange={e => this.handleChangeStart(e)}
                                          selected={this.state.from_date}
                                          name="from_date"
                                        />

                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="form-group">
                                      <label for="from-date">To Date</label>
                                      <div className="input-group mb-4 constrained">
                                        <div className="input-group-prepend">
                                        </div>
                                        <DatePicker
                                          className="input-control"
                                          autoComplete={false}
                                          onChange={e => this.handleChangeEnd(e)}
                                          selected={this.state.to_date}
                                          name="to_date"
                                        />

                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* </form> */}
                              </div>

                            </div>


                            <div className="col-12 col-md-4">
                              <div className="container2 mobile-container">
                                {/* <form> */}
                                <div className="row justify-content-md-center">
                                  <div className="col-sm-6 col-md-6 col-6">
                                    <div className="form-group">
                                      <label for="exampleInputEmail1" className="form-label">Pair</label>
                                      <select className="form-select" aria-label="Default select example" onChange={this.onChange} name="left_coin" value={this.state.left_coin}>
                                        <option selected value="">All</option>
                                        {this.state.coinList.map(item => (

                                          <option value={item.id}>{item.symbol}</option>

                                        ))}
                                        <i classname="fas fa-chevron-down"></i>
                                      </select>

                                    </div>


                                  </div>
                                  <div className="col-sm-6 col-md-6 col-6">
                                    <div className="form-group">
                                      <label for="exampleInputEmail1" className="form-label">Type</label>
                                      <select className="form-select" aria-label="Default select example" onChange={this.onChange} name="order_type" >
                                        <option selected value="">All</option>
                                        <option value="BUY">Buy </option>
                                        <option value="SELL">Sell </option>
                                        <option value="COMPLETED">Completed </option>
                                        <option value="OPEN">Open </option>
                                        <option value="CANCEL">Cancel </option>
                                        <i classname="fa fa-chevron-down"></i>
                                      </select>
                                    </div>
                                  </div>
                                </div>

                              </div>

                            </div>

                            <div className="col-12 col-md-4 pt-1">
                              <div className="btn-div btn-reset-search">
                                <button className="btn btn-primary btn-reset mr-3" type="button" onClick={this.resetFilter.bind(this)}>Reset</button>
                                <button className="btn btn-primary btn-submit mr-3" type="submit" disabled={this.state.submitBtn}>{(this.state.submitBtn) ? 'Loading...' : 'Search'}</button>
                                <button className="btn btn-primary btn-submit" type="button" onClick={e => this.downloadCSVFromJson('orderlist.csv', this.state.downloadList)}><i class="fa fa-download"></i> Download</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div role="tabpanel" className="tab-pane" id="btc">
                      <div className="row">
                        <div className="col-12 col-md-2">
                          <div className="mt-3">
                            <label for="exampleInputEmail1" className="form-label">Type</label>
                            <select className="form-select" aria-label="Default select example">
                              <option selected>Deposit</option>
                              <option value="1">Cash</option>
                              <option value="1">Withdraw</option>
                              {/* <!-- <option value="3">Three</option> --> */}
                            </select>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="container2 ">
                            {/* <form> */}
                            <div className="row justify-content-md-center">
                              <div className="col-6">
                                <div className="form-group">
                                  <label for="pure-date">Date</label>
                                  <div className="input-group mb-4">
                                    <div className="input-group-prepend">

                                    </div>
                                    <input type="date" className="form-control" id="pure-date" aria-describedby="date-design-prepend" />
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="form-group">
                                  <label for="from-date">Date</label>
                                  <div className="input-group mb-4 constrained">
                                    <div className="input-group-prepend">

                                    </div>
                                    <input type="date" className="form-control ppDate" id="from-date" aria-describedby="date-design-prepend" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* </form> */}
                          </div>
                        </div>
                        {/* </form> */}
                        <div className="col-12 col-md-4"></div>
                        <div className="col-12 col-md-2">
                          <div className="btn-div">
                            <button className="btn btn-primary btn-reset">Reset</button>
                            <button className="btn btn-primary btn-submit">Submit</button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          {/* </div> */}

          <div className="row p-3" style={{ background: "#131722", display: 'none' }}>
            <div className="col-12 col-md-2">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                <label className="form-check-label" for="flexCheckDefault" style={{ color: "#fff" }}>
                  Hide All Cancelled
                </label>
              </div>
            </div>
            <div className="col-12 col-md-5"></div>
            <div className="col-12 col-md-5">
              <a href="#" className="external_link"><i className="fas fa-external-link-alt"></i>Genrate All Order Statement</a>
              <a href="#" className="external_link"><i className="fas fa-external-link-alt"></i>Export Report Order History</a>
            </div>
          </div>
          <div className="row tab-content">
            <table className="table table-striped table-responsive-sm">
              <thead>
                <tr>

                  <th scope="col">Pair</th>
                  <th scope="col">ORDER ID</th>
                  {/* <th scope="col">Completed By</th> */}
                  <th scope="col">Type</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Fee</th>
                  <th scope='col'>TDS fee</th>
                  <th scope="col">Executed Amount</th>
                  <th scope="col">At Price</th>
                  <th scope='col'>Average Price</th>
                  <th scope="col">Time</th>
                  <th scope="col">Status</th>
                  <th scope='col'>Action</th>

                </tr>
              </thead>
              <tbody>
                {this.state.getOrderList.length === 0 ? <tr >
                  <td className="text-center" colSpan="10">Order history not found</td></tr> :

                  this.state.getOrderList.map(item => (
                    <tr>
                      <>

                        <td >{item.pair}</td>
                        <td >{item.order_id}</td>
                        {/* <td>{item.completed_by}</td> */}
                        <td className={(item.order_type == 'BUY') ? 'crypt-up' : 'crypt-down'}>{item.order_type}</td>

                        <td>{(parseFloat(item.amount)).toFixed(6)}</td>
                        <td>{(parseFloat(item.fee_amount)).toFixed(6)}</td>
                        <td>{(parseFloat(item.tds_vda_fee)).toFixed(6)}</td>
                        {item.status == 'Open' ?
                          <td>{parseFloat(0).toFixed(6)}</td>
                          :
                          // <td>{(parseFloat(item.amount + item.fee_amount + item.tds_vda_fee + item.gst_quantity_fee)).toFixed(6)}</td>
                          <td>{(parseFloat(item.actual_executed_currency_amount)).toFixed(6)}</td>
                        }
                        <td>{parseFloat(item.price).toFixed(6)}</td>
                        <td>{parseFloat(item.average_price).toFixed(6)}</td>
                        <td scope="row">{moment(item.datetime).format('lll')}</td>

                        <td className={item.status == 0 ? 'yellow-color-class' : item.status == 1 ? 'green-color-class' : 'red-color-class'}>{item.status==0?'Open':item.status==1?'Completed':'Cancelled'}</td>
                        <td> {item.status == 0 ? <button type="button" className="btn-danger" onClick={this.cancelOrderAPI.bind(this, item)} data-toggle="tooltip" data-original-title=""> <i class="ico-times" role="img" aria-label="Cancel"></i></button> : ''}</td>

                      </>

                    </tr>
                  ))}

              </tbody>

            </table>
          </div>
        </div>



        <Footer />

      </>
    )
  }
}