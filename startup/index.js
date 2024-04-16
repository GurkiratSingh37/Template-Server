/**
 * Created by Vaibhav Kaushal on 25th May 2023
 */

'use strict';

const apiReferenceModule      = "startup";

const logging                 = require('../logging/logging');
const httpLib                 = require('./../services/httpService');
const envProperties           = require('./../properties/envProperties');


const initializeServer = async () => {
  let apiReference = {
    module  : apiReferenceModule,
    api     : "initialize"
  };
  try {
    //initialize all db connections
    const server = await httpLib.startHttpServer(envProperties.port);
  } catch (error) {
    logging.logError(apiReference, {EVENT: "initializeServer", ERROR: error});
    throw new Error(error);
  }
};

exports.initializeServer  = initializeServer;
