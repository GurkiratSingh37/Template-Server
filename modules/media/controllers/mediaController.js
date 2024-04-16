"use strict";

const logging                       = require('./../../../logging/logging');
const responses                     = require('./../../../responses/responses');
const mediaService                  = require('../services/mediaService');


const uploadFile = async (req, res) => {
  let apiReference  = req.apiReference;
  let requestFile   = {...req.files};
  let requestBody   = {...req.body};
  try {
    // console.log("requestFile:", requestFile);
    // let response = await s3Service.uploadFile(apiReference, req.files.file, req.body.entity);
    let response = await mediaService.fileUpload(apiReference, requestFile, requestBody);
    logging.log(apiReference, { serviceResponse: response });
    
    if (response.success) {
      return responses.success(res, response.data);
    }

    return responses.failure(res, {}, response.error);
  } catch (error) {
    logging.logError(apiReference, {EVENT: "media upload ERROR", ERROR: error, STACK: error.stack});
    return responses.internalServerError(res);
  }
};


exports.uploadFile                  = uploadFile;
