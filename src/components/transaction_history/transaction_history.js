import React, { Component } from 'react';
import Header from '../../directives/header'
import Footer from '../../directives/footer'

import axios from 'axios'
import config from '../../config/config'
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';


const headers = {
	'Content-Type': 'application/json'
};
export default class transaction_history extends Component {

	constructor(props) {
		super(props)

		this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
		this.state = {
			getTxList: [],
			from_date: '',
			to_date: '',
			coin: '',
			type: '',
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

	componentDidMount() {
		this.txListAPI()
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
	async txListAPI() {
		await axios({
			method: 'post',
			url: `${config.apiUrl}/trxHistory` + '?nocache=' + new Date().getTime(),
			headers: { "Authorization": this.loginData?.Token },
			data: {
				'user_id': this.loginData.data?.id,
				"email": this.loginData.data?.user_email,
				'from_date': this.state.from_date,
				'to_date': this.state.to_date,
				'coin': this.state.coin,
				'type': this.state.type,
			}
		})
			.then(result => {
				if (result.data.success === true) {

					this.setState({
						getTxList: result.data.response,

					})
				}

				else if (result.data.success === false) {
					this.setState({
						getTxList: [],

					})
				}
			})

			.catch(err => {
				if (err == 'Error: Request failed with status code 403') {
					toast.error('Session expired please re-login')
				  }else{

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
		this.txListAPI();
	}

	resetFilter(e) {
		e.preventDefault();
		this.setState({
			from_date: '',
			to_date: '',
			coin: '',
			type: ''
		})
		this.txListAPI();
	}


	render() {

		return (
			<>

				<Header />
				<div className="container">
					<div className="row">
						<h1 className="History headerMarginWallet">Transaction History</h1>
					</div>
					<div className="row sm-gutters pt-5">

						<div className="col-lg-12">
							{/* <!-- <div id="depthchart" className="depthchart h-40 crypto-depth-chart-small-height crypt-dark-segment"></div> --> */}
							<div className="">
								<div className="crypt-market-status_sell">
									<div>
										{/* <!-- Nav tabs --> */}
										<ul className="nav nav-tabs">
											<li role="presentation"><a href="#closed-orders" className="active" data-toggle="tab">Deposit & Withdraw</a></li>
											{/* <!-- <li role="presentation"><a href="#active-orders" data-toggle="tab">Transfer</a></li> -->
					    	<!-- <li role="presentation"><a href="#balance" data-toggle="tab">Distribution</a></li> -->
					    	<!-- <li role="presentation"><a href="#bnb" data-toggle="tab">BNB Convert</a></li> --> */}
										</ul>

										{/* <!-- Tab panes --> */}
										<div className="tab-content">
											<div role="tabpanel" className="tab-pane active" id="closed-orders">
												<div className="row">
													<div className="col-12 col-sm-12 col-md-12">
														<div className="crypt-market-status_history mt-4">
															<div>
																{/* <ul className="nav nav-tabs" id="crypt-tab">
					                            <li role="presentation"><a href="#usd" className="active" data-toggle="tab">Crypto</a></li>
					                            <li role="presentation"><a href="#btc" data-toggle="tab">Cash</a></li>
					                        </ul> */}
																<div className="tab-content crypt-tab-content">
																	<div role="tabpanel" className="tab-pane active mb-4" id="usd">
																		<form onSubmit={this.filterSubmit}>
																			<div className="row" id="transcation_row">

																				<div className="col-12 col-md-5">
																					<div className="container2">
																						{/* <form> */}
																						<div className="row justify-content-md-center">
																							<div className="col-lg-6 col-md-6 col-6">
																								<div className="form-group">
																									<label for="pure-date">Start Date</label>
																									<div className="input-group mb-4">
																										<div className="input-group-prepend">
																										</div>
																										<input onChange={this.onChange} name="from_date" value={this.state.from_date} type="date" className="form-control" id="pure-date" aria-describedby="date-design-prepend" />
																									</div>
																								</div>
																							</div>
																							<div className="col-lg-6 col-md-6 col-6">
																								<div className="form-group">
																									<label for="from-date">End Date</label>
																									<div className="input-group mb-4 constrained">
																										<div className="input-group-prepend">
																										</div>
																										<input onChange={this.onChange} name="to_date" value={this.state.to_date} type="date" className="form-control ppDate" id="from-date" aria-describedby="date-design-prepend" />
																									</div>
																								</div>
																							</div>
																						</div>
																						{/* </form> */}
																					</div>

																				</div>


																				<div className="col-6 col-md-2">
																					<div className="container2">
																						{/* <form> */}
																						<div className="row justify-content-md-center">
																							<div className="form-group">
																								<label for="exampleInputEmail1" className="form-label">Pair</label>
																								<select className="form-select" aria-label="Default select example" onChange={this.onChange} name="coin" value={this.state.coin}>
																									<option selected value="">All</option>
																									{this.state.coinList.map(item => (
																										// (item.id != this.state.right_coin)?
																										<option value={item.id}>{item.symbol}</option>  
																										// :'' 
																									))}
																								</select>
																							</div>
																						</div>

																					</div>
																				</div>

																				<div className="col-6 col-md-2">
																					<div className="container2">
																						<div className="row justify-content-md-center">
																							<div className="form-group">
																								<label for="exampleInputEmail1" className="form-label">Type</label>
																								<select className="form-select" aria-label="Default select example" onChange={this.onChange} name="type" value={this.state.type}>
																									<option selected value="">All</option>
																									<option selected value="1">Withdraw</option>
																									<option selected value="2">Deposit</option>
																								</select>
																							</div>
																						</div>

																					</div>
																				</div>

																				<div className="col-12 col-md-3 p-0">
																					<div className="btn-div btn-reset-search_12">
																						<button className="btn btn-primary btn-reset mr-3" type="button" onClick={this.resetFilter.bind(this)}>Reset</button>
																						<button className="btn btn-primary btn-submit" type="submit" disabled={this.state.submitBtn}>{(this.state.submitBtn) ? 'Loading...' : 'Search'}</button>
																					</div>
																				</div>
																			</div>
																		</form>
																	</div>

																</div>

																{/* <div role="tabpanel" className="tab-pane" id="btc">
					                               <div className="row">
					                               	<div className="col-12 col-md-2">
				                                		 <div className="mt-3">
													      <label for="exampleInputEmail1" className="form-label">Type</label>
					                                		<select className="form-select" aria-label="Default select example">
															  <option selected>Deposit</option>
															  <option value="1">Cash</option>
															  <option value="1">Withdraw</option>
															</select>
														 </div>
					                                	</div>
					                                	<div className="col-12 col-md-4">
					                                			<div className="container2">
															  <form>
															    <div className="row justify-content-md-center">
															      <div className="col-6">
															        <div className="form-group">
															            <label for="pure-date">Date</label>
															            <div className="input-group mb-4">
															            <div className="input-group-prepend">
															            </div>
															            <input type="date" className="form-control" id="pure-date" aria-describedby="date-design-prepend"/>
															            </div>
															          </div>
															      </div>
															      <div className="col-6">
															          <div className="form-group">
															            <label for="from-date">Date</label>
															            <div className="input-group mb-4 constrained">
															            <div className="input-group-prepend">
															            </div>
															            <input type="date" className="form-control ppDate" id="from-date" aria-describedby="date-design-prepend"/>
															            </div>
															          </div>
															      </div>
                                                                  </div>
															  </form>
															</div>
					                                	</div>
                                                    <div className="col-12 col-md-4"></div>
					                                	<div className="col-12 col-md-2">
					                                		<div className="btn-div">
					                                			<button className="btn btn-primary btn-reset">Reset</button>
						                                		<button className="btn btn-primary btn-submit">Submit</button>
					                                		</div>
					                                	</div>
                                                </div>
					                                	
					                               </div>  
					                   */}
															</div>

														</div>
													</div>
												</div>
												<table className="table table-striped table-responsive-sm">
													<thead>
														<tr>
															<th scope="col">Date</th>
															<th scope="col">Type</th>
															<th scope="col">Coin</th>
															<th scope="col">Amount</th>
															
															<th scope="col">Status</th>
															{/* <th scope="col"></th> */}

														</tr>
													</thead>
													<tbody>
														{this.state.getTxList.length === 0 ? <tr >
															<td className="text-center" colSpan="10">Transaction history not found</td></tr> :

															this.state.getTxList.map(item => (

																<tr>
																	<th scope="row">{(item.datetime.replace('.000Z', '')).replace('T', ' ')}</th>
																	<td>{(item.trx_type_name)}</td>
																	<td>{item.symbol}</td>
																	<td>{(parseFloat(item.amount)).toFixed(6)}</td>
																	
																	<td className={item.status === 1?'crypt-up':'crypt-down'}>{item.status === 1 ? 'Completed' : 'Pending'}</td>
																	{/* <td>05s1f51dv15dfs40d5f1af0sdf2sd1f0s21s</td> */}
																</tr>
															))}
													</tbody>
													{/* </thead> */}
												</table>
												{/* <!-- <div className="no-orders text-center p-160"><img src="images/empty.svg" alt="no-orders"></div> --> */}

											</div>
											<div role="tabpanel" className="tab-pane" id="active-orders">
												<div className="row">
													<div className="col-12 col-md-2">
														<form>
															<div className="mt-3">
																<div className="mt-3">
																	<label for="exampleInputEmail1" className="form-label">Form</label>
																	<select className="form-select" aria-label="Default select example">
																		<option selected>All</option>
																		<option value="1">BTC</option>
																		<option value="1">ETH</option>
																		<option value="3">BCH</option>
																		<option value="3">LTC</option>
																		<option value="3">USDT</option>
																		<option value="3">BNB</option>
																		<option value="3">UNI</option>
																		<option value="3">THETA</option>
																		<option value="3">GRT</option>
																		<option value="3">USDC</option>
																		<option value="3">WBTC</option>
																		<option value="3">BUSD</option>
																		<option value="3">DAI</option>
																		<option value="3">HBTC</option>
																	</select>
																</div>

															</div>
														</form>
														<div className="mt-3">
															<label for="exampleInputEmail1" className="form-label">Status</label>
															<select className="form-select" aria-label="Default select example">
																<option selected>All</option>
																<option value="1">BTC</option>
																<option value="1">ETH</option>
																<option value="3">BCH</option>
																<option value="3">LTC</option>
																<option value="3">USDT</option>
																<option value="3">BNB</option>
																<option value="3">UNI</option>
																<option value="3">THETA</option>
																<option value="3">GRT</option>
																<option value="3">USDC</option>
																<option value="3">WBTC</option>
																<option value="3">BUSD</option>
																<option value="3">DAI</option>
																<option value="3">HBTC</option>
															</select>
														</div>
													</div>
													<div className="col-12 col-md-1">
														<a href="#" className="exchnage-icon"><i className="fas fa-exchange-alt"></i></a>
													</div>
													<div className="col-12 col-md-2">
														<div className="mt-3">
															<label for="exampleInputEmail1" className="form-label">To</label>
															<select className="form-select" aria-label="Default select example">
																<option selected>All</option>
																<option value="1">BTC</option>
																<option value="1">ETH</option>
																<option value="3">BCH</option>
																<option value="3">LTC</option>
																<option value="3">USDT</option>
																<option value="3">BNB</option>
																<option value="3">UNI</option>
																<option value="3">THETA</option>
																<option value="3">GRT</option>
																<option value="3">USDC</option>
																<option value="3">WBTC</option>
																<option value="3">BUSD</option>
																<option value="3">DAI</option>
																<option value="3">HBTC</option>
															</select>
														</div>
													</div>
													<div className="col-12 col-md-4">
														<div className="container2">
															<form>
																<div className="row justify-content-md-center">
																	<div className="col-6">
																		<div className="form-group">
																			<label for="pure-date">Date</label>
																			<div className="input-group mb-4">
																				<div className="input-group-prepend">
																					{/* <!-- <span className="input-group-text">@</span> --> */}
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
																					{/* <!-- <span className="input-group-text">@</span> --> */}
																				</div>
																				<input type="date" className="form-control ppDate" id="from-date" aria-describedby="date-design-prepend" />
																			</div>
																		</div>
																	</div>
																</div>
															</form>
														</div>

													</div>
													<div className="col-12 col-md-3">
														<div className="btn-div">
															<button className="btn btn-primary btn-reset">Reset</button>
															<button className="btn btn-primary btn-submit">Submit</button>
														</div>
													</div>

													{/* </form> */}
												</div>

												<table className="table table-striped table-responsive">
													<thead>
														<tr>
															<th scope="col">Time</th>
															<th scope="col">Buy/sell</th>
															<th scope="col">Price BTC</th>
															<th scope="col">Amount BPS</th>
															<th scope="col">Dealt BPS</th>
															<th scope="col">Operation</th>
														</tr>
													</thead>
												</table>
												<div className="no-orders text-center p-160"><img src="images/empty.svg" alt="no-orders" /></div>
											</div>

											<div role="tabpanel" className="tab-pane" id="balance">
												<div className="row">
													<div className="col-12 col-md-4">
														<div className="container2">
															<form>
																<div className="row justify-content-md-center">
																	<div className="col-6">
																		<div className="form-group">
																			<label for="pure-date">Date</label>
																			<div className="input-group mb-4">
																				<div className="input-group-prepend">
																					{/* <!-- <span className="input-group-text">@</span> --> */}
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
																					{/* <!-- <span className="input-group-text">@</span> --> */}
																				</div>
																				<input type="date" className="form-control ppDate" id="from-date" aria-describedby="date-design-prepend" />
																			</div>
																		</div>
																	</div>
																</div>
															</form>
														</div>

													</div>
													{/* </form> */}

													<div className="col-12 col-md-2">
														<div className="mt-3">
															<label for="exampleInputEmail1" className="form-label">Coin</label>
															<select className="form-select" aria-label="Default select example">
																<option selected>All</option>
																<option value="1">BTC</option>
																<option value="1">ETH</option>
																<option value="3">BCH</option>
																<option value="3">LTC</option>
																<option value="3">USDT</option>
																<option value="3">BNB</option>
																<option value="3">UNI</option>
																<option value="3">THETA</option>
																<option value="3">GRT</option>
																<option value="3">USDC</option>
																<option value="3">WBTC</option>
																<option value="3">BUSD</option>
																<option value="3">DAI</option>
																<option value="3">HBTC</option>
															</select>
														</div>
													</div>
													<div className="col-12 col-md-2">
														<div className="mt-3">
															<label for="exampleInputEmail1" className="form-label">Amount</label>
															<select className="form-select" aria-label="Default select example">
																<option selected>Fiat and Spot</option>
																<option value="1">BTC</option>
																<option value="1">ETH</option>
																<option value="3">BCH</option>
																<option value="3">LTC</option>
																<option value="3">USDT</option>
																<option value="3">BNB</option>
																<option value="3">UNI</option>
																<option value="3">THETA</option>
																<option value="3">GRT</option>
																<option value="3">USDC</option>
																<option value="3">WBTC</option>
																<option value="3">BUSD</option>
																<option value="3">DAI</option>
																<option value="3">HBTC</option>
															</select>
														</div>
													</div>
													<div className="col-12 col-md-2"></div>
													<div className="col-12 col-md-2">
														<div className="btn-div">
															<button className="btn btn-primary btn-reset">Reset</button>
															<button className="btn btn-primary btn-submit">Submit</button>
														</div>
													</div>
												</div>
												<table className="table table-striped table-responsive">
													<thead>
														<tr>
															<th scope="col">Time</th>
															<th scope="col">Coin</th>
															<th scope="col">Amount</th>
															<th scope="col">Amount</th>
															<th scope="col">Time</th>
															<th scope="col">Coin</th>
														</tr>
													</thead>
													<tbody>
														<tr>

														</tr>
													</tbody>
												</table>
												<div className="no-orders text-center p-160"><img src="images/empty.svg" alt="no-orders" /></div>
											</div>

											<div role="tabpanel" className="tab-pane" id="bnb">
												<table className="table table-striped table-responsive">
													<thead>
														<tr>
															<th scope="col">Date</th>
															<th scope="col">Free(BNB)</th>
															<th scope="col">Converted(BNB)</th>
														</tr>
													</thead>
													<tbody>
														<tr>

														</tr>
													</tbody>
												</table>
												<div className="no-orders text-center p-160"><img src="images/empty.svg" alt="no-orders" /></div>
											</div>
										</div>

									</div>
								</div>
							</div>

						</div>
					</div>
				</div>



				<Footer />
				{/* <!-- Modal --> */}
			</>
		)
	}
}