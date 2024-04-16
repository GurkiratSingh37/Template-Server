'use strict';

const logging                     = require('../../../logging/logging');
const responseConstants           = require('../../../responses/responseConstants');
const loginTokenService           = require('./loginTokenService');
const registerDao                 = require('../../register/dao/registerDao');
const loginDao                    = require('../dao/loginDao');
const registerService             = require('../../register/services/registerService');
const registerConstants           = require('../../register/properties/registerConstants');
const pwdService                  = require('../../../services/pwdService');
const dateUtility                 = require('../../../utility/dateUtility');
const networkingService           = require('../../networking/services/networkingService');
const loginConstants              = require('../properties/loginConstants');
const industryDao                 = require('../../industries/dao/industryDao');
const redisLib                    = require('../../../database/redislib');
const jwtService                  = require('../../../services/jwtService');
const appVersionService           = require('../../app_versions/service/appVersionService');


/**
 * Login With Password Service
 * @param  apiReference -> Module Name 
 * @param  opts         -> Request Body Values
 * @returns 
 */


exports.login = async (apiReference, opts) => {
  let response = { success: false };
  logging.log(apiReference, { EVENT: "Login User Service", OPTS: opts });

  opts.isLoginCheck = true;

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

  if (!loginInfo.is_active) {
    response.error = responseConstants.responseMessages.ACCOUNT_INACTIVE;
    return response;
  }
  if (!pwdService.compare(opts.password, loginInfo.password)) {
    response.error = responseConstants.responseMessages.INVALID_CREDENTIALS;
    return response;
  }

  let userInfo = await registerDao.fetchDetails(apiReference, { user_id: loginInfo.user_id, fetch_personal_details: true });
  logging.log(apiReference, { EVENT: "Fetch User Details", RESPONSE: userInfo });
  if (!userInfo.success) {
    return userInfo;
  }

  let companyInfo = await registerDao.fetchDetails(apiReference, { user_id: loginInfo.user_id, fetch_company_details: true });
  logging.log(apiReference, { EVENT: "Fetch Company Details", RESPONSE: companyInfo });
  if (!companyInfo.success) {
    return companyInfo;
  }

  if (!_.isEmpty(userInfo.data)) {
    loginInfo.account_type = registerConstants.ACCOUNT_TYPE.PERSONAL;
  } else {
    loginInfo.account_type = registerConstants.ACCOUNT_TYPE.COMPANY;
    loginInfo.logo         = companyInfo.data[0].logo;
  }

  let data = {
    name: loginInfo.name,
    email: loginInfo.email,
    phone_number: loginInfo.phone_number,
    country_code: loginInfo.country_code,
    username: loginInfo.username,
    account_type: loginInfo.account_type,
    is_registration_completed: loginInfo.is_registration_completed
  }

  if (!loginInfo.is_registration_completed) {
    response.data = data;
    response.error = responseConstants.responseMessages.INCOMPLETE_REGISTRATION;
    return response;
  }

  // Checking Device Version
  if(opts.device_details){
    logging.log(apiReference, {EVENT: "Device Details Check", DEVICE_DETAILS: opts.device_details});
    let details = opts.device_details;
    try{
      details = JSON.parse(details);
    }
    catch(e){
      logging.logError(apiReference, details);
    }

    let device_details = await appVersionService.checkDeviceVersion(apiReference, opts.device_details, {device_type: details.device_type});
    logging.log(apiReference, {EVENT: "Device Details Check Version Response", RESPONSE: device_details});
    if(!_.isEmpty(device_details)){
      loginInfo.is_update_available = device_details.is_update_available;
      loginInfo.app_url = device_details.app_url;
    }
  }

  // CHECKING IF NODE IS CREATED OR NOT
  if (!loginInfo.is_node_created) {
    // CREATE NEW NODE IN NEO4J
    let creatingNewNodeResp = await networkingService.creatingNewNode(apiReference, loginInfo);
    logging.log(apiReference, { EVENT: "Insert User Node Details", RESPONSE: creatingNewNodeResp });

    if (creatingNewNodeResp.success) {
      loginInfo.is_node_created = true;
    }
  }

  let tokenResponse = await module.exports.createJwtToken(apiReference, opts, loginInfo);
  if(!tokenResponse.success){
    return tokenResponse;
  }

  loginInfo["access-token"] = tokenResponse.data;


  // -----------INSERTING LOCATION LOGS -------------
  opts.trigger = responseConstants.LOCATION_TRIGGER.LOGIN;
  opts.user_id = loginInfo.user_id;
  let insertLocationLogs = await registerService.insertLocationLogs(apiReference, opts);
  logging.log(apiReference, { EVENT: "insert location logs Response", insertLocationLogs });
  if (!insertLocationLogs.success) {
    return insertLocationLogs;
  }

  // -----------UPDATING USER PROFILE -------------
  let updateObj = {
    is_node_created : loginInfo.is_node_created,
    timezone        : opts.timezone,
    timezone_offset : opts.timezone_offset
  }
  let updateResponse = await registerDao.updateDetails(apiReference, updateObj, { user_id: loginInfo.user_id });
  logging.log(apiReference, { EVENT: "Update User Details", RESPONSE: updateResponse });

  if (!updateResponse.success) {
    return updateResponse;
  }

  delete loginInfo.password;
  delete loginInfo.is_node_created;
  delete loginInfo.device_details_id;

  response.success = true;
  response.data = { ...loginInfo };
  return response;
};


/**
 * Login Via OTP Service
 * @param  apiReference -> Module Name 
 * @param  opts         -> Request Body Values
 * @returns 
 */


exports.loginViaOTP = async (apiReference, opts) => {
  let response = { success: false };
  logging.log(apiReference, { EVENT: "Login Via OTP Service", OPTS: opts });

  opts.fetch_otp_code = true;

  let loginInfo = await registerDao.fetchDetails(apiReference, opts);
  logging.log(apiReference, { EVENT: "Fetch User Details", RESPONSE: loginInfo });

  if (!loginInfo.success) {
    return loginInfo;
  }

  if (_.isEmpty(loginInfo.data)) {
    response.error = responseConstants.responseMessages.USER_NOT_FOUND
    return response;
  }

  loginInfo = loginInfo.data[0];

  if (!loginInfo.is_active) {
    response.error = responseConstants.responseMessages.ACCOUNT_INACTIVE;
    return response;
  }

  if (loginInfo.otp_sent_at) {
    let seconds = dateUtility.getDiffernceInSeconds(loginInfo.otp_sent_at);
    logging.log(apiReference, { EVENT: "Time In Seconds", seconds });
    if (seconds > registerConstants.default_seconds) {
      response.error = responseConstants.responseMessages.OTP_EXPIRES;
      return response;
    }
  }

  if (loginInfo.otp_code !== opts.otp_code) {
    response.error = responseConstants.responseMessages.INVALID_OTP;
    return response;
  }

  let userInfo = await registerDao.fetchDetails(apiReference, { user_id: loginInfo.user_id, fetch_personal_details: true });
  logging.log(apiReference, { EVENT: "Fetch User Details", RESPONSE: userInfo });
  if (!userInfo.success) {
    return userInfo;
  }

  let companyInfo = await registerDao.fetchDetails(apiReference, { user_id: loginInfo.user_id, fetch_company_details: true });
  logging.log(apiReference, { EVENT: "Fetch Company Details", RESPONSE: companyInfo });
  if (!companyInfo.success) {
    return companyInfo;
  }

  if (!_.isEmpty(userInfo.data)) {
    loginInfo.account_type = registerConstants.ACCOUNT_TYPE.PERSONAL;
  } else {
    loginInfo.account_type = registerConstants.ACCOUNT_TYPE.COMPANY;
  }

  let data = {
    name: loginInfo.name,
    email: loginInfo.email,
    phone_number: loginInfo.phone_number,
    country_code: loginInfo.country_code,
    username: loginInfo.username,
    account_type: loginInfo.account_type,
    is_registration_completed: loginInfo.is_registration_completed
  }

  if (!loginInfo.is_registration_completed) {
    response.data = data;
    response.error = responseConstants.responseMessages.INCOMPLETE_REGISTRATION;
    return response;
  }

  // Checking Device Version
  if(opts.device_details){
    logging.log(apiReference, {EVENT: "Device Details Check", DEVICE_DETAILS: opts.device_details});
    let details = opts.device_details;
    try{
      details = JSON.parse(details);
    }
    catch(e){
      logging.logError(apiReference, details);
    }

    let device_details = await appVersionService.checkDeviceVersion(apiReference, details, {device_type: details.device_type});
    logging.log(apiReference, {EVENT: "Device Details Check Version Response", RESPONSE: device_details});
    if(!_.isEmpty(device_details)){
      loginInfo.is_update_available = device_details.is_update_available;
      loginInfo.app_url = device_details.app_url;
    }
  }


  // CHECKING IF NODE IS CREATED OR NOT

  if (!loginInfo.is_node_created) {
    // --------- CREATE NEW NODE IN NEO4J--------------

    let creatingNewNodeResp = await networkingService.creatingNewNode(apiReference, loginInfo);
    logging.log(apiReference, { EVENT: "Insert User Node Details", RESPONSE: creatingNewNodeResp });
    if (creatingNewNodeResp.success) {
      loginInfo.is_node_created = true;
    }
  }

  let tokenResponse = await module.exports.createJwtToken(apiReference, opts, loginInfo)
  if (!tokenResponse.success)
    return tokenResponse;

  loginInfo["access-token"] = tokenResponse.data


  // -----------INSERTING LOCATION LOGS -------------
  opts.trigger = responseConstants.LOCATION_TRIGGER.LOGIN_VIA_OTP
  opts.user_id = loginInfo.user_id;
  let insertLocationLogs = await registerService.insertLocationLogs(apiReference, opts)
  logging.log(apiReference, { EVENT: "insert location logs Response", insertLocationLogs });
  if (!insertLocationLogs.success) {
    return insertLocationLogs;
  }


  // -----------UPDATING USER PROFILE -------------
  let updateObj = {
    otp_code: null,
    otp_sent_at: null,
    is_node_created: loginInfo.is_node_created,
    timezone: opts.timezone,
    timezone_offset: opts.timezone_offset
  }

  let updateResponse = await registerDao.updateDetails(apiReference, updateObj, { user_id: loginInfo.user_id });
  logging.log(apiReference, { EVENT: "Update User Details", RESPONSE: updateResponse });
  if (!updateResponse.success)
    return updateResponse;

  delete loginInfo.is_node_created;
  delete loginInfo.device_details_id;
  delete loginInfo.otp_code;
  delete loginInfo.otp_sent_at;
  delete loginInfo.password;

  response.success = true;
  response.data = { ...loginInfo };
  return response;
};


/**
 * Login With Access-Token Service
 * @param  apiReference -> Module Name 
 * @param  opts         -> Request Body Values
 * @returns 
 */


exports.loginViaAccessToken = async (apiReference, opts) => {
  let response = { success: false };
  logging.log(apiReference, { EVENT: "Login Via Access Token Service", OPTS: opts });

  // Get User Details
  let loginInfo = await registerDao.fetchDetails(apiReference, {
    ...opts,
    fetch_personal_details  : opts.account_type === registerConstants.ACCOUNT_TYPE.PERSONAL ? true : false,
    fetch_company_details   : opts.account_type === registerConstants.ACCOUNT_TYPE.COMPANY ? true : false,
  });
  logging.log(apiReference, {EVENT: "Fetch User Details", RESPONSE: loginInfo});

  if(!loginInfo.success){
    return loginInfo;
  }
  if(_.isEmpty(loginInfo.data)){
    response.error = responseConstants.responseMessages.USER_NOT_FOUND;
    return response;
  }

  loginInfo = loginInfo.data[0];

  if(!loginInfo.is_active){
    response.error = responseConstants.responseMessages.ACCOUNT_INACTIVE;
    return response;
  }

  loginInfo.account_type = opts.account_type;
  loginInfo.device_details_id = opts.device_details_id;

  let tokenResponse  = await jwtService.createJWT(apiReference, loginInfo);
  await redisLib.set(apiReference, opts.user_id + "_" + opts.device_details_id, tokenResponse);

  loginInfo["access-token"] = tokenResponse;

  // Checking Device Version
  let details = opts.device_details;
  try{
    details = JSON.parse(details);
  }
  catch(e){
    logging.logError(apiReference, details);
  }
  // let details = JSON.parse(opts.device_details);
  let device_details = await appVersionService.checkDeviceVersion(apiReference, opts.device_details, {device_type: details.device_type});
  logging.log(apiReference, {EVENT: "Device Details Check Version Response", RESPONSE: device_details});
  if(!_.isEmpty(device_details)){
    loginInfo.is_update_available = device_details.is_update_available;
    loginInfo.app_url = device_details.app_url;
  }

  // -----------UPDATING USER PROFILE -------------
  let updateObj = {
    timezone: opts.timezone,
    timezone_offset: opts.timezone_offset
  }

  let updateResponse = await registerDao.updateDetails(apiReference, updateObj, { user_id: opts.user_id });
  logging.log(apiReference, { EVENT: "Update User Details", RESPONSE: updateResponse });
  if(!updateResponse.success){
    return updateResponse;
  }

  // -----------INSERTING LOCATION LOGS -------------
  opts.trigger = responseConstants.LOCATION_TRIGGER.LOGIN_VIA_ACCESS_TOKEN;
  let insertLocationLogs = await registerService.insertLocationLogs(apiReference, opts);
  logging.log(apiReference, { EVENT: "insert location logs Response", insertLocationLogs });
  if (!insertLocationLogs.success) {
    return insertLocationLogs;
  }

  delete loginInfo.password;
  delete loginInfo.is_node_created;
  delete loginInfo.device_details_id;

  response.success = true;
  response.data    = {...loginInfo};
  return response;
};


/**
 * Logout Service
 * @param  apiReference -> Module Name 
 * @param  opts         -> Request Body Values
 * @returns 
 */

exports.logout = async (apiReference, opts) => {
  logging.log(apiReference, { EVENT: "logout service", opts });
  let response = { success: false }

  let key = opts.user_id;
  if (opts.device_details_id) {
    key += "_" + opts.device_details_id;
  }
  let deleteKeyFromRedis = await loginTokenService.deleteFromCache(apiReference, key);
  logging.log(apiReference, { EVENT: "Delete Key From Redis Response", deleteKeyFromRedis });

  // -----------Deleting Device Details  -------------

  if (opts.device_details_id) {
    let updateObj = {
      is_deleted: 1
    };
    let updateResponse = await registerDao.updateDetails(apiReference, updateObj, opts, "tb_device_details");
    logging.log(apiReference, { EVENT: "Update User Details", RESPONSE: updateResponse });
    if (!updateResponse.success) {
      return updateResponse;
    }
  }

  response.success = true;
  return response;
}



/**
 * Logout From All Devices Service
 * @param  apiReference -> Module Name 
 * @param  opts         -> Request Body Values
 * @returns 
 */


exports.logoutAll = async (apiReference, opts) => {
  logging.log(apiReference, { EVENT: "logout from all devices service", opts });
  let response = { success: false };

  let deleteKeyFromRedis = [];
  let deleteDeviceIds = [];

  // LOGOUT FROM WEB IF LOGIN FROM APP
  if (opts.device_details_id || opts.reset_password) {
    let temp = opts.user_id;
    deleteKeyFromRedis.push(temp);
  }

  let fetchResponse = await loginDao.fetchDeviceDetails(apiReference, { user_id: opts.user_id });
  logging.log(apiReference, { EVENT: "fetch user Response", fetchResponse });
  if (!fetchResponse.success) {
    return fetchResponse
  }
  fetchResponse = fetchResponse.data;

  if (!_.isEmpty(fetchResponse)) {
    fetchResponse.forEach((data) => {
      if (opts.device_details_id != data.detail_id || opts.delete_profile) {
        let temp = opts.user_id + "_" + data.detail_id;
        deleteKeyFromRedis.push(temp);
        deleteDeviceIds.push(data.detail_id);
      }
    })
  }

  if (!_.isEmpty(deleteKeyFromRedis)) {
    // DELETING DEVICE DETAILS FROM CACHE
    for(let i=0; i<deleteKeyFromRedis.length; i++) {
      let multipleDelResponse = await loginTokenService.deleteMultipleFromCache(apiReference, deleteKeyFromRedis[i])
      logging.log(apiReference, { EVENT: "multiple delete Response", multipleDelResponse });
    }
  }

  // DELETING DEVICE DETAILS FROM DB
  if (!_.isEmpty(deleteDeviceIds)) {
    let updateObj = {
      is_deleted: 1
    }
    let updateResponse = await registerDao.updateDetails(apiReference, updateObj, { user_id: opts.user_id, deleteDeviceIds }, "tb_device_details");
    logging.log(apiReference, { EVENT: "Update User Details", RESPONSE: updateResponse });
    if (!updateResponse.success) {
      return updateResponse;
    }
  }

  response.success = true;
  return response;
}



/**
 * Creating JWT TOKEN Service
 * @param  apiReference -> Module Name 
 * @param  opts         -> Request Body Values
 * @param  userDetails  -> User Details
 * @param  time         -> Expiry Time for Token
 * @returns 
 */


exports.createJwtToken = async (apiReference, opts, userDetails, time) => {
  logging.log(apiReference, { EVENT: "createJwtToken service", opts, userDetails, time });
  let response = { success: false };

  let tokenResponse;
  let tokenKey;

  if (opts.device_details) {
    let insertObj = {
      user_id: userDetails.user_id,
      device_details: JSON.stringify(opts.device_details)
    };
    let insertDaoResponse = await registerDao.insertDetails(apiReference, insertObj, "tb_device_details")
    logging.log(apiReference, { EVENT: "insert device_details Response", insertDaoResponse });
    if (!insertDaoResponse.success) {
      return insertDaoResponse;
    }
    userDetails.device_details_id = insertDaoResponse.data.insertId;
    tokenKey = userDetails.user_id + "_" + userDetails.device_details_id;
    tokenResponse = await loginTokenService.setupJWTToken(apiReference, { fetchResponse: userDetails, tokenKey }, time);
  } else {
    opts.web = true;
    tokenKey = userDetails.user_id;
    tokenResponse = await loginTokenService.setupJWTToken(apiReference, { fetchResponse: userDetails, tokenKey }, time);
  }

  response.success = true;
  response.data = tokenResponse;
  return response;
}


/**
 * User Search Service
 * @param  apiReference -> Module Name 
 * @param  opts         -> Request Body Values
 * @returns 
 */


exports.search = async (apiReference, opts) => {
  let response = { success: false };
  logging.log(apiReference, { EVENT: "Search User Service", OPTS: opts });

  if (opts.ignore_connections) {
    let fetchConnectionStatus = await networkingService.fetchConnectionStatus(apiReference, {
      ...opts,
      fetch_all_request: true
    });
    logging.log(apiReference, { EVENT: "Fetch Connection Status", RESPONSE: fetchConnectionStatus });

    if (!fetchConnectionStatus.success) {
      return fetchConnectionStatus;
    }

    if(!_.isEmpty(fetchConnectionStatus.data)){
      fetchConnectionStatus = fetchConnectionStatus.data;
      opts.user_id_ne = _.uniq(fetchConnectionStatus.filter(resp => Object.values(loginConstants.REQUEST_STATUS).includes(resp.request_status)).map(resp => resp.requesting_user_id));
    }
  }

  if(opts.user_id && opts.fetch_following_users){
    opts.following_user_id = opts.user_id;
  }

  if(opts.user_id_ne){
    opts.user_id_ne.push(opts.user_id);
  } 
  // else{
  //   opts.user_id_ne = opts.user_id;
  // }
  delete opts.user_id;

  opts.fetch_onboarding_completed = true;
  opts.user_visibility_enabled = true;
  let fetchResponse = await registerDao.fetchDetails(apiReference, opts);
  logging.log(apiReference, { EVENT: "Fetch User Details", RESPONSE: fetchResponse });
  if (!fetchResponse.success) {
    return fetchResponse;
  }

  if (_.isEmpty(fetchResponse.data)) {
    response.no_data_found = true;
    response.error = responseConstants.responseMessages.USER_NOT_FOUND;
    return response;
  }

  // fetch Users count.
  let fetchCountResponse = await registerDao.fetchDetails(apiReference, {fetch_count: true, ...opts});
  logging.log(apiReference, {EVENT: "Fetch Subscription Count", RESPONSE: fetchCountResponse});
  if(!fetchCountResponse.success){
    return fetchCountResponse;
  }
  if (_.isEmpty(fetchCountResponse.data)) {
    response.error = responseConstants.responseMessages.NOT_FOUND;
    return response;
  }

  fetchCountResponse=fetchCountResponse.data[0];

  if (!opts.account_type) {
    fetchResponse = await fetchAllUsers(apiReference, opts);
    logging.log(apiReference, { EVENT: " Fetch All Users ", fetchResponse });
    if (!fetchResponse.success)
      return fetchResponse;
  }

  fetchResponse = fetchResponse.data;
  
  for(let res of fetchResponse){
    delete res.is_node_created;
    delete res.device_details_id;
    delete res.otp_code;
    delete res.otp_sent_at;
    delete res.password;

    // industry details
    if(opts.fetch_industry){
      let fetchIndustries = await industryDao.fetchDetails(apiReference, {user_id: res.user_id});
      logging.log(apiReference, { EVENT : "Fetch Industry", fetchIndustries});
      if(!fetchIndustries.success)
        return fetchIndustries;

      res.industry = fetchIndustries.data;
    }
  }

  response.success = true;
  response.data = {
    count: fetchCountResponse.count,
    data: fetchResponse
  };
  // response.data = fetchResponse;
  return response;
};


/**
 * Fetch All Users Service
 * @param  apiReference -> Module Name 
 * @param  opts         -> Request Body Values
 * @returns 
 */


const fetchAllUsers = async (apiReference, opts) => {
  const response = { success: false };


  // FETCH PERSONAL ACCOUNT DETAILS

  let fetchPersonalAccount = await registerDao.fetchDetails(apiReference, { ...opts, fetch_personal_details: true });
  logging.log(apiReference, { EVENT: "Fetch Personal User Details", RESPONSE: fetchPersonalAccount });
  if (!fetchPersonalAccount.success) {
    return fetchPersonalAccount;
  }

  if (!_.isEmpty(fetchPersonalAccount.data)) {
    fetchPersonalAccount.data.forEach(res => {
      res.account_type = registerConstants.ACCOUNT_TYPE.PERSONAL
    })
  }

  // FETCH COMPANY ACCOUNT DETAILS

  let fetchCompanyAccounts = await registerDao.fetchDetails(apiReference, { ...opts, fetch_company_details: true });
  logging.log(apiReference, { EVENT: "Fetch Company Details", RESPONSE: fetchCompanyAccounts });
  if (!fetchCompanyAccounts.success) {
    return fetchCompanyAccounts;
  }

  if (!_.isEmpty(fetchCompanyAccounts.data)) {
    fetchCompanyAccounts.data.forEach(res => {
      res.account_type = registerConstants.ACCOUNT_TYPE.COMPANY
    })
  }

  response.data = [...fetchPersonalAccount.data, ...fetchCompanyAccounts.data];
  response.success = true;
  return response;
}