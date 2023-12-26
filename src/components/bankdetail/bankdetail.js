import React, { Component, Fragment } from 'react';
import { render } from 'react-dom';
import ReactDatatable from '@ashvin27/react-datatable';
import Header from '../../directives/header';
import Footer from '../../directives/footer'
import axios from 'axios'
import config from '../../config/config'
import Cookies from 'js-cookie';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import Modal from 'react-modal';
import Compress from "compress.js";
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};
export default class BankDetail extends Component {
    constructor(props) {
        super(props);
        this.loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
        this.columns = [
            {
                key: "bank_name",
                text: "Bank name",
                className: "name",
                align: "left",

            },
            {
                key: "currency",
                text: "Currency",
                className: "name",
                align: "left",
                // sortable: true,
            },
            {
                key: "bank_holdername",
                text: "Holder name",
                className: "address",
                align: "left",
                // sortable: true
            },
            {
                key: "account_number",
                text: "Account Number.",
                className: "postcode",
                // sortable: true
            },
            {
                key: "ifsc_code",
                text: "ifsc code",
                className: "rating",
                align: "left",

            },
            {
                key: "is_primary",
                text: "Primary",
                className: "rating",
                align: "left",
                cell: record => {
                    return (record.is_primary == 1 ? 'YES' : 'No')
                }
            },

            {
                key: "action",
                text: "Action",
                className: "action",
                width: 100,
                align: "left",
                // sortable: false,
                cell: record => {
                    return (
                        <Fragment>
                            <button
                                className="btn btn-primary btn-sm"
                                title="Edit Details"
                                onClick={() => this.editRecord(record)}
                                style={{ marginRight: '5px' }}>
                                <i className="fa fa-edit"></i>
                            </button>
                            {/* <button
                                className="btn btn-danger btn-sm"
                                onClick={() => this.deleteRecord(record)}>
                                <i className="fa fa-trash"></i>
                            </button> */}
                            <button
                                className="btn btn-primary btn-sm add-prmarybank"
                                title="Add Primary"
                                onClick={() => this.addPrimaryRecord(record)}>
                                <img src="img/AddPrimary2.png" alt="" />
                            </button>

                        </Fragment>
                    );
                }
            }
        ];
        this.config = {
            page_size: 10,
            length_menu: [10, 20, 50],
            show_pagination: true,
            pagination: 'advance',
            button: {
                // excel: true,
                // print: true,
                extra: true,
            }
        }

        this.state = {
            records: [],
            isModalOpen: false,
            iseditModalOpen: false,
            bank_name: '',
            bank_holdername: '',
            account_number: '',
            bankdocument: '',
            document_name: '',
            ifsc_code: '',
            fietcurrencyoptions: [{ label: 'Select Currency', value: '' }],
            fileuploadoptions: [{ label: 'Cancelled Check', value: 'Cancelled Check' },{ label: 'Bank Passbook', value: 'Bank Passbook' },{ label: 'Last 3 Months Bank Statement', value: 'Last 3 Months Bank Statement' }],
            currencyselectedOptions: { label: '', value: '' },
            fileselectedOptions: { label: 'Cancelled Check', value: 'Cancelled Check' },
            error: [],
        }
        this.extraButtons = [
            {
                className: "btn btn buttons-pdf",
                title: "Export TEst",
                children: [

                    <span>
                        Add Bank
                        <i class="fa fa-plus" style={{ fontSize: '14px!important' }}></i>
                    </span>
                ],
                onClick: (event) => {
                    this.setState({ isModalOpen: true })

                },
            },

        ]
    }

    async filtereditSubmit(e) {
        if (!this.state.bank_name) {
            this.setState({
                errorMsg1: "Please enter Bank Name."
            })
        }
        else if (this.state.currencyselectedOptions.value == '') {
            this.setState({
                errorMsg1: "Please Select Currency"
            })
        }
        else if(this.state.fileselectedOptions.value==''){
            this.setState({
                errorMsg1:'Please Select File Type'
            })
        }
        else if (!this.state.bank_holdername) {
            this.setState({
                errorMsg1: "Please enter Account Holder Name."
            })
        }
        else if (!this.state.account_number) {
            this.setState({
                errorMsg1: "Please enter IBAN No."
            })
        }

        else {
            let formData = new FormData()
            formData.append('id', this.state.editId)
            formData.append('bank_name', this.state.bank_name)
            formData.append('user_id', this.loginData.data.id)
            formData.append('email', this.loginData.data.user_email)
            formData.append('account_number', this.state.account_number)
            formData.append('bank_holdername', this.state.bank_holdername)
            formData.append('currency', this.state.currencyselectedOptions.value)
            formData.append('filetype',this.state.fileselectedOptions.value)
            formData.append('ifsc_code', this.state.ifsc_code)
            formData.append('BY', "USER")
            formData.append('bankdocument', this.state.bankdocument)
            await axios({
                method: 'POST',
                url: `${config.apiUrl}/updateBankDetail` + '?nocache=' + new Date().getTime(),
                headers: { "Authorization": this.loginData?.Token },
                data: formData
            })
                .then(async result => {
                    if (result.data.success === true) {


                        toast.success(result.data.msg, {
                            position: toast.POSITION.TOP_CENTER
                        });
                        this.getUserBankDetails()
                        this.setState({ iseditModalOpen: false })

                        this.setState({
                            isModalOpen: false, iseditModalOpen: false, bank_name: '',
                            bank_holdername: '',
                            account_number: '',
                            document_name:'',
                            ifsc_code: '',
                            errorMsg1: "",
                            fietcurrencyoptions: [{ label: 'Select Currency', value: '' }],
                            currencyselectedOptions: { label: '', value: '' },
                            fileselectedOptions:{label: 'Cancelled Check', value: 'Cancelled Check'}
                        })
                        this.componentDidMount()

                    }

                })
                .catch(err => {

                    if (err == 'Error: Request failed with status code 403') {
                        toast.error('Session expired please re-login')
                    } else {
                        toast.error(err.response.data?.msg, {
                            position: toast.POSITION.TOP_CENTER
                        })
                    }
                });

        }
    }
    async filterSubmit(e) {
        // e.preventDefault();

        if (!this.state.bank_name) {
            this.setState({
                errorMsg1: "Please enter Bank Name."
            })
        }
        else if (this.state.currencyselectedOptions.value == '') {
            this.setState({
                errorMsg1: "Please Select Currency"
            })
        }
        else if(this.state.fileselectedOptions.value==''){
            this.setState({
                errorMsg1:'Please Select file type'
            })
        }
        else if (!this.state.bank_holdername) {
            this.setState({
                errorMsg1: "Please enter Account Holder Name."
            })
        }
        else if (!this.state.account_number) {
            this.setState({
                errorMsg1: "Please enter IBAN No."
            })
        }

        else {
            let formData = new FormData()
            formData.append('bank_name', this.state.bank_name)
            formData.append('user_id', this.loginData.data.id)
            formData.append('email', this.loginData.data.user_email)
            formData.append('account_number', this.state.account_number)
            formData.append('bank_holdername', this.state.bank_holdername)
            formData.append('currency', this.state.currencyselectedOptions.value)
            formData.append('filetype',this.state.fileselectedOptions.value)
            formData.append('ifsc_code', this.state.ifsc_code)
            formData.append('BY', "USER")
            formData.append('bankdocument', this.state.bankdocument)

            let headers = {
                'Authorization': this.loginData?.Token,
                'Content-Type': 'application/json'
            }
            await axios({
                method: 'POST',
                url: `${config.apiUrl}/addBankDetail` + '?nocache=' + new Date().getTime(),
                headers: { "Authorization": this.loginData?.Token },
                data: formData
            })
                .then(async result => {
                    if (result.data.success === true) {
                        toast.success(result.data.msg, {
                            position: toast.POSITION.TOP_CENTER
                        });
                        this.getUserBankDetails()
                        this.setState({ isModalOpen: false })

                        this.setState({
                            isModalOpen: false, iseditModalOpen: false, bank_name: '',
                            bank_holdername: '',
                            account_number: '',
                            ifsc_code: '',
                            document_name:'',
                            errorMsg1: "",
                            fietcurrencyoptions: [{ label: 'Select Currency', value: '' }],
                            currencyselectedOptions: { label: '', value: '' },
                            fileselectedOptions:{label: 'Cancelled Check', value: 'Cancelled Check'}
                        })
                        this.componentDidMount()

                    } else if (result.data.success === false) {
                        toast.error(result.data?.msg, {
                            position: toast.POSITION.TOP_CENTER
                        })
                    }

                })
                .catch(err => {
                    console.log('errerr', err)
                    if (err == 'Error: Request failed with status code 403') {
                        toast.error('Session expired please re-login')
                    } else {
                        toast.error(err.response.data?.msg, {
                            position: toast.POSITION.TOP_CENTER
                        })
                    }

                });

        }

    }





    editRecord(record) {
        let selectData = this.state.fietcurrencyoptions.filter(i => i.value == record.currency)
        let selectFiletype=this.state.fileuploadoptions.filter(i=>i.value==record.filetype)
        this.setState({
            bank_name: record.bank_name,
            bank_holdername: record.bank_holdername,
            ifsc_code: record.ifsc_code,
            editId: record.id,
            account_number: record.account_number,
            bankdocument:record.bankdocument,
            document_name:record.bankdocument,
            currencyselectedOptions: selectData[0],
            fileselectedOptions:selectFiletype[0]
        })

        this.setState({ iseditModalOpen: true })

    }

    async addPrimaryRecord(data) {
        await axios({
            method: 'POST',
            url: `${config.apiUrl}/addBankPrimary` + '?nocache=' + new Date().getTime(),
            headers: { "Authorization": this.loginData?.Token },
            data: {
                'id': data.id,
                'user_id': this.loginData.data?.id,
                "email": this.loginData.data?.user_email,
            }
        })
            .then(async result => {
                if (result.data.success === true) {
                    toast.success(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                    this.componentDidMount()
                }

            })
            .catch(err => {

                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                } else {
                    toast.error(err.response.data?.msg, {
                        position: toast.POSITION.TOP_CENTER
                    })
                }

            });
    }


    async deleteRecord(record) {
        await axios({
            method: 'POST',
            url: `${config.apiUrl}/deleteBankDetail` + '?nocache=' + new Date().getTime(),
            headers: { "Authorization": this.loginData?.Token },
            data: {
                'id': record.id,
                'user_id': this.loginData.data?.id,
                "email": this.loginData.data?.user_email,
            }
        })
            .then(async result => {
                if (result.data.success === true) {
                    toast.success(result.data.msg, {
                        position: toast.POSITION.TOP_CENTER
                    });
                    this.componentDidMount()
                }

            })
            .catch(err => {

                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                } else {
                    toast.error(err.response.data?.msg, {
                        position: toast.POSITION.TOP_CENTER
                    })
                }

            });
        console.log("Delete Record", record);
    }

    getUserBankDetails() {

        axios.get(`${config.apiUrl}/getBankDetails?user_id=${this.loginData.data.id}`)
            .then(async result => {
                this.setState({ records: result.data.response })
            }).catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                }
            })
    }

    currencyChangehandler(event) {
        let selectData = this.state.fietcurrencyoptions.filter(i => i.value == event.target.value)
        this.setState({ currencyselectedOptions: selectData[0], usdt_amount: 0, amount: 0 })
    }

    filetypeHandler(e){
            let selectData = this.state.fileuploadoptions.filter(i => i.value == e.target.value)
       console.log('selectData',selectData) 
            this.setState({ fileselectedOptions: selectData[0], usdt_amount: 0, amount: 0 })
    }

    handleChange2 = e => {
        const re = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;


        if (e.target.name == 'account_number' && (re.test(e.target.value) || e.target.value == '')) {
            this.setState({
                ['account_number']: e.target.value,
                errorMsg: "",
                errorMsg1: "",
            })
        } else if (e.target.name != 'account_number') {
            this.setState({
                [e.target.name]: e.target.value,
                errorMsg: "",
                errorMsg1: "",
            })
        }

    }

    closeModal() {
        this.setState({
            isModalOpen: false, iseditModalOpen: false, bank_name: '',
            bank_holdername: '',
            account_number: '',
            bankdocument:'',
            document_name:'',
            ifsc_code: '',
            fietcurrencyoptions: [{ label: 'Select Currency', value: '' }],
            currencyselectedOptions: { label: '', value: '' },
            fileselectedOptions:{label: 'Cancelled Check', value: 'Cancelled Check'}
        })
        this.componentDidMount()
    }
    componentDidMount() {
        this.getUserBankDetails()
        this.getcurrencies()
    }

    getcurrencies() {
        axios.get(`${config.apiUrl}/getcurrencies`)
            .then(async result => {
                if (result.data && result.data.response) {
                    let array = [{ label: 'Select Currency', value: '' }]
                    for (let x in result.data.response) {
                        let obj = {}
                        obj.label = result.data.response[x].symbol
                        obj.value = result.data.response[x].symbol
                        array.push(obj)
                    }

                    this.setState({ fietcurrencyoptions: array })
                }

            }).catch(err => {
                if (err == 'Error: Request failed with status code 403') {
                    toast.error('Session expired please re-login')
                }

            })
    }

    fileuploadHandler = async (e) => {


        // var file = e.target.files[0]
        // if (file && file.type.indexOf("image") > -1) {
        // var file_name = file.name

        //  const options = {
        //     maxSizeMB: 1,
        //     maxWidthOrHeight: 1920,
        //     useWebWorker: true
        //   }
        // const compressedFile = await imageCompression(file, options);

        // this.setState({ 'receipt': compressedFile, 'receipt_name': file_name })
        // }else{
        //     toast.warning('only image file accept!')
        // }

        for (var i = 0; i < e.target.files.length; i++) {
            let file = e.target.files[i];
            // console.log(file);
            console.log(file.type)

            if (!['image/jpeg', 'application/pdf'].includes(file.type)) {
                toast.error('Please choose image or pdf file');
            }
            //  else if(file.size / (1024*1024) > 1) {
            //    toast.error('Please choose image of smaller size');
            // }
            else {

                var reader = new FileReader();

                // reader.onload = function (e) {
                //     var imgid = document.getElementById('blah')
                //     console.log(e.target.result)
                //     imgid.src = e.target.result
                // };

                reader.readAsDataURL(file);

                const compress = new Compress();
                const files = [...e.target.files];
                if (file.type.includes('image')) {
                    compress.compress(files, {
                        size: 1,
                        quality: 0.75,
                        maxWidth: 1920,
                        maxHeight: 1920,
                        resize: true
                    }).then(modFiles => {
                        // modFiles are modified files with exif free and compressed       //  versions of user selected images
                        let uploadableFiles = [];
                        console.log('modFiles', modFiles)

                        for (var i = modFiles.length - 1; i >= 0; i--) {
                            let file = Compress.convertBase64ToFile(modFiles[i].data, modFiles[i].ext);
                            let filename = Date.now() + modFiles[i].alt;
                            let filetype = modFiles[i].ext;
                            let filelastMod = files[i].lastModified;
                            uploadableFiles.push(new File([file], filename, { type: filetype, lastModified: filelastMod }));
                        }
                        let img = new Image();
                        let obj;
                        this.setState({ bankdocument: uploadableFiles[0], document_name: uploadableFiles[0].name });
                        img.onload = () => {
                            obj = { width: img.width, height: img.height };

                        }
                        //   img.src = modFiles[i].prefix + modFiles[i].data;
                    });
                } else {
                    this.setState({ bankdocument: file, document_name: file.name });
                }
            }
        }
    }

    render() {
        return (

            <div>
                <Header />
                <ToastContainer />
                <div className='container'>
                    <div className='bankdetail-table mb-5' id="bank_detail">
                        <h2 className="p-2 ml-3 Appheading">Bank Details</h2>
                        <ReactDatatable
                            config={this.config}
                            records={this.state.records}
                            columns={this.columns}
                            extraButtons={this.extraButtons}
                        />
                    </div>
                </div>
                <Footer />
                <Modal
                    isOpen={this.state.isModalOpen}
                    onRequestClose={e => this.closeModal()}
                    style={customStyles}
                    contentLabel="Example Modal"
                >
                    <button className=' btn_close' onClick={e => this.closeModal()} style={{ float: 'right' }}>X</button>
                    <form>
                        <div class="content-padding-modal AppFormLeft" >
                            <div>
                                <div class="quotes-view" id="bank_details_new">
                                    <div class="quotes-view-container" id="bank_details">
                                        <h2>Bank Account Detail </h2>

                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <span inputmode="numeric" selected>
                                                    <input type="text" name='bank_name' autocomplete="off" value={this.state.bank_name} onChange={this.handleChange2} className="input-control" />
                                                </span>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">Bank Name</div>
                                            </div>

                                        </div>
                                        &nbsp;
                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <select className="input-control" onChange={value => this.currencyChangehandler(value)} >
                                                    {this.state.fietcurrencyoptions.map(item => (
                                                        item.value == '' ? <option value="" selected disabled hidden>Select Currency</option> :
                                                            <option value={item.value} selected={this.state.currencyselectedOptions.value == item.value ? "selected" : ""}>{item.label}</option>
                                                    ))}
                                                </select>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">Currency</div>
                                            </div>


                                        </div>&nbsp;
                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <span inputmode="numeric" selected>
                                                    <input type="text" name='bank_holdername' autocomplete="off" value={this.state.bank_holdername} onChange={this.handleChange2} class="inputField" />
                                                </span>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">Holder Name</div>
                                            </div>

                                        </div>
                                        &nbsp;
                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <span>
                                                    <input type="text" min="0" inputmode="numeric" autocomplete="off" name="account_number" class="inputField" for="amount"
                                                        onChange={this.handleChange2} value={this.state.account_number} />
                                                </span>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">Account No.</div>
                                            </div>


                                        </div>&nbsp;

                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <span inputmode="numeric" selected>
                                                    <input type="text" name='ifsc_code' autocomplete="off" value={this.state.ifsc_code} onChange={this.handleChange2} class="inputField" />
                                                </span>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">IFSC Code</div>
                                            </div>

                                        </div>

                                        &nbsp;
                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <select className="input-control" onChange={value => this.filetypeHandler(value)} >
                                                    {this.state.fileuploadoptions.map(item => (
                                                        item.value == '' ? <option value="" selected disabled hidden>Select File Type</option> :
                                                            <option value={item.value} selected={this.state.fileselectedOptions.value == item.value ? "selected" : ""}>{item.label}</option>
                                                    ))}
                                                </select>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">Select File Type</div>
                                            </div>


                                        </div>
                                        <div class="qtyccy-selector cs-special">
                                            <div class="upload-btn-wrapper">
                                                <button class="btn-upload">{this.state.document_name == '' ? `Upload File` : `${this.state.document_name.toString().substring(0, 5) + '...' + this.state.document_name.toString().substring(this.state.document_name.length - 5)}`}</button>
                                                <input type="file" accept="image/png, image/gif, image/jpeg,application/pdf" name="document" onChange={e => this.fileuploadHandler(e)} />
                                                {this.state.error.length > 0 && this.state.error[0].name == 'document_name' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}
                                            </div>
                                        </div>

                                        <br />
                                        <p style={{ color: 'red' }}>{this.state.errorMsg1}</p>

                                        <div className="modal-footer">


                                            <button type="button" onClick={e => this.filterSubmit(e)} className='btn btn-primary btn-confirm col-sm-12' >Confirm</button>

                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </form>
                </Modal>

                <Modal
                    isOpen={this.state.iseditModalOpen}
                    onRequestClose={e => this.closeModal()}
                    style={customStyles}
                    contentLabel="Example Modal"
                >
                    <button className=' btn_close' onClick={e => this.closeModal()} style={{ float: 'right' }}>X</button>
                    <form>
                        <div class="content-padding-modal AppFormLeft" >
                            <div>
                                <div class="quotes-view" id="bank_details_new">
                                    <div class="quotes-view-container" id="bank_details">
                                        <h2>Bank Account Detail </h2>

                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <span inputmode="numeric" selected>
                                                    <input type="text" name='bank_name' autocomplete="off" value={this.state.bank_name} onChange={this.handleChange2} className="input-control" />
                                                </span>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">Bank Name</div>
                                            </div>

                                        </div>
                                        &nbsp;
                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <select className="input-control" onChange={value => this.currencyChangehandler(value)} >
                                                    {this.state.fietcurrencyoptions.map(item => (
                                                        item.value == '' ? <option value="" selected disabled hidden>Select Currency</option> :
                                                            <option value={item.value} selected={this.state.currencyselectedOptions.value == item.value ? "selected" : ""}>{item.label}</option>
                                                    ))}
                                                </select>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">Currency</div>
                                            </div>


                                        </div>&nbsp;
                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <span inputmode="numeric" selected>
                                                    <input type="text" name='bank_holdername' autocomplete="off" value={this.state.bank_holdername} onChange={this.handleChange2} class="inputField" />
                                                </span>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">Holder Name</div>
                                            </div>

                                        </div>
                                        &nbsp;
                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <span>
                                                    <input type="text" min="0" inputmode="numeric" autocomplete="off" name="account_number" class="inputField" for="amount"
                                                        onChange={this.handleChange2} value={this.state.account_number} />
                                                </span>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">Account No.</div>
                                            </div>


                                        </div>&nbsp;

                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <span inputmode="numeric" selected>
                                                    <input type="text" name='ifsc_code' autocomplete="off" value={this.state.ifsc_code} onChange={this.handleChange2} class="inputField" />
                                                </span>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">IFSC Code</div>
                                            </div>

                                        </div>

                                        &nbsp;
                                        <div class="qtyccy-selector cs-special">
                                            <div class="quantityWrapper">
                                                <select className="input-control" onChange={value => this.filetypeHandler(value)} >
                                                    {this.state.fileuploadoptions.map(item => (
                                                        item.value == '' ? <option value="" selected disabled hidden>Select File Type</option> :
                                                            <option value={item.value} selected={this.state.fileselectedOptions.value == item.value ? "selected" : ""}>{item.label}</option>
                                                    ))}
                                                </select>
                                                <div class="quantity-input-label cs-subtext cs-special-subtext">Select File Type</div>
                                            </div>


                                        </div>

                                        <div class="qtyccy-selector cs-special">
                                            <div class="upload-btn-wrapper">
                                                <button class="btn-upload">{this.state.document_name == '' ? `Upload File` : `${this.state.document_name.toString().substring(0, 5) + '...' + this.state.document_name.toString().substring(this.state.document_name.length - 5)}`}</button>
                                                <input type="file" accept="image/png, image/gif, image/jpeg,application/pdf" name="document" onChange={e => this.fileuploadHandler(e)} />
                                                {this.state.error.length > 0 && this.state.error[0].name == 'document_name' ? <div><span className='alert_validation'>{this.state.error[0].err}</span></div> : ''}
                                            </div>
                                        </div>
                                        <br />
                                        <p style={{ color: 'red' }}>{this.state.errorMsg1}</p>

                                        <div className="modal-footer">


                                            <button type="button" onClick={e => this.filtereditSubmit()} className='btn btn-primary btn-confirm col-sm-12' >Confirm</button>


                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </form>
                </Modal>
            </div>
        )
    }
}
