'use strict';

const logging                         = require('../../../logging/logging');
const passwordService                 = require('../services/passwordService');
const responses                       = require('../../../responses/responses');
const registerConstants               = require("../../register/properties/registerConstants");

/**
 * Forget Password Controller
 * @param {*} req 
 * @param {success : true, data : []} res 
 * @returns 
 */

exports.forgotPassword = async (req, res) => {
  const apiReference = req.apiReference;
  const requestBody = { ...req.body };
  try {
    let response = await passwordService.forgotPassword(apiReference, requestBody);
    logging.log(apiReference, { serviceResponse: response });

    if (response.success) {
      return responses.success(res, response.data);
    }
    return responses.failure(res, {}, response.error);
  } catch (error) {
    logging.logError(apiReference, { EVENT: "Forgot Password ERROR", ERROR: error, STACK: error.STACK });
    return responses.internalServerError(res);
  }
};

/**
 * Reset Password Controller
 * @param {*} req 
 * @param {success : true, data : []} res 
 * @returns 
 */

exports.resetPassword = async (req, res) => {
  const apiReference = req.apiReference;
  const requestBody = { ...req.body };
  const cache = { ...res.locals };

  try {
    requestBody.user_id = cache.auth_details.user_id;

    let response = await passwordService.resetPassword(apiReference, requestBody);
    logging.log(apiReference, { serviceResponse: response });

    if (response.success) {
      return responses.success(res, response.data, response.message);
    }
    return responses.failure(res, {}, response.error);
  } catch (error) {
    logging.logError(apiReference, { EVENT: "Reset Password ERROR", ERROR: error, STACK: error.STACK });
    return responses.internalServerError(res);
  }
};


exports.forgotUsername = async(req, res)=>{
  let apiReference = req.apiReference;
  let requestBody = {...req.body};
  let cacheData = {...res.locals};
  try{
    const response = await passwordService.forgotUsername(apiReference, requestBody);
    logging.log(apiReference, {serviceResponse: response});

    if(response.success){
      return responses.success(res, response.data);
    }
    
    return responses.failure(res, {}, response.error);
  }
  catch(err){
    logging.logError(apiReference, {EVENT: "Forgot Username ERROR", ERROR: err, STACK: err.stack});
    return responses.internalServerError(res);
  }
}