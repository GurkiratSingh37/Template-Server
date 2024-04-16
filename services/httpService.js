/**
 * Created by Vaibhav Kaushal on 25th May 2023
 */

'use strict';

const http          = require('http');
const axios         = require('axios');

const logging       = require('../logging/logging');

const startHttpServer = (port) => {
  return new Promise((resolve, reject) => {
    let server = http.createServer(app).listen(port, function () {
      console.error("###################### Express App Connected ##################", app.get('port'), app.get('env'));
      resolve(server);
    });
  });
};

const sendHttpRequest = async (apiReference, opts) => {
  let response = {success: false};
  let options  = { ...  opts.options };
  let serviceResponse = {};
  logging.log(apiReference, {HTTP_REQUEST: options, CALLING_URL: '<###############################>' + options.url});
  try {
    serviceResponse = await axios(options);
    logging.log(apiReference, {HTTP_RESPONSE: serviceResponse.data});
  } catch (e) {
    console.error("error in request, options.url")
    logging.logError(apiReference, e);
    serviceResponse = e.response;

    if (!e.status && e.code === 'ETIMEDOUT') {
      e.status = 409;
      e.data = { message : "Request Timeout!" };
    }
  }
  
  if (serviceResponse.status == 200 || serviceResponse.status == 201) {
    response.status  = 200;
    response.success = true;
    response.data = serviceResponse && serviceResponse.data;
    if(response.data.data)
      response.data = response.data.data;
  } else if (serviceResponse.status == 409) {
    response.status  = 409;
    response.success = false;
    response.data = serviceResponse && serviceResponse.data && serviceResponse.data.data;
    response.error = serviceResponse && serviceResponse.data && serviceResponse.data.message;
  } else if (serviceResponse.status == 401) {
    response.status  = 401;
    response.success = false;
    response.data = serviceResponse && serviceResponse.data && serviceResponse.data.data;
    response.error = serviceResponse && serviceResponse.data && serviceResponse.data.message;
  }

  return response;
};

exports.startHttpServer       = startHttpServer;
exports.sendHttpRequest       = sendHttpRequest;