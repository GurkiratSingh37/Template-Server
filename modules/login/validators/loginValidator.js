'use strict';

const Joi                             = require('joi');
const constants                       = require('../../../responses/responseConstants');
const validator                       = require('../../../validators/joiValidator');
const apiReferenceModule              = constants.modules.LOGIN;
const registerConstants               = require('../../register/properties/registerConstants')

const emptyHeaderStructure            = Joi.object().keys({});


/**
 * Send Otp Validator
 * @param req = Request from external
 * @param {success : true, data : []} res = Response
 * @param next = next of function
 */

const sendOTP =async (req, res, next) => {
  req.apiReference = {
    module: apiReferenceModule,
    api   : "sendOTP"
  };
  let schema =  Joi.object().keys ({
    phone_number    : Joi.number().strict().max(999999999999999).optional(),
    country_code    : Joi.string().trim().max(5).when('phone_number', {
      is        : Joi.exist(),
      then      : Joi.required(),
      otherwise : Joi.optional()
    }),
    email           : Joi.string().email().trim().optional(),
    username        : registerConstants.USER_NAME_VALIDATION.optional(),
    is_resend       : Joi.boolean().optional()
  }).or('email', 'phone_number','username').required();

  let reqBody = { ... req.body };
  let request = { ... req };
  let validFields = await validator.validateFields(req.apiReference, request, reqBody, res, schema,emptyHeaderStructure);
  if(validFields){
    next();
  }
};

/**
 * Login With Password Validator
 * @param req = Request from external
 * @param {success : true, data : []} res = Response
 * @param next = next of function
 */

const login = async (req, res, next) => {
  req.apiReference = {
    module        : apiReferenceModule,
    api           : "login"
  };

  const schema = Joi.object().keys({
    username        : registerConstants.USER_NAME_VALIDATION.optional(),
    phone_number    : Joi.number().strict().max(999999999999999).optional(),
    country_code    : Joi.string().trim().max(5).when('phone_number', {
      is        : Joi.exist(),
      then      : Joi.required(),
      otherwise : Joi.optional()
    }),
    email           : Joi.string().email().trim().optional(),
    password        : Joi.string().trim().required(),
    timezone        : Joi.string().required(),
    timezone_offset : Joi.number().strict().required(),
    device_details  : registerConstants.DEVICE_DETAIL_FIELDS.optional(),
    lat             : Joi.number().strict().min(-90).max(90).required(),
    lng             : Joi.number().strict().min(-180).max(180).required()
  }).or('email', 'username','phone_number').required();

  let reqBody     = { ... req.body };
  let request     = { ... req, headers: req.headers };

  let validFields = await validator.validateFields(req.apiReference, request, reqBody, res, schema,emptyHeaderStructure);
  if (validFields) {
    next();
  }
};

/**
 * Login Via Access-Token Validator
 * @param req = Request from external
 * @param {success : true, data : []} res = Response
 * @param next = next of function
 */

const loginViaAccessToken = async (req, res, next) => {
  req.apiReference = {
    module: apiReferenceModule,
    api   : "loginViaAccessToken"
  };
  let schema =  Joi.object().keys ({
    timezone        : Joi.string().required(),
    timezone_offset : Joi.number().strict().required(),
    device_details  : registerConstants.DEVICE_DETAIL_FIELDS.required(),
    lat             : Joi.number().strict().min(-90).max(90).required(),
    lng             : Joi.number().strict().min(-180).max(180).required(),
  });

  let reqBody     = { ... req.body };
  let request     = { ...req, headers: req.headers };
  let validFields = await validator.validateFields(req.apiReference, request, reqBody, res, schema);
  if(validFields){
    next();
  }
};

/**
 * Login Via OTP Validator
 * @param req = Request from external
 * @param {success : true, data : []} res = Response
 * @param next = next of function
 */

const loginViaOTP = async (req, res, next) => {
  req.apiReference = {
    module: apiReferenceModule,
    api   : "loginViaOTP"
  };
  let schema =  Joi.object().keys ({
    phone_number    : Joi.number().strict().max(999999999999999).optional(),
    country_code    : Joi.string().trim().max(5).when('phone_number', {
      is        : Joi.exist(),
      then      : Joi.required(),
      otherwise : Joi.optional()
    }),
    username        : registerConstants.USER_NAME_VALIDATION.optional(),
    email           : Joi.string().email().trim().optional(),
    otp_code        : Joi.string().length(4).required(),
    timezone        : Joi.string().required(),
    timezone_offset : Joi.number().strict().required(),
    device_details  : registerConstants.DEVICE_DETAIL_FIELDS.optional(),
    lat             : Joi.number().strict().min(-90).max(90).required(),
    lng             : Joi.number().strict().min(-180).max(180).required()
  }).or('email', 'phone_number','username').required();
  let reqBody = { ... req.body };
  let request = { ...req, headers: req.headers };
  let validFields = await validator.validateFields(req.apiReference, request, reqBody, res, schema, emptyHeaderStructure);
  if(validFields){
    next();
  }
};

/**
 * Logout Validator
 * @param req = Request from external
 * @param {success : true, data : []} res = Response
 * @param next = next of function
 */

const logout = async (req, res, next) => {
  req.apiReference = {
    module        : apiReferenceModule,
    api           : "logout"
  };

  const schema = Joi.object().keys({});

  let reqBody     = { ... req.body };
  let request     = { ... req, headers: req.headers };

  let validFields = await validator.validateFields(req.apiReference, request, reqBody, res, schema);
  if (validFields) {
    next();
  }
};

/**
 * Logout From All Devices Validator
 * @param req = Request from external
 * @param {success : true, data : []} res = Response
 * @param next = next of function
 */

const logoutAll = async (req, res, next) => {
  req.apiReference = {
    module        : apiReferenceModule,
    api           : "logoutAll"
  };

  const schema = Joi.object().keys({});

  let reqBody     = { ... req.body };
  let request     = { ... req, headers: req.headers };

  let validFields = await validator.validateFields(req.apiReference, request, reqBody, res, schema);
  if (validFields) {
    next();
  }
};

/**
 * Forget Password Validator
 * @param req = Request from external
 * @param {success : true, data : []} res = Response
 * @param next = next of function
 */

const forgotPassword = async (req, res, next) => {
  req.apiReference = {
    module            : apiReferenceModule,
    api               : "forgotPassword"
  };

  let schema = Joi.object().keys({
    email           : Joi.string().email().optional(),
    phone_number    : Joi.number().strict().max(999999999999999).optional(),
    country_code    : Joi.string().trim().max(5).when('phone_number', {
      is        : Joi.exist(),
      then      : Joi.required(),
      otherwise : Joi.optional()
    }),
    username        : registerConstants.USER_NAME_VALIDATION.optional()
  }).or('email', 'phone_number','username').required();

  let reqBody     = { ... req.body };
  let request     = { ... req, headers: req.headers };

  let validFields = await validator.validateFields(req.apiReference, request, reqBody, res, schema, emptyHeaderStructure);
  if (validFields) {
    next();
  }
};


/**
 * Reset Password Validator
 * @param req = Request from external
 * @param {success : true, data : []} res = Response
 * @param next = next of function
 */

const resetPassword = async (req, res, next) => {
  req.apiReference = {
    module            : apiReferenceModule,
    api               : "resetPassword"
  };

  let schema = Joi.object().keys({
    new_password    : Joi.string().required(),
    logout_all      : Joi.boolean().optional()
  });

  let reqBody     = { ... req.body };
  let request     = { ... req, headers: req.headers };

  let validFields = await validator.validateFields(req.apiReference, request, reqBody, res, schema);
  if(validFields){
    res.locals.bypass_reset_password = 1;
    next();
  }
};

/**
 * User Search  Validator
 * @param req = Request from external
 * @param {success : true, data : []} res = Response
 * @param next = next of function
 */

const search = async (req, res, next) => {
  req.apiReference = {
    module        : apiReferenceModule,
    api           : "search"
  };
  if(req.query.search){
    req.query.search = req.query.search.toString();
  }

  let schema =  Joi.object().keys ({
    user_id                 : Joi.number().strict().optional(),
    account_type            : Joi.number().strict().valid(1, 2).optional(),
    search                  : Joi.string().trim().optional(),
    limit                   : Joi.number().strict().required(),
    skip                    : Joi.number().strict().required(),
    user_id_ne              : Joi.array().items(
      Joi.number().strict().required()
    ).optional(),
    ignore_connections      : Joi.boolean().optional(),
    fetch_connection_status : Joi.boolean().optional(),
    fetch_following_users   : Joi.boolean().optional(),
    company_id              : Joi.number().strict().optional(),
    tags                    : Joi.array().items(Joi.number().strict().required()).optional(),
    fetch_industry          : Joi.boolean().optional(),
  });
  let reqBody     = { ... req.query };
  let request     = { ... req, headers: req.headers };
  let validFields = await validator.validateFields(req.apiReference, request, reqBody, res, schema);
  if (validFields) {
    next();
  }
};

const forgotUsername = async (req, res, next) => {
  req.apiReference = {
    module  : apiReferenceModule,
    api     : "forgotUsername"
  };

  let schema = Joi.object().keys({
    email           : Joi.string().email().optional(),
    phone_number    : Joi.number().strict().max(999999999999999).optional(),
    country_code    : Joi.string().trim().max(5).when('phone_number', {
      is        : Joi.exist(),
      then      : Joi.required(),
      otherwise : Joi.optional()
    })
  }).or('email', 'phone_number').required();

  let reqBody = {...req.body};
  let request = {...req, headers: req.headers };

  let validFields = await validator.validateFields(req.apiReference, request, reqBody, res, schema, emptyHeaderStructure);
  if (validFields) {
    next();
  }
};

exports.sendOTP                 = sendOTP;
exports.login                   = login;
exports.loginViaOTP             = loginViaOTP;
exports.loginViaAccessToken     = loginViaAccessToken;
exports.logout                  = logout;
exports.logoutAll               = logoutAll;
exports.forgotPassword          = forgotPassword;
exports.resetPassword           = resetPassword;
exports.search                  = search;
exports.forgotUsername          = forgotUsername;