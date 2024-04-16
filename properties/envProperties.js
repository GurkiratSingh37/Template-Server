/**
 * Created by Vaibhav Kaushal on 25th May 2023
 */

'use strict';

const config                          = require('config');

exports.port  = process.env.PORT || config.get("PORT");
