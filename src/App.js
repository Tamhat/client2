
import './App.css';
import './home.css';
//==================================  Import all dependencies  ============================

import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { useEffect, useState } from 'react';
import ScrollToTop from './directives/scrolltotop';
import config from './config/config'
//================================  Import folders  ===========================


import exchange from './components/exchange/exchange'


import Signup from './signup'
import Login from './login'
import Wallet from './wallet'


import VerifyAccount from './signup'
import Forgot from './forgot'
import Resetpassword from './resetpassword'



import transaction_history from './components/transaction_history/transaction_history'


import coinList from './components/coinLIst'

import orderHistory from './components/order-history/order-history'

import Withdraw from './components/withdraw/withdraw'
import Transfer from './components/withdraw/transfer'
import withdrawCrypto from './components/withdraw/withdrawcrypto'
import bankDetail from './components/bankdetail/bankdetail'

import emailauthsecurity from './emailauthsecurity'
import smsauthsecurity from './smsauthsecurity'
import security from './components/security/security'
import changepassword from './components/security/change_password'
import googleverify from './components/security/google_verify'
import setting from './components/setting/setting'
import device_managment from './components/security/device_managment'
import twoauthsecurity from './twoauthsecurity'
import home from './home';

import support from './webpages/support';
import terms_condition from './webpages/terms_condition';
import contact_us from './webpages/contact_us';
import announcements from './webpages/announcement';
import about_us from './webpages/about_us';

import privacy_policy from './webpages/privacy_policy';
import faq from './webpages/faq';



import Dashboard from './dashboard';
import moreAnnouncement from './moreAnnouncement';
import ticket from './ticket'
import profile from './profile'
import chat from './chat'
import DepositForm from './components/depositForm/depositform'
import DepositCrypto from './components/depositForm/depositcrypto'
import Cookies from 'js-cookie';
import PageNotFound from './page404 '
import { ToastContainer, toast } from 'react-toastify';
import Staking from './components/Staking/Staking';
import Referral from './components/Staking/referral';
import incomeList from './components/Staking/incomeList'
import ReferralUsers from './components/Staking/Referral_Users'
import Mobileverify from './components/mobileverify'
function App() {
  const loginData = (!Cookies.get('loginSuccess')) ? [] : JSON.parse(Cookies.get('loginSuccess'));
  // const { match: { params } } = this.props;
  const loginId = (!loginData.data) ? 0 : loginData.data.id;
  // console.log(loginId)
  const [currentCount, setCount] = useState(24);
  const timer = () => setCount(currentCount - 1);

  const setSessionTime = () => {
    setCount(24)
  }
  useEffect(
    () => {
      if (currentCount <= 0) {
        //  console.log('down')
        Cookies.remove('loginSuccess')
        toast.error('Session Expired')
        window.location.href = `${config.websiteUrl}exc/login`;
        return;
      }
      const id = setInterval(timer, 1000 * 60 * 60);
      return () => clearInterval(id);
    },
    [currentCount]
  );


  const ClickAnywhere = (e) => {
    //   console.log('clickany')
  }

  return (

    <BrowserRouter>
      <ScrollToTop>
        <div onMouseMove={setSessionTime} onClick={ClickAnywhere}>

          <ToastContainer />
          <Switch>

            {loginId == 0 ?
              <>
                {console.log('000000000000')}
                <Route exact path={`${config.baseUrl}`} component={home} />
                <Route exact path={`${config.baseUrl}signup`} component={Signup} />
                <Route path={`${config.baseUrl}signup/:referral_code`} exact component={Signup} />
                <Route exact path={`${config.baseUrl}login`} component={Login} />
                <Route exact path={`${config.baseUrl}depositform`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}depositcrypto`} component={PageNotFound} />
                <Route path={`${config.baseUrl}depositcrypto/:coin_id`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}verifyAccount/:token`} component={VerifyAccount} />
                <Route exact path={`${config.baseUrl}resetpassword/:token`} component={Resetpassword} />
                <Route path={`${config.baseUrl}Exchange/:symbol`} exact component={exchange} />
                <Route path={`${config.baseUrl}Exchange`} exact component={exchange} />
                <Route path={`${config.baseUrl}about_us`} exact component={about_us} />
                <Route path={`${config.baseUrl}contact_us`} exact component={contact_us} />
                <Route path={`${config.baseUrl}support`} exact component={Login} />
                <Route path={`${config.baseUrl}terms_condition`} exact component={terms_condition} />
                <Route path={`${config.baseUrl}privacy_policy`} exact component={privacy_policy} />
                <Route path={`${config.baseUrl}faq`} exact component={faq} />
               
             
                <Route path={`${config.baseUrl}announcements`} exact component={announcements} />
                <Route path={`${config.baseUrl}forgot`} exact component={Forgot} />
                <Route exact path={`${config.baseUrl}dashboard`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}ticket`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}profile`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}chat/:id`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}moreAnnouncement`} component={PageNotFound} />

                <Route exact path={`${config.baseUrl}wallet`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}orderhistory`} component={PageNotFound} />
              
                <Route exact path={`${config.baseUrl}profileedit`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}withdraw/:coin_id`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}withdraw/`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}transfer`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}withdrawcrypto`} component={PageNotFound} />
                <Route path={`${config.baseUrl}withdrawcrypto/:coin_id`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}bankDetails/`} component={PageNotFound} />
                
                <Route exact path={`${config.baseUrl}buycrypto_history`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}transaction_history`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}order-History`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}buy-crypto`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}buy-crypto/:coin_id`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}withdraw`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}withdraw/:coin_id`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}security`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}depositform`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}changepassword`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}googleverify`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}device_managment`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}setting`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}googleauthentication`} component={twoauthsecurity} />
                <Route exact path={`${config.baseUrl}emailauthentication`} component={emailauthsecurity} />
                <Route exact path={`${config.baseUrl}smsauthentication`} component={smsauthsecurity} />
                <Route exact path={`${config.baseUrl}coinList`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}staking`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}referral`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}incomeList/:id`} component={PageNotFound} />
                <Route exact path={`${config.baseUrl}ReferralUsers`} component={PageNotFound} />
                <Route path={`${config.baseUrl}mobieVerify/:user_id`} component={Mobileverify} />
              </> :

              <>
                <Route exact path={`${config.baseUrl}`} component={home} />
                <Route exact path={`${config.baseUrl}signup`} component={Signup} />
                <Route path={`${config.baseUrl}signup/:referral_code`} exact component={Signup} />
                <Route exact path={`${config.baseUrl}login`} component={Login} />
                <Route exact path={`${config.baseUrl}verifyAccount/:token`} component={VerifyAccount} />
                <Route exact path={`${config.baseUrl}resetpassword/:token`} component={Resetpassword} />
                <Route path={`${config.baseUrl}Exchange/:symbol`} exact component={exchange} />
                <Route path={`${config.baseUrl}Exchange`} exact component={exchange} />
                <Route exact path={`${config.baseUrl}about_us`} component={about_us} />
                <Route exact path={`${config.baseUrl}contact_us`} component={contact_us} />
                <Route exact path={`${config.baseUrl}support`} component={ticket} />
                <Route exact path={`${config.baseUrl}terms_condition`} component={terms_condition} />
                <Route exact path={`${config.baseUrl}privacy_policy`} component={privacy_policy} />
                <Route exact path={`${config.baseUrl}faq`} component={faq} />
               
            
                <Route exact path={`${config.baseUrl}announcements`} component={announcements} />
                <Route exact path={`${config.baseUrl}forgot`} component={Forgot} />
                <Route exact path={`${config.baseUrl}dashboard`} component={Dashboard} />
                <Route exact path={`${config.baseUrl}ticket`} component={ticket} />
                <Route exact path={`${config.baseUrl}profile`} component={profile} />
                <Route exact path={`${config.baseUrl}depositform`} component={DepositForm} />
                <Route exact path={`${config.baseUrl}depositcrypto`} component={DepositCrypto} />
                <Route path={`${config.baseUrl}depositcrypto/:coin_id`} component={DepositCrypto} />
                <Route path={`${config.baseUrl}mobieVerify/:user_id`} component={Mobileverify} />
                <Route exact path={`${config.baseUrl}chat/:id`} component={chat} />





                <Route exact path={`${config.baseUrl}wallet`} component={Wallet} />

                
              


                <Route exact path={`${config.baseUrl}bankDetails/`} component={bankDetail} />



                
                
                <Route exact path={`${config.baseUrl}transaction_history`} component={transaction_history} />
                <Route exact path={`${config.baseUrl}order-History`} component={orderHistory} />


                <Route exact path={`${config.baseUrl}withdraw`} component={Withdraw} />
                <Route exact path={`${config.baseUrl}withdrawcrypto`} component={withdrawCrypto} />
                <Route path={`${config.baseUrl}withdrawcrypto/:coin_id`} component={withdrawCrypto} />
                <Route exact path={`${config.baseUrl}withdraw/:coin_id`} component={Withdraw} />
                <Route exact path={`${config.baseUrl}transfer/:coin_id`} component={Transfer} />
                <Route exact path={`${config.baseUrl}transfer/`} component={Transfer} />
                <Route exact path={`${config.baseUrl}security`} component={security} />
                <Route exact path={`${config.baseUrl}changepassword`} component={changepassword} />
                <Route exact path={`${config.baseUrl}googleverify`} component={googleverify} />
                <Route exact path={`${config.baseUrl}device_managment`} component={device_managment} />
                <Route exact path={`${config.baseUrl}setting`} component={setting} />
                <Route exact path={`${config.baseUrl}googleauthentication`} component={twoauthsecurity} />
                <Route exact path={`${config.baseUrl}emailauthentication`} component={emailauthsecurity} />
                <Route exact path={`${config.baseUrl}smsauthentication`} component={smsauthsecurity} />
                <Route exact path={`${config.baseUrl}coinList`} component={coinList} />
                <Route exact path={`${config.baseUrl}staking`} component={Staking} />
                <Route exact path={`${config.baseUrl}referral`} component={Referral} />
                <Route exact path={`${config.baseUrl}incomeList/:id`} component={incomeList} />
                <Route exact path={`${config.baseUrl}ReferralUsers`} component={ReferralUsers} />
              </>}

          </Switch>

        </div>
      </ScrollToTop>
    </BrowserRouter>

  );
}

export default App;
