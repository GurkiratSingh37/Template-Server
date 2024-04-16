/**
 * Created by Vaibhav Kaushal on 25th May 2023
 */

'use strict';

const Joi                                         = require('joi');

const logging                                     = require('./../logging/logging');
const responses                                   = require('./../responses/responses');

const headersStructure = Joi.object().keys({
  "access-token"    : Joi.string().required()
});

const joiValidate = async (apiReference, body, schema, options, res, msg)=>{
  logging.log(apiReference, {EVENT: "validateFields", BODY: body});

  try {
    let validation = await schema.validateAsync(body, options);
    logging.log(apiReference, { validationResp: validation });
    return true;
  } catch (error) {
    logging.logError(apiReference, error);
    responses.parameterMissingResponse(res, error.details[0].message);
    return false;
  }
};


const validateObject = async (apiReference, body, schema, options, msg)=>{
  let response = {success: false};
  logging.log(apiReference, {EVENT: "validateObject", BODY: body});
  let validation = await schema.validateAsync(body, options);

  logging.log(apiReference, { EVENT: "Post Validation", validation });

  if (validation.error) {
    let errorReason = validation.error.details !== undefined
      ? (msg ? msg : validation.error.details[0].message)
      : 'Parameter missing or parameter type is wrong';
    logging.log(apiReference, validation.error.details);
    response.error = errorReason;
    return response;
  }
  response.success = true;
  return response;
};

/**
 * @param apiReference
 * @param req
 * @param body
 * @param res
 * @param schema
 * @param msg
 * @returns {boolean}
 */
const validateFields = async (apiReference, req, body, res, schema, headerSchema = headersStructure, msg) => {
  const authValid = await joiValidate(
    apiReference,
    {...req.headers},
    headerSchema,
    {allowUnknown: true},
    res,
    "Header parameter missing or parameter type is wrong."
  );
  return authValid && await joiValidate(apiReference, body, schema, {allowUnknown: false}, res, msg)
};


exports.validateObject                            = validateObject;
exports.validateFields                            = validateFields;
