const logging              = require('../../../logging/logging');
const jwtService           = require('../../../services/jwtService');
const redisService         = require('../../../database/redislib');


/**
 * Generate JWT Token Service
 * @param  apiReference -> Module Name
 * @param  userData     -> User Details
 * @param  expiryTime   -> Expiry Time for Token
 * @returns 
 */

exports.generateJWT = async (apiReference, userData, expiryTime) => {
  return await jwtService.createJWT(apiReference, userData, expiryTime)
};

/**
 * Save to Redis Service
 * @param  apiReference -> Module Name
 * @param  key          -> Redis Key
 * @param  value        -> Redis Value
 * @returns 
 */

exports.saveToCache = async (apiReference, key, value) => {
  let result = await redisService.set(apiReference, key, value);
  logging.log(apiReference, { EVENT: "saveToCache", VAL: result });
  return result;
};

/**
 * Delete Key Redis Service
 * @param  apiReference -> Module Name
 * @param  key          -> Redis Key
 * @returns 
 */

exports.deleteFromCache = async (apiReference, key) => {
  return await redisService.del(apiReference, key)
};
  
/**
 * Delete Multiple Key Redis Service
 * @param  apiReference -> Module Name
 * @param  key          -> Redis Key
 * @returns 
 */


exports.deleteMultipleFromCache = async (apiReference , key) => {
  return await redisService.multipleDel(apiReference, key)
}


/**
 * Generate JWT Token Service
 * @param  apiReference -> Module Name
 * @param  opts         -> User Details
 * @param  time         -> Expiry Time for Token
 * @returns 
 */

exports.setupJWTToken = async (apiReference, opts,time) => {
    logging.log(apiReference, { EVENT: "fetchingDetails >> setupJWTToken :: ", OPTS: opts });
    /**
     * Creating New JWT Token
     */
    time = time || "30 days"
    const accessToken = await module.exports.generateJWT(apiReference, opts.fetchResponse, time);
    await module.exports.saveToCache(apiReference, opts.tokenKey, accessToken);
    return accessToken
};


  