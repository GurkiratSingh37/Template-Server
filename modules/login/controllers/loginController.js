"use strict";

const logging                       = require('../../../logging/logging');
const responses                     = require('../../../responses/responses');
const responseConstants             = require('../../../responses/responseConstants');
const loginService                  = require('../services/loginService');
const registerService               = require('../../register/services/registerService')
const envProperties                 = require('../../../properties/envProperties')
const stringUtility                 = require('../../../utility/stringsUtility');
const loginConstants                = require('../properties/loginConstants');
const onboardingConstants           = require('../../register/properties/registerConstants');


/**
 * Send Otp Controller
 * @param {*} req 
 * @param {success : true, data : []} res 
 * @returns 
 */

exports.sendOTP = async (req, res) => {
  let apiReference = req.apiReference;
  const requestBody = { ...req.body };

  try {
    const country_code = req.body.country_code;
    const phone_number = req.body.phone_number;
    const defaultOTP = "1234";
    let WITHIN_SAMPLE_NUMBERS = false;

    if (loginConstants.SAMPLE_NUMBERS.includes((country_code + phone_number)))
      WITHIN_SAMPLE_NUMBERS = true;

    requestBody.otp_code = envProperties.isEnvLiveOrBeta() ? WITHIN_SAMPLE_NUMBERS ? defaultOTP : stringUtility.getRandomCode(4, 1) : defaultOTP;

    const response = await registerService.sendOtp(apiReference, requestBody);

    if (response.no_data_found) {
      return responses.noDataFound(res, {}, response.error);
    }

    if (!response.success) {
      return responses.failure(res, {}, response.error || responseConstants.responseMessages.USER_NOT_FOUND);
    }
    return responses.success(res, {}, responseConstants.responseMessages.OTP_SUCCESS);
  } catch (error) {
    logging.logError(apiReference, { EVENT: "sendOTP ERROR", ERROR: error, STACK: error.stack });
    return responses.internalServerError(res);
  }
};


/**
 * Login With Password Controller
 * @param {*} req 
 * @param {success : true, data : []} res 
 * @returns 
 */

exports.login = async (req, res) => {
  const apiReference = req.apiReference;
  const requestBody = { ...req.body };

  try {
    const response = await loginService.login(apiReference, requestBody);
    logging.log(apiReference, { finalResponse: response });

    if (response.success) {
      return responses.success(res, response.data);
    }
    if (response.no_data_found)
      return responses.noDataFound(res, {}, response.error);

    return responses.failure(res, response.data || {}, response.error);
  } catch (error) {
    logging.logError(apiReference, { EVENT: "Login User ERROR", ERROR: error, STACK: error.stack });
    return responses.internalServerError(res);
  }
};

/**
 * Login Via OTP Controller
 * @param {*} req 
 * @param {success : true, data : []} res 
 * @returns 
 */

exports.loginViaOTP = async (req, res) => {
  let apiReference = req.apiReference;
  const requestBody = { ...req.body };

  try {
    const response = await loginService.loginViaOTP(apiReference, requestBody);
    logging.log(apiReference, { finalResponse: response });

    if (response.no_data_found)
      return responses.noDataFound(res, {}, response.error);

    if (!response.success) {
      return responses.failure(res, response.data || {}, response.error);
    }

    return responses.success(res, response.data);
  } catch (error) {
    logging.logError(apiReference, { EVENT: "login via OTP ERROR", ERROR: error, STACK: error.stack });
    return responses.internalServerError(res);
  }
};

/**
 * Login With Access-Token Controller
 * @param {*} req 
 * @param {success : true, data : []} res 
 * @returns 
 */

exports.loginViaAccessToken = async (req, res) => {
  let apiReference = req.apiReference;
  const cacheData = { ...res.locals };
  const requestBody = { ...req.body };

  try {
    requestBody.user_id = cacheData.auth_details.user_id;
    requestBody.account_type = cacheData.auth_details.account_type;
    requestBody.device_details_id = cacheData.auth_details.device_details_id;

    let serviceResponse = await loginService.loginViaAccessToken(apiReference, requestBody);
    logging.log(apiReference, { EVENT: "Service Response", serviceResponse });
    if (!serviceResponse.success)
      return responses.failure(res, {}, serviceResponse.error);

    return responses.success(res, serviceResponse.data);
  } catch (error) {
    logging.logError(apiReference, { EVENT: "login via otp ERROR", ERROR: error, STACK: error.stack });
    return responses.internalServerError(res);
  }
};

/**
 * Logout Controller
 * @param {*} req 
 * @param {success : true, data : []} res 
 * @returns 
 */

exports.logout = async (req, res) => {
  const apiReference = req.apiReference;
  const requestBody = { ...req.body };
  const cache = { ...res.locals };

  try {
    requestBody.user_id = cache.auth_details.user_id;
    requestBody.device_details_id = cache.auth_details.device_details_id;

    const response = await loginService.logout(apiReference, requestBody);
    logging.log(apiReference, { serviceResponse: response });

    if (response.success) {
      return responses.success(res, response.data);
    }
    if (response.no_data_found)
      return responses.noDataFound(res, {}, response.error);

    return responses.failure(res, {}, response.error);
  } catch (error) {
    logging.logError(apiReference, { EVENT: "Logout User ERROR", ERROR: error, STACK: error.stack });
    return responses.internalServerError(res);
  }
};

/**
 * Logout From All Devices Controller
 * @param {*} req 
 * @param {success : true, data : []} res 
 * @returns 
 */

exports.logoutAll = async (req, res) => {
  const apiReference = req.apiReference;
  const requestBody = { ...req.body };
  const cache = { ...res.locals };

  try {
    requestBody.user_id = cache.auth_details.user_id;
    requestBody.device_details_id = cache.auth_details.device_details_id;

    const response = await loginService.logoutAll(apiReference, requestBody);
    logging.log(apiReference, { serviceResponse: response });

    if (response.success) {
      return responses.success(res, response.data);
    }
    if (response.no_data_found)
      return responses.noDataFound(res, {}, response.error);

    return responses.failure(res, {}, response.error);
  } catch (error) {
    logging.logError(apiReference, { EVENT: "LogoutAll  ERROR", ERROR: error, STACK: error.stack });
    return responses.internalServerError(res);
  }
};

/**
 * User Search Controller
 * @param {*} req 
 * @param {success : true, data : []} res 
 * @returns 
 */

exports.search = async (req, res) => {
  let apiReference  = req.apiReference;
  let requestBody   = { ...req.query };
  let cache         = { ...res.locals };

  try {
    if (requestBody.account_type === onboardingConstants.ACCOUNT_TYPE.PERSONAL) {
      requestBody.fetch_personal_details = true;
    } if (requestBody.account_type === onboardingConstants.ACCOUNT_TYPE.COMPANY) {
      requestBody.fetch_company_details = true;
    }

    requestBody.user_id = cache.auth_details.user_id;

    const response = await loginService.search(apiReference, requestBody);

    logging.log(apiReference, { serviceResponse: response });

    if (response.success) {
      return responses.success(res, response.data);
    }
    if(response.no_data_found){
      return responses.noDataFound(res, {}, response.error);
    }

    return responses.failure(res, {}, response.error);
  } catch (error) {
    logging.logError(apiReference, { EVENT: "Search User ERROR", ERROR: error, STACK: error.stack });
    return responses.internalServerError(res);
  }
};