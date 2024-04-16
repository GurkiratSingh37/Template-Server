const logging            = require('../../../logging/logging');
const dbHandler          = require('../../../database/mysqllib');



/**
 * Fetching Details From Database
 * @param  apiReference - > Module Name
 * @param  opts         - > Where Condition Values 
 * @returns 
 */


exports.fetchDeviceDetails = async (apiReference, opts) => {
  let response = { success : false };
  logging.log(apiReference, {"EVENT" : "fetchDetail DAO", opts});

  let query = `SELECT detail_id FROM tb_device_details WHERE is_deleted = 0 `;
  let values = [];
  
  if(opts.user_id){
    query+= " AND user_id " + ( Array.isArray(opts.user_id)  ? " IN (?)" : " = ?" ) ;
    values.push(opts.user_id);
  }
  let queryResponse = await dbHandler.executeQuery(apiReference, "fetch Details", query, values);
  if (queryResponse.ERROR){
    response.success = false;
    response.error   = queryResponse.ERROR;
    return response;
  }
  response.success = true;
  response.data    = queryResponse;
  return response;
};

