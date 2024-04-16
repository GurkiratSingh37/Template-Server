'use strict';

const logging                             = require('../../../logging/logging');
const loginTokenService                   = require('../../login/services/loginTokenService');
const pwdService                          = require('../../../services/pwdService');
const messagingService                     = require('../../../services/messagingService');
const responseConstants                   = require("../../../responses/responseConstants");
const registerDao                         = require("../../register/dao/registerDao");
const loginService                        = require('./loginService');
const tinyUrlService                      = require('../../../services/tinyUrlService');
const envProperties                       = require('../../../properties/envProperties');

/**
 * Forget Password Service
 * @param  apiReference -> Module Name 
 * @param  opts         -> Request Body Values
 * @returns 
 */

exports.forgotPassword = async (apiReference, opts) => {
  let response = { success: false };
  logging.log(apiReference, { EVENT: "Forgot Password Service", OPTS: opts });

  let loginInfo = await registerDao.fetchDetails(apiReference, opts);
  logging.log(apiReference, { EVENT: "Fetch User Details", RESPONSE: loginInfo });

  if (!loginInfo.success) {
    return loginInfo;
  }

  if (_.isEmpty(loginInfo.data)) {
    response.error = responseConstants.responseMessages.USER_NOT_FOUND;
    return response;
  }

  loginInfo = loginInfo.data[0];

  loginInfo["access-token"] = await loginTokenService.generateJWT(apiReference, loginInfo, "15 mins");
  await loginTokenService.saveToCache(apiReference, loginInfo.user_id, loginInfo["access-token"]);

  loginInfo.url = envProperties.fe_url + "resetpassword?access-token=" + loginInfo["access-token"];
  loginInfo.url =  await tinyUrlService.shortener(apiReference, loginInfo.url);

  if( opts.email ){
    // sending on mail
    let email = opts.email;
    
    let sendEmailResp = await messagingService.brazeSendNotification(apiReference, {
      user_id       : loginInfo.user_id,
      url           : loginInfo.url,
      name          : loginInfo.name,
      email
    }, "send/forgotPassword");
    logging.log(apiReference, {EVENT: "Send Email", RESPONSE: sendEmailResp});
    if (!sendEmailResp.success){
      return sendEmailResp;
    }
  }

  if(opts.phone_number){
    // sending on phone
    let phone_number = [];
    phone_number.push(loginInfo.country_code + loginInfo.phone_number);
    
    let sendSMSResp = await messagingService.brazeSendNotification(apiReference, {
      user_id       : loginInfo.user_id,
      url           : loginInfo.url,
      name          : loginInfo.name,
      phone_number
    }, "send/forgotPassword");
    logging.log(apiReference, {EVENT: "Send SMS", RESPONSE: sendSMSResp});
    if (!sendSMSResp.success){
      return sendSMSResp;
    }
  }

  response.success = true;
  return response;
};

/**
 * Reset Password Service
 * @param  apiReference -> Module Name 
 * @param  opts         -> Request Body Values
 * @returns 
 */


exports.resetPassword = async (apiReference, opts) => {
  let response = { success: false };
  logging.log(apiReference, { EVENT: "Reset Password Service", OPTS: opts });

  // -------------Fetch OLD Password Details ----------------
  let userInfo = await registerDao.fetchDetails(apiReference, opts);
  logging.log(apiReference, { EVENT: "Fetch User Details", RESPONSE: userInfo });

  if (!userInfo.success) {
    return userInfo;
  }

  if (_.isEmpty(userInfo.data)) {
    response.error = responseConstants.responseMessages.USER_NOT_FOUND;
    return response;
  }

  userInfo = userInfo.data[0];

  if (pwdService.compare(opts.new_password, userInfo.password)) {
    response.error = responseConstants.responseMessages.SAME_NEW_PASSWORD;
    return response;
  }

  // -----------UPDATING USER PROFILE -------------
  let updateObj = {
    password: pwdService.encrypt(opts.new_password)  // encrypting password
  }
  let updateResponse = await registerDao.updateDetails(apiReference, updateObj, { user_id: opts.user_id });
  logging.log(apiReference, { EVENT: "Update User Details", RESPONSE: updateResponse });
  if (!updateResponse.success) {
    return updateResponse;
  }

  //--------------LOGOUT ALL DEVICES------------------ 
  if (opts.logout_all) {
    opts.reset_password = true;
    let logoutALLResp = await loginService.logoutAll(apiReference, opts)
    logging.log(apiReference, { EVENT: "Logout all response", RESPONSE: logoutALLResp });
    if (!logoutALLResp.success) {
      return logoutALLResp;
    }
  }
  
  // deleting the token
  await loginTokenService.deleteFromCache(apiReference, userInfo.user_id);

  response.success = true;
  return response;
};

exports.forgotUsername = async(apiReference, opts)=>{
  let response = {success: false};
  logging.log(apiReference, {EVENT: "Forgot Username SERVICE", OPTS: opts});

  let loginInfo = await registerDao.fetchDetails(apiReference, opts);
  logging.log(apiReference, {EVENT: "Fetch User Details", RESPONSE: loginInfo });

  if (!loginInfo.success) {
    return loginInfo;
  }

  if (_.isEmpty(loginInfo.data)) {
    response.error = responseConstants.responseMessages.USER_NOT_FOUND;
    return response;
  }
  
  loginInfo = loginInfo.data[0];

  if(opts.email){
    // Sending mail
    let email = opts.email;
    
    let sendEmailResp = await messagingService.brazeSendNotification(apiReference, {
      user_id       : loginInfo.user_id,
      username      : loginInfo.username,
      name          : loginInfo.name,
      email
    }, "send/forgotUsername");
    logging.log(apiReference, {EVENT: "Send Email", RESPONSE: sendEmailResp});
    if (!sendEmailResp.success){
      return sendEmailResp;
    }
  }

  if(opts.phone_number){
    // Sending Message on Phone Number
    let phone_number = [];
    phone_number.push(loginInfo.country_code + loginInfo.phone_number);
  
    let sendSMSResp = await messagingService.brazeSendNotification(apiReference, {
      user_id       : loginInfo.user_id,
      username      : loginInfo.username,
      name          : loginInfo.name,
      phone_number
    }, "send/forgotUsername");
    logging.log(apiReference, {EVENT: "Send SMS", RESPONSE: sendSMSResp});
    if (!sendSMSResp.success){
      return sendSMSResp;
    }
  }

  response.success = true;
  return response;
}