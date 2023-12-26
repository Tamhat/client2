import React, { Component } from 'react';
import Header from './directives/header'
import axios from 'axios';
import config from './config/config'
import Cookies from 'js-cookie';
import { Link, Redirect } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import Footer from './directives/footer'
import copy from "copy-to-clipboard";
import Compressor from 'compressorjs';
import imageCompression from 'browser-image-compression';
import Compress from "compress.js";
const headers = {
    'Content-Type': 'application/json'
};
const modalcustomStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

export default class ProfileEdit extends Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef(null)
        this.state = {
            username: '',
            phonechange: false,
            phone: '',
            country: '',
            email: '',
            profile_pic: '',
            profile_pic_name: '',
            authModelOpen: false,
            passmodelOpen:false,
            sms_otp: '',
            password:'',
            profile_image: '',
            currentCount: 60,
            intervalId: '',
            getCountriesList: [],
        };
        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
        this.handleSubmit = this.handleSubmit.bind(this)
    }


    componentDidMount() {
        this.getCountries();
        this.getProfile()
    }

    timerreverse = () => this.setState({ currentCount: (this.state.currentCount - 1) });


    async getProfile() {

        await axios({
            method: 'post',
            url: `${config.apiUrl}/getProfileData`,
            headers: { "Authorization": this.loginData?.Token },
            data: { 'user_id': this.loginData.data?.id, email: this.loginData?.data.user_email }
        })
            .then(result => {

                if (result.data.success === true) {
                    this.setState({
                        username: result.data.response.username,
                        referral_code: result.data.response.referral_code,
                        phone: result.data.response.phone,
                        email: result.data.response.email,
                        profile_image: result.data.response.profile_image
                    })
                }
            })
            .catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                }
                this.setState({
                    getCountriesList: [],
                })

            })
    }


    async getCountries() {
        var ab = JSON.parse(Cookies.get('loginSuccess'))
        await axios({
            method: 'get',
            url: `${config.apiUrl}/getcountries`,
            headers: { "Authorization": this.loginData?.Token },
            //  data: { 'user_id': this.loginData.data?.id }
        })
            .then(result => {

                if (result.data.success === true) {

                    this.setState({
                        getCountriesList: result.data.response,

                    })
                }
            })
            .catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                }
                this.setState({
                    getCountriesList: [],
                })

            })

    }





    handleChange = e => {
        // console.log(e.target.value, e.target.name)
        const re = /^[+-]?([+,0-9]+\.?[+,0-9]*|\.[+,0-9]+)$/;

        if (e.target.name == 'phone' && (re.test(e.target.value) || e.target.value == '')) {
            this.setState((old) => {
                return { ...old, [e.target.name]: e.target.value, ['phonechange']: true }
            })
        } else if (e.target.name != 'phone') {
            this.setState((old) => {
                return { ...old, [e.target.name]: e.target.value }
            })
        }

    }

    onImageChange = e => {
        e.preventDefault();
      

      // Getting multiple images from user's selection
        for (var i = 0; i < e.target.files.length; i++) {
         let file = e.target.files[i];
         // console.log(file);
         if(!file.type.includes('image')) {
            toast.error('Please choose image');
         } 
        //  else if(file.size / (1024*1024) > 1) {
        //     toast.error('Please choose image of smaller size');
        //  } 
         else{
            
            var reader = new FileReader();
    
            reader.onload = function (e) {
                var imgid = document.getElementById('blah')
                console.log(e.target.result)
                imgid.src = e.target.result
            };
    
            reader.readAsDataURL(file);
         }
        }
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
          console.log('uploadableFiles',uploadableFiles)
          this.setState({ 'profile_pic': uploadableFiles[0] });
        //   img.onload = () => {
        //    obj = { width: img.width, height: img.height };
         
        //   }
        //   img.src = modFiles[i].prefix + modFiles[i].data;
        });
       }

    // onImageChange = async (e) => {
    //     var file = e.target.files[0]
    //     console.log(file.type.indexOf("image"))

    //     if (file && file.type.indexOf("image") > -1) {
    //         const options = {
    //             maxSizeMB: 1,
    //             maxWidthOrHeight: 1920,
    //             useWebWorker: true
    //         }
    //         const compressedFile = await imageCompression(file, options);
    //         this.setState({ 'profile_pic': compressedFile })
    //         var reader = new FileReader();

    //         reader.onload = function (e) {
    //             var imgid = document.getElementById('blah')
    //             console.log(e.target.result)
    //             imgid.src = e.target.result
    //         };

    //         reader.readAsDataURL(file);
    //     } else {
    //         toast.error('Please Select image file', {
    //             position: toast.POSITION.TOP_CENTER
    //         });
    //     }

    // }


    ModelOpenFun(e, type) {
        e.preventDefault()
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }
        axios.post(`${config.apiUrl}/withdrawAuthentication`, { email: this.loginData.data?.user_email, 'user_id': this.loginData.data?.id, type: 'send_otp', phonechange: this.state.phonechange,phone:this.state.phone }, { headers: headers })
            .then(async result => {

                if (result.data.success === true) {
                    this.setState({ passmodelOpen: true })

                    if (type == 'resend') {
                        this.setState({
                            email_success_msg: 'We have resend varification code on your e-mail please check!!',
                            email_err_msg: ''
                        })
                    } else {
                        this.setState({
                            email_success_msg: result.data.msg,
                            email_err_msg: ''
                        })
                    }

                } else if (result.data.success == false) {
                    toast.error(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                    this.setState({ email_err_msg: result.data.msg, email_success_msg: '' })
                    // email_success_msg
                }

            }).catch(err => {

                if (err == 'Error: Request failed with status code 403') {
                    toast.error("session expired please re-login", {
                        position: toast.POSITION.TOP_CENTER
                    });
                }else {
                    console.log(err)
                    toast.error(err.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                }

            })
       
    }

    async finalSubmitEmail(e) {
        e.preventDefault()
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }

        axios.post(`${config.apiUrl}/withdrawAuthentication`, { email: this.loginData.data?.user_email, 'user_id': this.loginData.data?.id, email_otp: this.state.email_otp, type: 'check_otp' }, { headers: headers })
            .then(async result => {

                if (result.data.success === true) {

                    this.setState({ email_err_msg: result.data.msg, email_success_msg: '', passmodelOpen:false})

                    this.setState({ passmodelOpen: false })
                    this.sendAuthentication(e)
                } else if (result.data.success == false) {

                    this.setState({ email_err_msg: result.data.msg, email_success_msg: '' })
                    // email_success_msg
                }

            }).catch(err => {

                if (err == 'Error: Request failed with status code 403') {
                    toast.error("session expired please re-login", {
                        position: toast.POSITION.TOP_CENTER
                    });
                } else {
                    console.log(err)
                    toast.error(err.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                }

            })


    }

    confirmPassword(e,type){
        e.preventDefault()
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }
        axios.post(`${config.apiUrl}/confirmPassword`, { email: this.loginData.data?.user_email, 'user_id': this.loginData.data?.id, phone: this.state.phone,password:this.state.password, type: 'send_otp', phonechange: this.state.phonechange }, { headers: headers })
        .then(async result => {
            // console.log('result', result)
            if (result.data.success === true) {
                this.setState({ passmodelOpen: false })
                this.sendAuthentication(e,type)

            } else if (result.data.success == false) {
                console.log('4333434')
                toast.error(result.data.msg, {
                    position: toast.POSITION.TOP_CENTER
                });
                this.setState({ email_err_msg: result.data.msg, email_success_msg: '' })
                // email_success_msg
            }

        }).catch(err => {
            console.log('caa', err)

            if (err == 'Error: Request failed with status code 403') {
                toast.error("session expired please re-login", {
                    position: toast.POSITION.TOP_CENTER
                });
            }

        }) 
    }

    
    

    async sendAuthentication(e,type){
        e.preventDefault()
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }
        axios.post(`${config.apiUrl}/updateProfileAuthentication`, { email: this.loginData.data?.user_email, 'user_id': this.loginData.data?.id, phone: this.state.phone, type: 'send_otp', phonechange: this.state.phonechange }, { headers: headers })
        .then(async result => {
            console.log('result', result)
            if (result.data.success === true) {

                this.setState({ authModelOpen: true })

                if (type == 'resend') {
                    this.setState({
                        email_success_msg: 'We have resend varification code on your contact please check!!',
                        email_err_msg: ''
                    })
                } else {
                    this.setState({
                        email_success_msg: result.data.msg,
                        email_err_msg: ''
                    })
                }

                setTimeout(() => {
                    clearInterval(this.state.intervalId);
                    this.setState({ currentCount: 60 })
                }, 1000 * 60);

                const intervalId = setInterval(() => {
                    this.setState(prevState => {
                        return {
                            currentCount: prevState.currentCount - 1,
                        };
                    });

                }, 1000);

                this.setState({ intervalId: intervalId })

            } else if (result.data.success == false) {
                console.log('4333434')
                toast.error(result.data.msg, {
                    position: toast.POSITION.TOP_CENTER
                });
                this.setState({ email_err_msg: result.data.msg, email_success_msg: '' })
                // email_success_msg
            }

        }).catch(err => {
            console.log('caa', err)

            if (err == 'Error: Request failed with status code 403') {
                toast.error("session expired please re-login", {
                    position: toast.POSITION.TOP_CENTER
                });
            }

        })
    }

    async finalSubmit(e) {
        e.preventDefault()
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }

        axios.post(`${config.apiUrl}/updateProfileAuthentication`, { 'user_id': this.loginData.data?.id, email: this.loginData.data?.user_email, phone: this.state.phone, sms_otp: this.state.sms_otp, type: 'check_otp' }, { headers: headers })
            .then(async result => {
                console.log('reee', result)
                if (result.data.success === true) {

                    this.handleSubmit(e)
                } else if (result.data.success == false) {
                    this.setState({ email_err_msg: result.data.msg, email_success_msg: '' })
                    // email_success_msg
                }

            }).catch(err => {

                if (err == 'Error: Request failed with status code 403') {
                    toast.error("session expired please re-login", {
                        position: toast.POSITION.TOP_CENTER
                    });
                } else {
                    console.log(err)
                    toast.error(err.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                }

            })


    }

    handleSubmit = event => {
        let headers = {
            'Authorization': this.loginData?.Token,
            'Content-Type': 'application/json'
        }
        event.preventDefault();
        var formData = new FormData()
        formData.append('email', this.loginData?.data?.user_email)
        formData.append('user_id', this.loginData?.data?.id)
        formData.append('sms_otp', this.state.sms_otp)
        formData.append('email_otp',this.state.email_otp)
        formData.append('profile_pic', this.state.profile_pic)
        formData.append('username', this.state.username)
        formData.append('phonechange',this.state.phonechange)
        formData.append('phone', this.state.phonechange == true ? this.state.phone : '')

        axios.post(`${config.apiUrl}/updateuserprofile`, formData, { headers: headers })
            .then(result => {
                console.log(result.data.success)
                if (result.data.success == true) {
                    this.setState({ authModelOpen: false, sms_otp: '' })
                    toast.success(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                    setTimeout(() => {
                        window.location.reload()
                    }, 2000);


                }
                else if (result.data.success == false) {

                    toast.error(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });

                }
            }).catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                } else {
                    console.log(err);
                    toast.error(err.response.data?.msg, {
                        position: toast.POSITION.TOP_CENTER

                    }, setTimeout(() => {

                    }, 500));
                }

            })
    }


    addBank() {
        this.props.history.push(`${config.baseUrl}bankDetails`);
        // window.location.href = `${config.baseUrl}bankDetails`
    }

    copyToClipboard(e) {
        copy(this.state.referral_code);
        alert(`You have copied "${this.state.referral_code}"`);
    }

    render() {


        return (
            <>
                {/* <!-- Main Content --> */}
                <Header />
                <ToastContainer />
                <section style={{ marginTop: "70px" }}>
                    <div className="container">
                        <div className="row">
                            <div className='col-6 col-sm-6 pl-0 pr-0  col-lg-6'>
                                <h1 className="History headerMargin">Profile Edit</h1>
                            </div>
                            <div className='col-6 col-sm-6 pl-0 pr-0  col-lg-6'>
                                <button className='swtich_btn mt-5' onClick={e => this.addBank(e)}>Add Bank</button>
                            </div>
                            <div className="col-12 col-sm-12 pl-0 pr-0 col-md-12">
                                <div className="crypt-market-status mt-4">
                                    <div className="row">
                                        <div className="col-12 col-lg-4">
                                            <img id="blah" src={`${this.state.profile_image == "" ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8dXNlcnxlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&w=1000&q=80" : config.imageUrl + this.state.profile_image}`} className="user_images" />
                                            <span><input type="file" id='editprofileid' accept=".jpg,.png" onChange={e => this.onImageChange(e)} className="form-control" /><img src="images/photo.png" className="edit-photo" />
                                            </span>
                                        </div>
                                        <div className='col-12 col-lg-7'>

                                            <form onSubmit={e => this.state.phonechange == false ? this.handleSubmit(e) : this.ModelOpenFun(e,'send')} className="text-left">
                                                <div className="col-12 col-lg-12">
                                                    <div className='row'>
                                                        <div className='col-sm-12'>
                                                            <div className="input_custom">
                                                                <label>Email Address</label>
                                                                <input type="email" name="email" disabled placeholder="Enter Email Address" className="custom_input" onChange={e => this.handleChange(e)} value={this.state.email} />
                                                            </div>
                                                        </div>
                                                    </div>


                                                    <div className="row">
                                                        <div className="col-12 col-md-6" style={{ padding: "12px" }}>
                                                            <div className="input_custom">
                                                                <label>User Name</label>
                                                                <input type="text" name="username" placeholder="Enter User Name" className="custom_input" onChange={e => this.handleChange(e)} value={this.state.username} />
                                                            </div>
                                                        </div>

                                                        <div className="col-12 col-md-6" style={{ padding: "12px" }}>
                                                            <div className="input_custom">
                                                                <label>Phone Number</label>
                                                                <input type="text" name="phone" placeholder="Enter Phone Number" className="custom_input" onChange={e => this.handleChange(e)} value={this.state.phone} />
                                                            </div>
                                                        </div>

                                                    </div>

                                                    <div className="input_custom mb-2">
                                                        <label></label>
                                                        <input type="submit" value="SAVE TO CHANGE" className="crypt-button-red-full col-sm-6" />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div>

                                            <Modal
                                                isOpen={this.state.authModelOpen}
                                                // onAfterOpen={afterOpenModal}
                                                onRequestClose={e => this.setState({ authModelOpen: false })}
                                                style={modalcustomStyles}
                                                contentLabel="Example Modal"
                                            >
                                                <div class="modal-content" style={{ backgroundColor: '#242e3e' }}>
                                                    <div class="modal-header">
                                                        <h5 class="modal-title" id="exampleModalLongTitle">Phone Verification</h5>
                                                        <button type="button" style={{ color: 'rgb(39 105 128)' }} class="close" onClick={e => this.setState({ authModelOpen: false, sms_otp: '',email_otp:'',email_err_msg:'',email_success_msg:'' })} data-dismiss="modal" aria-label="Close">
                                                            <span aria-hidden="true">&times;</span>
                                                        </button>
                                                    </div>
                                                    <div class="table-responsive pl-5 pr-5">
                                                        <form className="text-left" onSubmit={e => this.finalSubmit(e)}>
                                                            <label for="email">Enter Code</label>
                                                            <input type="text" id="email" name="sms_otp" placeholder="Your Code" onChange={e => this.handleChange(e)} value={this.state.sms_otp} />
                                                            <p style={{ textAlign: 'left', color: 'rgb(218 150 0)' }}   >{this.state.email_success_msg} </p>
                                                            <p style={{ textAlign: 'left', color: 'red' }}>{this.state.email_err_msg}</p>
                                                            {this.state.currentCount == 60 ?
                                                                <span onClick={e => this.authModelOpen(e, 'resend')} id="resend_otp"   >Resend Code</span>
                                                                :
                                                                <span disabled id="resend_otp"   >Please Wait : {this.state.currentCount}</span>
                                                            }
                                                            <input type="submit" disabled={!this.state.sms_otp} value="Submit" className="crypt-button-red-full" />
                                                        </form>
                                                    </div>
                                                    <div class="modal-footer">
                                                    </div>
                                                </div>
                                            </Modal>
                                            <Modal
                                                isOpen={this.state.passmodelOpen}
                                                // onAfterOpen={afterOpenModal}
                                                onRequestClose={e => this.setState({ passmodelOpen: false })}
                                                style={modalcustomStyles}
                                                contentLabel="Example Modal"
                                            >
                                                {/* <div class="modal-content" style={{ backgroundColor: '#242e3e' }}>
                                                    <div class="modal-header">
                                                        <h5 class="modal-title" id="exampleModalLongTitle">Password Verification</h5>
                                                        <button type="button" style={{ color: 'rgb(39 105 128)' }} class="close" onClick={e => this.setState({ passmodelOpen: false, sms_otp: '' })} data-dismiss="modal" aria-label="Close">
                                                            <span aria-hidden="true">&times;</span>
                                                        </button>
                                                    </div>
                                                    <div class="table-responsive pl-5 pr-5">
                                                        <form className="text-left" onSubmit={e => this.confirmPassword(e)}>
                                                            <label for="email">Enter Password</label>
                                                            <input type="password" id="email" name="password" placeholder="Your Id Password" onChange={e => this.handleChange(e)} value={this.state.password} />
                                                            <p style={{ textAlign: 'left', color: 'rgb(218 150 0)' }}   >{this.state.email_success_msg} </p>
                                                            <p style={{ textAlign: 'left', color: 'red' }}>{this.state.email_err_msg}</p>
                                                            
                                                            <input type="submit" disabled={!this.state.password} value="Submit" className="crypt-button-red-full" />
                                                        </form>
                                                    </div>
                                                    <div class="modal-footer">
                                                    </div>
                                                </div> */}
                                                  <div class="modal-content" style={{ backgroundColor: '#242e3e' }}>
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="exampleModalLongTitle">Email Verification</h5>
                                                    <button type="button" style={{ color: 'rgb(42 118 135)' }} class="close" onClick={e => this.setState({ passmodelOpen: false,email_otp:'',email_success_msg:'',email_err_msg:'' })} data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="table-responsive pl-5 pr-5">
                                                    <form className="text-left">
                                                        <label for="email">Enter Code</label>
                                                        <input type="text" id="email" name="email_otp" placeholder="Your Code" onChange={e => this.handleChange(e)} value={this.state.email_otp} />
                                                        <p style={{ textAlign: 'left', color: 'rgb(218 150 1)' }}   >{this.state.email_success_msg} </p>
                                                        <p style={{ textAlign: 'left', color: 'red' }}>{this.state.email_err_msg}</p>
                                                        <span onClick={e => this.ModelOpenFun(e, 'resend')} id="resend_otp"   >Resend  Code</span>
                                                        <input type="submit" onClick={e => this.finalSubmitEmail(e)} disabled={!this.state.email_otp} value="Submit" className="crypt-button-red-full" />
                                                    </form>
                                                </div>
                                                <div class="modal-footer">


                                                </div>
                                            </div>
                                            </Modal>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </section>
                <Footer />


            </>

        )
    }
}
