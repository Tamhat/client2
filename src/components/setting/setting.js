import React, { Component } from 'react';
import Header from '../../directives/header'
import Footer from '../../directives/footer'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import axios from 'axios';
import config from '../../config/config'
import WebcamCapture from "../../directives/WebcamCapture";
import imageCompression from 'browser-image-compression';
import Compress from "compress.js";
const headers = {
  'Content-Type': 'application/json'
};

export default class setting extends Component {

  constructor(props) {
    super(props)
    this.state = {
      countrylistData: [],
      webCamon: false,
      pan: '',
      is_laptop: false,
      webcontentlist: {},
      date: '',
      residential_Address: '',
      pin: '',
      city: '',
      country_id: '',
      cityList: [],
      stateList: [],
      state_id: '',
      city_id: '',
      address: '',
      zip_code: '',
      check: '',
      getUserProfile: [],
      getAddress: [],
      formStep: 0,
      userKYC: '',
      image_preview1: '',
      selfiefile: '',
      front_image: '',
      pancard_image: '',
      back_image: '',
      userKYCAddress: '',
      checked: false
    }
    this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
    this.profileKyc = this.profileKyc.bind(this);
    this.addressDetailAPI = this.addressDetailAPI.bind(this);
    this.captureHandler = this.captureHandler.bind(this)

  }

  async componentDidMount() {
    this.getWebContentData()
    this.countryList();
    this.getuserKYC();
    this.getuserKYCAddress();
    const laptop = await navigator.getBattery().then(function (battery) {
      if (battery.charging && battery.chargingTime === 0) {
        //  console.log("I'm a desktop")
        return false
      } else {
        return true
        //   console.log("I'm not a desktop")
      }
    });

    this.setState({ is_laptop: laptop })
  }
  handleChange1 = e => {

    this.setState({
      [e.target.name]: e.target.value
    })
  }


  handleChange2 = e => {

    this.setState({
      formStep: 1
    })
  }

  onChange = e => {
    e.preventDefault()

    this.setState({
      [e.target.name]: e.target.value
    })
    if (e.target.name === 'country_id') {
      this.countryId(e.target.value)
    }
    if (e.target.name === 'state_id') {
      this.stateChange(e.target.value)
    }

  }

  async getWebContentData() {

    let headers = {
      'Authorization': this.loginData?.Token,
      'Content-Type': 'application/json'
    }
    axios.get(`${config.apiUrl}/getwebcontent`, {}, { headers: headers })
      .then(response => {
        if (response.data.success === true) {
          this.setState({
            webcontentlist: response.data.response
          })
        }

        else if (response.data.success === false) {

        }
      })

      .catch(err => {
      })

  }

  createMarkup() {
    return { __html: this.state.webcontentlist.kyc_content };
  }


  async countryList() {
    axios({
      method: 'get',
      url: `${config.apiUrl}/getCountries`,
    }).then(response => {
      if (response.data.success === true) {
        this.setState({
          countrylistData: response.data.response
        })
      }
    })
  }




  countryId(a) {
    axios({
      method: 'post',
      url: `${config.apiUrl}/getStates`,
      //headers: { "Authorization": this.loginData.message },
      data: { 'country_id': a }
    })
      .then((res) => {

        if (res.data.success === true) {
          this.setState({
            stateList: res.data.response
          })
        }
      })

  }

  stateChange(a) {
    axios({
      method: 'post',
      url: `${config.apiUrl}/getCities`,
      //  headers: { "Authorization": this.loginData.message },
      data: { 'state_id': a }
    })
      .then((res) => {
        if (res.data.success === true) {
          this.setState({
            cityList: res.data.response
          })
        }

      })

  }

  getuserKYC = async () => {

    var data = {
      user_id: this.loginData.data.id,
      // "email": this.loginData.data?.user_email,
    }
    await axios({
      method: 'post',
      url: `${config.apiUrl}/getuserkyc`,
      headers: { "Authorization": this.loginData?.Token },
      data: data
    }, { headers })
      .then(result => {
        console.log(result.data.response);
        this.setState({
          userKYC: result.data.response
        })

      }).catch(err => {
        if (err == 'Error: Request failed with status code 403') {
          toast.error('Session expired please re-login')
        }
        console.log(err.response.data?.msg);
      })
  }



  getuserKYCAddress = async () => {

    var data = {
      user_id: this.loginData.data.id,
      // "email": this.loginData?.data?.user_email,
    }
    await axios({
      method: 'post',
      url: `${config.apiUrl}/getuserkycaddress`,
      headers: { "Authorization": this.loginData?.Token },
      data: data
    }, { headers })
      .then(result => {

        this.setState({
          userKYCAddress: result.data.response
        })

      }).catch(err => {
        if (err == 'Error: Request failed with status code 403') {
          toast.error('Session expired please re-login')
        }
        console.log(err.response.data?.msg);
      })
  }



  handleImagePreviewAvatar1 = async (e) => {
    // let image_as_base64 = URL.createObjectURL(e.target.files[0])
    // let image_as_files = e.target.files[0];

    // const fileExtension = e.target.files[0].name.replace(/^.*\./, '');
    // // console.log('fileExtensionfileExtension', fileExtension)

    // if (fileExtension.includes('png', 'jpeg', 'jpg')) {
    //   const options = {
    //     maxSizeMB: 1,
    //     maxWidthOrHeight: 1920,
    //     useWebWorker: true
    //   }
    //   const compressedFile = await imageCompression(image_as_files, options);

    //   this.setState({
    //     image_preview1: image_as_base64,
    //     [e.target.name]: compressedFile,
    //   })
    // } else {
    //   toast.error('Only JPG,JPEG,PNG format support!', {
    //     position: toast.POSITION.TOP_LEFT
    //   });
    //   this.setState({
    //     image_preview1: '',
    //     [e.target.name]: '',
    //   })
    // }


    for (var i = 0; i < e.target.files.length; i++) {
      let file = e.target.files[i];
      // console.log(file);
      if (!file.type.includes('image')) {
        toast.error('Please choose image');
      }
      //  else if (file.size / (1024 * 1024) > 1) {
      //   toast.error('Please choose image of smaller size');
      // }
       else {

        // var reader = new FileReader();

        // reader.onload = function (e) {
        //   var imgid = document.getElementById('blah')
        //   console.log(e.target.result)
        //   imgid.src = e.target.result
        // };

        // reader.readAsDataURL(file);

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
            uploadableFiles.push(new File([file], filename, { type: filetype, lastModified: filelastMod }));
          }
          let img = new Image();
          let obj;
          this.setState({ [e.target.name]: uploadableFiles[0], receipt_name: uploadableFiles[0].name });
          img.onload = () => {
            obj = { width: img.width, height: img.height };

          }
          //   img.src = modFiles[i].prefix + modFiles[i].data;
        });
      }
    }

  }



  async profileKyc(e) {
    e.preventDefault();

    var data = {
      user_id: this.loginData.data.id,
      email: this.loginData.data.user_email,
      pan_details: this.state.pan_details,
      date: this.state.date,
      residential_address: this.state.residential_Address,
      pin: this.state.pin,
      city: this.state.city,
      pancard_image: this.state.pancard_image,
      country_id: this.state.country_id,
      state_id: this.state.state_id,
      city_id: this.state.city_id,
      front_image: this.state.front_image,
      selfiefile: this.state.selfiefile,
      back_image: this.state.back_image,
      identity_type: this.state.identity_type
    }

    let formData = new FormData();
    formData.append('user_id', this.loginData.data.id);
    formData.append('email', data.email);
    formData.append('pan_details', data.pan_details);
    formData.append('date', data.date);
    formData.append('residential_address', data.residential_address);
    formData.append('pin', data.pin);
    formData.append('city', '');
    formData.append('country_id', data.country_id);
    formData.append('state_id', data.state_id);
    formData.append('city_id', data.city_id);
    formData.append('identity_type', data.identity_type);
    formData.append('front_image', this.state.front_image);
    formData.append('back_image', this.state.back_image);
    formData.append('selfiefile', this.state.selfiefile);
    formData.append('pancard_image', this.state.pancard_image)

    if (!data.front_image) {
      toast.error('Please upload identity front image', {
        position: toast.POSITION.TOP_LEFT
      });
    }

    else if (!data.back_image && this.state.identity_type == 'Pancard') {
      toast.error('Please upload identity back image', {
        position: toast.POSITION.TOP_LEFT
      });
    }

    else if (!data.selfiefile) {
      toast.error('Please upload selfie image', {
        position: toast.POSITION.TOP_LEFT
      });
    }

    else if (!data.pancard_image) {
      toast.error('Please upload Pancard image', {
        position: toast.POSITION.TOP_LEFT
      });
    }

    else if (!data.country_id) {
      toast.error('Please Enter Country', {
        position: toast.POSITION.TOP_LEFT
      });
    }

    else if (!data.state_id) {
      toast.error('Please Enter Country State', {
        position: toast.POSITION.TOP_LEFT
      });
    }

    else if (!data.city_id) {
      toast.error('Please Enter Country State City', {
        position: toast.POSITION.TOP_LEFT
      });
    }

    else if (!data.pan_details) {
      toast.error('Please Enter identity number', {
        position: toast.POSITION.TOP_LEFT
      });
    }

    else if (!data.residential_address) {
      toast.error('Please Enter residential Address', {
        position: toast.POSITION.TOP_LEFT
      });
    }

    else if (!data.pin) {
      toast.error('Please Enter pin', {
        position: toast.POSITION.TOP_LEFT
      });
    }

    else if (this.state.checked == false) {
      toast.error('Please click on the check box', {
        position: toast.POSITION.TOP_LEFT
      });
    }
    else {

      await axios({
        method: 'post',
        url: `${config.apiUrl}/getUserProfile`,
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
              window.location.href = `${config.baseUrl}setting`
              // this.props.history.push(`${config.baseUrl}setting`);
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
          console.log(err);

        });
    }
  }




  async addressDetailAPI(e) {
    e.preventDefault();

    var data = {
      user_id: this.loginData.data.id,
      // "email": this.loginData?.data?.user_email,
      country_id: this.state.country_id,
      state_id: this.state.state_id,
      city_id: this.state.city_id,
      address: this.state.address,
      zip_code: this.state.zip_code,
    }


    await axios({
      method: 'post',
      url: `${config.apiUrl}/getUserAddress`,
      headers: { "Authorization": this.loginData?.Token },
      data: data
    }, { headers })
      //
      .then(result => {

        if (result.data.success === true) {

          toast.success(result.data.msg, {
            position: toast.POSITION.TOP_CENTER
          });
          setTimeout(() => {
            this.props.history.push(`${config.baseUrl}setting`);
            // window.location.href = `${config.baseUrl}setting`

          }, 1500);
          this.loginData.data.is_address_verify = 0;
          Cookies.set('loginSuccess', this.loginData, { secure: config.Secure, HttpOnly: config.HttpOnly });

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
        console.log(err);

      });
  }


  captureHandler(data) {
    const { fileImgUrl } = data;
    if (fileImgUrl) {
      this.setState({
        selfiefile: fileImgUrl
      })
    }
  }




  render() {

    return (
      <>
        <div classNameName="main" >
          <br />
          <br />
          <br />
          <br />
          <Header />
          <ToastContainer />
          <section className="basic_info mb-5">
            <div className="container">
              <div className="row" id="Identity">
                <div className="inden_verify">
                  <div className="row">
                    <div className="col-12 ">


                      <h1>Basic Info</h1>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-6">

                </div>

                <div className="row pt-3 pb-3">

                  <div className="col-8 col-md-10">
                    <div className="number_info">
                      <p>
                        <img src="images/user.png" class="user_img m-2" />

                        {this.loginData.data.user_email}</p>
                    </div>
                    <div className="market_info">

                      <p className='ml-5 pl-3'>Last login time: {this.loginData.data.device_date}&nbsp;&nbsp;IP : {this.loginData.data.ip}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </section>

          <section className="basic_info mb-5">
            <div className="container">
              <div className="row" id="Identity">
                <div className="inden_verify">
                  <div className="row">
                    <div className="col-12 col-md-6 ">


                      <h1>Identity Verification</h1>
                    </div>

                    <div className="col-6 col-md-6">

                    </div>

                  </div>
                </div>
                <div className="row w-100 mt-5 pb-4">
                  <div className="col-12 col-md-6 pl-4">
                    <h1 className="pl-2"><img src="images/user.png" className="user_img" />&nbsp;&nbsp;Personal details</h1>
                    <p className="ml-4">Why verify your identity?</p>
                    <ul>
                      <li>  <div dangerouslySetInnerHTML={this.createMarkup()} /></li>

                    </ul>
                  </div>

                  <div className="col-12 col-md-6">

                    {this.state.userKYC.is_kyc_verify === "0" ?
                      <button type="button" className="swtich_btn" >Wait for Approval</button>
                      :
                      this.state.userKYC.is_kyc_verify === "1" ?
                        <button type="button" className="swtich_btn" >Approved</button>
                        :
                        this.state.userKYC.is_kyc_verify === "2" ?

                          <button type="button" className="swtich_btn" data-toggle="modal" onClick={e => this.setState({ webCamon: true })} data-target="#exampleModals">Verify</button>
                          : <button type="button" className="swtich_btn" data-toggle="modal" data-target="#exampleModals">Verify</button>


                    }





                    <div className="modal fade" id="exampleModals" tabindex="-1" aria-labelledby="exampleModalLabels" aria-hidden="true">

                      <div className="steps" >
                        <div className="row">

                          <div className="col-12">
                            <div className="modal-dialog modal-dialog-centered" id="personal_model">
                              <div className="modal-content" >
                                <div className="modal-header">
                                  <h5 className="modal-title text-center" id="exampleModalLabels">Select your country / region</h5>
                                  <button type="button" className="close" data-dismiss="modal" onClick={e => this.setState({ webCamon: false })} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                  </button>
                                </div>
                                <div className="modal-body">
                                  <h6>Residential country/region:</h6>
                                  <p style={{ textAlign: 'left', padding: '0px' }}>Cannot find your country/region?</p>
                                  <div className="wrapper">
                                    <dl id="country-select" className="dropdown">

                                      <dl id="country-select" className="dropdown">

                                        <dd>
                                          <select name="country_id" onChange={this.onChange} value={this.state.country_id} class="form-control" style={{ display: "block" }}>
                                            <option selected="selected" value="">Select Country</option>
                                            {this.state.countrylistData.map(item => (
                                              <option value={item.id}>{item.name}</option>
                                            ))}
                                          </select>

                                        </dd>
                                      </dl>

                                      <dl id="country-select" className="dropdown">

                                        <dd>
                                          <select name="state_id" onChange={this.onChange} value={this.state.state_id} class="form-control" style={{ display: "block" }}>
                                            <option selected="selected" value="">Select State</option>
                                            {this.state.stateList.map(item => (
                                              <option value={item.id}>{item.name}</option>
                                            ))}
                                          </select>

                                        </dd>
                                      </dl>


                                      <dl id="country-select" className="dropdown">

                                        <dd>
                                          <select name="city_id" onChange={this.onChange} value={this.state.city_id} class="form-control" style={{ display: "block" }}>
                                            <option selected="selected" value="">Select City</option>
                                            {this.state.cityList.map(item => (
                                              <option value={item.id}>{item.name}</option>
                                            ))}
                                          </select>

                                        </dd>
                                      </dl>

                                    </dl>

                                    <div className="infos">
                                      <div className="form-group">
                                        <label for="pure-date">Identity proof (Pan-Card)</label>
                                        <div className="input-group mb-4">
                                          <div className="input-group-prepend">

                                          </div>
                                          <input type="file" name='pancard_image' accept="image/png, image/jpg, image/jpeg" onChange={this.handleImagePreviewAvatar1} className="form-control" aria-describedby="date-design-prepend" />
                                        </div>
                                      </div>
                                    </div>

                                    <label style={{ color: '#fff' }} for="pure-date">Select Identity (Address Proof)</label>
                                    <dl id="country-select" className="dropdown">

                                      <dd>
                                        <select name="identity_type" onChange={this.handleChange1} value={this.state.identity_type} class="form-control" style={{ display: "block" }}>
                                          <option selected="selected" value="">Select Identity</option>
                                          <option value='Aadhar'>Aadhar Card</option>
                                          <option value='Passport'>Passport</option>
                                          <option value='Driving-Licence'>Driving Licence</option>
                                          <option value='Voter-ID'>Voter Card</option>
                                        </select>
                                        <ul style={{ display: 'none' }}>
                                          <form>
                                            <input type="search" name="text" placeholder="search" className="search_box" />
                                          </form>
                                        </ul>
                                      </dd>
                                    </dl>

                                    <div className="infos">
                                      <div className="form-group">
                                        <label for="pure-date">Identity Number (Pan-Card)</label>
                                        <div className="input-group mb-4">
                                          <div className="input-group-prepend">

                                          </div>
                                          <input type="text" className="form-control" name="pan_details" onChange={this.handleChange1} value={this.state.pan_details} aria-describedby="date-design-prepend" />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="infos">
                                      <div className="form-group">
                                        <label for="pure-date">Address proof (Front Image)</label>
                                        <div className="input-group mb-4">
                                          <div className="input-group-prepend">
                                          </div>
                                          <input type="file" name='front_image' accept="image/png, image/jpg, image/jpeg" onChange={this.handleImagePreviewAvatar1} className="form-control" aria-describedby="date-design-prepend" />
                                        </div>
                                      </div>
                                    </div>

                                    <div className="infos">
                                      <div className="form-group">
                                        <label for="pure-date">Address proof (Back Image)</label>
                                        <div className="input-group mb-4">
                                          <div className="input-group-prepend">
                                          </div>
                                          <input type="file" name='back_image' accept="image/png, image/jpg, image/jpeg" onChange={this.handleImagePreviewAvatar1} className="form-control" aria-describedby="date-design-prepend" />
                                        </div>
                                      </div>
                                    </div>

                                    {this.state.is_laptop == true && this.state.webCamon == true ?
                                      <div className="infos">
                                        <div className="form-group">
                                          <label for="pure-date">Identity Selfie Image</label>
                                          <div className="input-group mb-4">
                                            <div className="input-group-prepend">
                                            </div>
                                            <WebcamCapture onCapture={this.captureHandler} />
                                          </div>
                                        </div>
                                      </div> :
                                      <div className="infos">
                                        <div className="form-group">
                                          <label for="pure-date">Identity Selfie Image</label>
                                          <div className="input-group mb-4">
                                            <div className="input-group-prepend">
                                            </div>
                                            <input type="file" name='selfiefile' accept="image/png, image/jpg, image/jpeg" onChange={this.handleImagePreviewAvatar1} className="form-control" aria-describedby="date-design-prepend" />
                                          </div>
                                        </div>
                                      </div>}

                                    <div className="infos">
                                      <div className="form-group">
                                        <label for="pure-date">Email</label>
                                        <div className="input-group mb-4">
                                          <div className="input-group-prepend">

                                          </div>
                                          <input type="email" value={this.loginData.data.user_email} className="form-control" aria-describedby="date-design-prepend" />
                                        </div>
                                      </div>

                                    </div>
                                    <div className="infos">
                                      <div className="form-group">
                                        <label for="pure-date">Residential Address</label>
                                        <div className="input-group mb-4">
                                          <div className="input-group-prepend">

                                          </div>
                                          <input type="text" className="form-control" name="residential_Address" onChange={this.handleChange1} value={this.state.residential_Address} aria-describedby="date-design-prepend" />
                                        </div>
                                      </div>
                                      <div className="form-group">
                                        <div className="row">
                                          <div className="col-6 col-md-6 pt-0">
                                            <label for="pure-date">Pin</label>
                                            <div className="input-group mb-4">
                                              <div className="input-group-prepend">

                                              </div>
                                              <input type="number" className="form-control" name="pin" onChange={this.handleChange1} value={this.state.pin} aria-describedby="date-design-prepend" />
                                            </div>
                                          </div>

                                        </div>
                                      </div>
                                      <div className="form-check">
                                        <input className="form-check-input" type="checkbox" checked={this.state.checked} onChange={e => this.setState({ checked: this.state.checked ? false : true })} id="flexCheckDefault" required />
                                        <label className="form-check-label" for="flexCheckDefault">
                                          By clicking this button I confirm that I am authorised to provide the personal details presented and I consent to my information being checked with the document issuer or official record holder via third party systems for the purpose of confirming my identity.
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="modal-footer">

                                  <button type="button" disabled={!this.state.country_id && !this.state.pan && !this.state.date && !this.state.residential_Address && !this.state.pin && !this.state.city && !this.state.check && !this.state.identity_type} onClick={this.profileKyc} className="btnNext btn btn-outline-success">Confirm</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* </form> */}

                    </div>
                  </div>

                </div>
              </div>
            </div>
          </section>



          {/* Addresss */}

          <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
              <div class="modal-content">

                <div class="modal-body">
                  <div className="modal-content" >
                    <div className="modal-header">
                      <h5 className="modal-title text-center" id="exampleModalLabels">Select your country / region</h5>
                      <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <h6>Residential country/region:</h6>
                      <p style={{ textAlign: 'left', padding: '0px' }}>Cannot find your country/region?</p>
                      <div className="wrapper">
                        <dl id="country-select" className="dropdown">

                          <dd>
                            <select name="country_id" onChange={this.onChange} value={this.state.country_id} class="form-control" style={{ display: "block" }}>
                              <option selected="selected" value="">Select Country</option>
                              {this.state.countrylistData.map(item => (
                                <option value={item.id}>{item.name}</option>
                              ))}
                            </select>

                          </dd>
                        </dl>

                        <dl id="country-select" className="dropdown">

                          <dd>
                            <select name="state_id" onChange={this.onChange} value={this.state.state_id} class="form-control" style={{ display: "block" }}>
                              <option selected="selected" value="">Select State</option>
                              {this.state.stateList.map(item => (
                                <option value={item.id}>{item.name}</option>
                              ))}
                            </select>

                          </dd>
                        </dl>

                        <dl id="country-select" className="dropdown">

                          <dd>
                            <select name="city_id" onChange={this.onChange} value={this.state.city_id} class="form-control" style={{ display: "block" }}>
                              <option selected="selected" value="">Select City</option>
                              {this.state.cityList.map(item => (
                                <option value={item.id}>{item.name}</option>
                              ))}
                            </select>

                          </dd>
                        </dl>


                        <div className="infos">
                          <div className="form-group">
                            <label for="pure-date">Residential Address</label>
                            <div className="input-group mb-4">
                              <div className="input-group-prepend">

                              </div>
                              <input type="text" className="form-control" name="address" onChange={this.handleChange1} value={this.state.address} aria-describedby="date-design-prepend" />
                            </div>
                          </div>
                          <div className="form-group">
                            <div className="row">
                              <div className="col-6 col-md-6 pb-0">
                                <label for="pure-date">Zip Code</label>
                                <div className="input-group mb-4">
                                  <div className="input-group-prepend">

                                  </div>
                                  <input type="text" className="form-control" name="zip_code" onChange={this.handleChange1} value={this.state.zip_code} aria-describedby="date-design-prepend" />
                                </div>
                              </div>

                            </div>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="flexCheckDefault" value={this.state.check} required={true} />
                            <label className="form-check-label" for="flexCheckDefault">
                              By clicking this button I confirm that I am authorised to provide the personal details presented and I consent to my information being checked with the document issuer or official record holder via third party systems for the purpose of confirming my identity.
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">

                      <button type="button" onClick={this.addressDetailAPI} disabled={!this.state.country_id && !this.state.state_id && !this.state.city_id && !this.state.address && !this.state.zip_code && !this.state.check} className="btnNext btn btn-outline-success">Confirm</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    )
  }
}