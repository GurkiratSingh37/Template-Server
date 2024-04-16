/**
 * Created by Vaibhav Kaushal on 25th May 2023
 */

'use strict';

const moment                          = require('moment');


const fileSwitches  = {
  startup       : true,
  register      : true,
  login         : true,
  profile       : true,
  employment    : true,
  media         : true,
  industry      : true,
  skills        : true,
  resume        : true,
  endorsement   : true,
  themes        : true,
  modules       : true,
  identity      : true,
  activity      : true,
  images        : true,
  app_version   : true
};

const modules = {
  startup     : {
    initialize  : true
  },
  register     : {
    register        : true,
    register_verify : true,
  },
  login        : {
    sendOTP                : true,
    login                  : true,
    loginViaOTP            : true,
    loginViaAccessToken    : true,
    logout                 : true,
    logoutAll              : true,
    forgotPassword         : true,
    resetPassword          : true,
    search                 : true,
    forgotUsername         : true
  },
  profile      : {
    getProfile             : true,
    getOwnProfile          : true,
    updateProfile          : true,
    deleteProfile          : true,
    addAlternativeEmail    : true,
    verifyAlternativeEmail : true 
  },
  employment : {
    get       : true,
    create    : true,
    update    : true,
    delete    : true
  },
  media       : {
    uploadFile           : true
  },
  industry   :  {
    getUserIndustry      : true,
    getIndustry          : true,
    addIndustry          : true,
    deleteIndustry       : true
  },
  skills     :  {
    getUserSkill         : true,
    getSkill             : true,
    addSkill             : true,
    deleteSkill          : true
  },
  resume     :  {
    getResume            : true,
    addResume            : true,
    updateResume         : true,
    deleteResume         : true,
    parseResume          : true
  },
  endorsement : {
    getEndorsement       : true,
    addEndorsement       : true,
    updateEndorsement    : true,
    deleteEndorsement    : true
  },
  themes      : {
    getThemes            : true,
    selectedTheme        : true,
    createTheme          : true,
    updateTheme          : true,
    deleteTheme          : true
  },
  modules : {
    get       : true,
    create    : true,
    update    : true,
    remove    : true
  },
  identity : {
    create : true,
    get    : true,
    update : true
  },
  activity  : {
    get     : true,
    create  : true,
    publish : true
  },
  images  : {
    get     : true
  },
  app_version : {
    get : true
  }
};


const log = (apiReference, log) => {
  if (
    apiReference
    && apiReference.module
    && apiReference.api
    && fileSwitches
    && fileSwitches[apiReference.module] == true
    && modules
    && modules[apiReference.module]
    && modules[apiReference.module][apiReference.api] == true) {

    try {
      log = JSON.stringify(log);
    } catch (exception) {}
    
    console.log("-->" + moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS') + " :----: " +
      apiReference.module + " :=: " + apiReference.api + " :=: " + log);
  }
};

const logError = (apiReference, log) => {
  if (apiReference
    && apiReference.module
    && apiReference.api) {

    try {
      log = JSON.stringify(log);
    }
    catch (exception) {
    }
    console.error("-->" + moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS') + " :----: " +
      apiReference.module + " :=: " + apiReference.api + " :=: " + log);
  }
};


exports.log      = log;
exports.logError = logError;
