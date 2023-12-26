import React, { Component } from 'react';
import axios from 'axios';
import config from './../config/config'
import { Link, Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from './../directives/header';
import Footer from './../directives/footer';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import copy from 'copy-to-clipboard';
import moment from 'moment'
import Websocket from 'react-websocket';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import imageCompression from 'browser-image-compression';
import 'react-tabs/style/react-tabs.css';
import Compress from "compress.js";
var QRCode = require('qrcode.react');

const headers = {
    'Content-Type': 'application/json'
};

export default class coinLIst extends Component {

    constructor(props) {
        super(props);
        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
        this.state = {
            CoinList: [],
            coin_name: '',
            eth_contract: '',
            bnb_contract: '',
            trc_contract: '',
            coin_symbol: '',
            coin_icon: '',
            explorer_link: '',
            coingecko_link: "",
            touchmanagertype: '',
            Presale: '',
            touchmanagername: '',
            statements: '',
            useful_link: ''

        }
        this.getCoinLIst = this.getCoinLIst.bind(this);
    }

    componentDidMount() {
        if (!Cookies.get('loginSuccess')) {
            window.location.href = `${config.baseUrl}login`
            return false;
        }
        this.getCoinLIst()
    }

    async getCoinLIst() {
        const response = await axios.get(`${config.apiUrl}/admincoinlist`)
        if (response.data.success == true) {
            for (let x in response.data.response) {
                let ids = response.data.response[x].user_ids
                console.log('idss', ids)
                if (ids && ids !== "NULL") {
                    ids = ids.split(",").map(Number)
                    let arraydata = ids
                    console.log('arraydata', arraydata, ids)
                    if (arraydata && arraydata.length > 0) {
                        let filteredArray = response?.data?.response.filter((element) => element.user_ids != null && (element.user_ids).split(",").map(Number).some((subElement) => subElement == this.loginData?.data?.id));
                        console.log('filteredArray', filteredArray)
                        this.setState({ CoinList: filteredArray })
                    }
                }

            }


        }
    }
    async addCoin(e) {
        e.preventDefault();
        let formData = new FormData();
        formData.append('coin_name', this.state.coin_name);
        formData.append('coin_icon', this.state.coin_icon);
        formData.append('coin_symbol', this.state.coin_symbol);
        formData.append('email', this.loginData.data.user_email);
        formData.append('explorer_link', this.state.explorer_link)
        formData.append('coingecko_link', this.state.coingecko_link)
        formData.append('Presale', this.state.Presale)
        formData.append('touchmanagername', this.state.touchmanagername)
        formData.append('statements', this.state.statements)
        formData.append('useful_link', this.state.useful_link)
        formData.append('project_name', this.state.project_name);
        formData.append('coin_ticker', this.state.coin_ticker);
        formData.append('type', this.state.type);
        formData.append('website', this.loginData.data.user_email);
        formData.append('position', this.state.position);
        formData.append('whitepaper', this.state.whitepaper);


        formData.append('eth_contract', this.state.eth_contract);
        formData.append('bnb_contract', this.state.bnb_contract);
        formData.append('trc_contract', this.state.trc_contract);

        formData.append('user_id', this.loginData.data.id)
        if (!this.state.coin_name) {
            toast.error('Please add coin name', {
                position: toast.POSITION.TOP_LEFT
            });
        }

        else if (!this.state.coin_symbol) {
            toast.error('Please add coin symbol', {
                position: toast.POSITION.TOP_LEFT
            });
        }

        else if (!this.state.coin_icon) {
            toast.error('Please upload coin icon', {
                position: toast.POSITION.TOP_LEFT
            });
        }

        else if (!this.state.project_name) {
            toast.error('Please add project_name', {
                position: toast.POSITION.TOP_LEFT
            });
        }
        else if (!this.state.coin_ticker) {
            toast.error('Please add coin_ticker', {
                position: toast.POSITION.TOP_LEFT
            });
        }
        else if (!this.state.type) {
            toast.error('Please add  coin/token type', {
                position: toast.POSITION.TOP_LEFT
            });
        }
        else if (!this.state.website) {
            toast.error('Please add website url', {
                position: toast.POSITION.TOP_LEFT
            });
        }
        else if (!this.state.position) {
            toast.error('Please add your position', {
                position: toast.POSITION.TOP_LEFT
            });
        }
        else if (!this.state.whitepaper) {
            toast.error('Please add whitepaper link', {
                position: toast.POSITION.TOP_LEFT
            });
        }

        else if (!this.state.eth_contract && !this.state.bnb_contract && !this.state.trc_contract) {
            toast.error('Please Add Any One Contract Address', {
                position: toast.POSITION.TOP_LEFT
            });
        }

        else if (this.state.eth_contract && this.state?.eth_contract.length != 42) {
            toast.error('Ethereum Contract length Should be 42', {
                position: toast.POSITION.TOP_LEFT
            });
        }


        else if (this.state.bnb_contract && this.state?.bnb_contract.length != 42) {
            toast.error('Binance Contract length Should be 42', {
                position: toast.POSITION.TOP_LEFT
            });
        }

        else if (this.state.trc_contract && this.state?.trc_contract.length != 34) {
            toast.error('Tron Contract length Should be 34', {
                position: toast.POSITION.TOP_LEFT
            });
        }



        else {

            await axios({
                method: 'post',
                url: `${config.apiUrl}/addcoinDetail`,
                headers: { "Authorization": this.loginData?.Token },
                data: formData
            }, { headers })
                //
                .then(result => {
                    console.log(result.data);
                    if (result.data.success === true) {

                        toast.success(result.data.msg, {
                            position: toast.POSITION.TOP_CENTER
                        });
                        setTimeout(() => {
                            // this.props.history.push(`${config.baseUrl}coinList`);
                            window.location.href = `${config.baseUrl}coinList`

                        }, 1500);

                    }
                    else if (result.data.success === false) {
                        toast.error(result.data.msg, {
                            position: toast.POSITION.TOP_CENTER
                        });
                    }

                }).catch(err => {
                    if (err == 'Error: Request failed with status code 403') {
                        toast.error('Session expired please re-login')
                    }
                    if (err == 'Error: Request failed with status code 409') {
                        toast.error('Symbol already exist!')
                    }
                });
        }
    }

    handleChange = e => {
        if (e.target.name == 'coin_symbol') {
            e.target.value = e.target.value.toUpperCase()
        }
        this.setState({
            [e.target.name]: e.target.value
        })
    }



    handleImagePreviewAvatar1 = async (e) => {
        // let image_as_base64 = URL.createObjectURL(e.target.files[0])
        // let image_as_files = e.target.files[0];

        // if (image_as_files && image_as_files.type.indexOf("image") > -1) {
        //     const options = {
        //         maxSizeMB: 1,
        //         maxWidthOrHeight: 1920,
        //         useWebWorker: true
        //     }
        //     const compressedFile = await imageCompression(image_as_files, options);

        //     this.setState({
        //         image_preview1: image_as_base64,
        //         [e.target.name]: compressedFile,
        //     })
        // } else {
        //     toast.error('Please Select image file', {
        //         position: toast.POSITION.TOP_LEFT
        //     });
        // }

        e.preventDefault();
      

        // Getting multiple images from user's selection
          for (var i = 0; i < e.target.files.length; i++) {
           let file = e.target.files[i];
           // console.log(file);
           if(!file.type.includes('image')) {
              toast.error('Please choose image');
           }
        //     else if(file.size / (1024*1024) > 1) {
        //       toast.error('Please choose image of smaller size');
        //    } 
           else{
              
     
          const compress = new Compress();
          const files = [...e.target.files];
          compress.compress(files, {
           size: 1,
           quality: 0.75,
           maxWidth: 1920,
           maxHeight: 1920,
           resize: true
          }).then(modFiles => {              
        // modFiles are modified files with exif free and compressed       //  versions of user selected images
           let uploadableFiles = [];
         
        
           for (var i = modFiles.length - 1; i >= 0; i--) {
            let file = Compress.convertBase64ToFile(modFiles[i].data, modFiles[i].ext);
            let filename = Date.now() + modFiles[i].alt;
            let filetype = modFiles[i].ext;
            let filelastMod = files[i].lastModified;
            uploadableFiles.push(new File([file], filename, {type: filetype, lastModified: filelastMod}));
           }
            let img = new Image();
            let obj;
            this.setState({ [e.target.name]: uploadableFiles[0] });
            img.onload = () => {
             obj = { width: img.width, height: img.height };
           
            }
          //   img.src = modFiles[i].prefix + modFiles[i].data;
          });
          
        }
    }
    }

    render() {

        return (
            <>
                <Header />

                <ToastContainer />

                <div class="container pt-4">

                    <h1 className="History headerMarginWallet">

                        <div className='row fund_row'>
                            <div className='col-sm-12'>
                                <Tabs>
                                    <TabList>
                                        <div className='row'>
                                            <div className='col-lg-6 col-md-6 mb-3'>


                                                <h4>COIN LIST</h4>
                                            </div>


                                            <div className='col-lg-6 col-md-6 text-right mb-3'>
                                                <div>
                                                    <button type="button" className="swtich_btn" data-toggle="modal" data-target="#exampleModals">Add Coin</button>
                                                </div>
                                            </div>

                                        </div>
                                    </TabList>

                                    <TabPanel>
                                        <div class="container withdraw-history pl-0 pr-0">
                                            <table class="table table-striped table-responsive-sm mt-0">
                                                <thead>
                                                    <tr style={{ paddingBottom: "10" }}>

                                                        <th scope="col">Name</th>
                                                        <th scope="col">Symbol</th>
                                                        <th scope="col">Icon</th>
                                                        <th scope="col">Eth Contract</th>
                                                        <th scope="col">BNB Contract</th>
                                                        <th scope="col">TRX Contract</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.CoinList.map(item => (
                                                        <tr>
                                                            <td>{item.name}</td>
                                                            <td>{item.symbol}</td>
                                                            <td >
                                                                <img src={`${config.imageUrl}${item.icon}`} className="cryto_icons" />
                                                            </td>
                                                            <td>{item.contract ? item.contract : 'NIL'}</td>
                                                            <td>{item.Bnb_contract ? item.Bnb_contract : 'NIL'}</td>
                                                            <td>{item.Trc_contract ? item.Trc_contract : 'NIL'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </TabPanel>

                                </Tabs>

                            </div>

                        </div>

                    </h1>
                </div>

                <div className="modal fade" id="exampleModals" tabindex="-1" aria-labelledby="exampleModalLabels" aria-hidden="true">

                    <div className="steps" >
                        <div className="row">

                            <div className="col-12">
                                <div className="modal-dialog modal-dialog-centered" id="personal_model">
                                    <div className="modal-content" >
                                        <div className="modal-header">
                                            <h5 className="modal-title text-center" id="exampleModalLabels">Add Coin/Token for listing</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">

                                            <div className="wrapper">

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Token/Coin Name</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <input type="text" className="form-control" name="coin_name" onChange={e => this.handleChange(e)} value={this.state.coin_name} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Symbol</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <input type="text" className="form-control" name="coin_symbol" onChange={e => this.handleChange(e)} value={this.state.coin_symbol} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Icon</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">

                                                            </div>
                                                            <input type="file" accept=".jpg,.png" name='coin_icon' onChange={e => this.handleImagePreviewAvatar1(e)} className="form-control" aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Project Name</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">

                                                            </div>
                                                            <input type="text" className="form-control" name="project_name" onChange={e => this.handleChange(e)} value={this.state.project_name} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Token/Coin Ticker</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">

                                                            </div>
                                                            <input type="text" className="form-control" name="coin_ticker" onChange={e => this.handleChange(e)} value={this.state.coin_ticker} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Token Explorer Link</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <input type="text" className="form-control" name="explorer_link" onChange={e => this.handleChange(e)} value={this.state.explorer_link} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">CoinGecko or CoinMarketCap Link</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <input type="text" className="form-control" name="coingecko_link" onChange={e => this.handleChange(e)} value={this.state.coingecko_link} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>



                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">What type of token is it?</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">

                                                            </div>
                                                            <select name="type" onChange={e => this.handleChange(e)} value={this.state.type} class="form-control" style={{ display: "block" }}>
                                                                <option selected="selected" value="">Select Type</option>
                                                                <option value='ERC20'>ERC-20</option>
                                                                <option value='BEP20'>BEP-20</option>
                                                                <option value='TRC20'>TRC-20</option>

                                                            </select>
                                                            {/* <input type="text" className="form-control" name="type" onChange={e => this.handleChange(e)} value={this.state.type} aria-describedby="date-design-prepend" /> */}
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Official Website</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">

                                                            </div>
                                                            <input type="text" className="form-control" name="website" onChange={e => this.handleChange(e)} value={this.state.website} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Your position in the team</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">

                                                            </div>
                                                            <input type="text" className="form-control" name="position" onChange={e => this.handleChange(e)} value={this.state.position} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Whitepaper link</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">

                                                            </div>
                                                            <input type="text" className="form-control" name="whitepaper" onChange={e => this.handleChange(e)} value={this.state.whitepaper} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Do you already in touch with any of our listing managers?</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">

                                                            </div>
                                                            <select name="touchmanagertype" onChange={e => this.handleChange(e)} value={this.state.touchmanagertype} class="form-control" style={{ display: "block" }}>
                                                                <option selected="selected" value="">Select Type</option>
                                                                <option value='0'>No</option>
                                                                <option value='1'>Yes</option>
                                                            </select>

                                                        </div>

                                                        {this.state.touchmanagertype == '1' ? <>
                                                            <label for="pure-date">Name</label>
                                                            <input type="text" className="form-control" name="touchmanagername" onChange={e => this.handleChange(e)} value={this.state.touchmanagername} aria-describedby="date-design-prepend" />
                                                        </> : ""}
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Please select all statements apply to your project</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">

                                                            </div>
                                                            <select name="statements" onChange={e => this.handleChange(e)} value={this.state.statements} class="form-control" style={{ display: "block" }}>
                                                                <option selected="selected" value="">Select Type</option>
                                                                <option value='1'>A company is registered for the project</option>
                                                                <option value='2'>We don't have company, the project is community based</option>
                                                                <option value='3'>We have legal opinion</option>
                                                                <option value='4'>We have audit report</option>
                                                                <option value='5'>Our team is anonymous and not able to provide any personal information</option>
                                                            </select>

                                                        </div>


                                                    </div>
                                                </div>


                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">Did your coin go through an ICO or Presale?</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <select name="Presale" onChange={e => this.handleChange(e)} value={this.state.Presale} class="form-control" style={{ display: "block" }}>
                                                                <option selected="selected" value="">Select Type</option>
                                                                <option value='Yes'>Yes</option>
                                                                <option value='No'>No</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">List core team members, including their background, notable projects, LinkedIn links and any useful links.</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">

                                                            </div>
                                                            <input type="text" className="form-control" name="useful_link" onChange={e => this.handleChange(e)} value={this.state.useful_link} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>



                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">ERC-20 Contract</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <input type="text" className="form-control" name="eth_contract" onChange={e => this.handleChange(e)} value={this.state.eth_contract} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">BEP-20 Contract</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <input type="text" className="form-control" name="bnb_contract" onChange={e => this.handleChange(e)} value={this.state.bnb_contract} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="infos">
                                                    <div className="form-group">
                                                        <label for="pure-date">TRC-20 Contract</label>
                                                        <div className="input-group mb-4">
                                                            <div className="input-group-prepend">
                                                            </div>
                                                            <input type="text" className="form-control" name="trc_contract" onChange={e => this.handleChange(e)} value={this.state.trc_contract} aria-describedby="date-design-prepend" />
                                                        </div>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" onClick={e => this.addCoin(e)} className="btnNext btn btn-outline-success">Confirm</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* </form> */}

                </div>

                <Footer />

            </>
        )
    }
}
