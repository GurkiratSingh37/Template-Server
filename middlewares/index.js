/**
 * Created by Vaibhav Kaushal on 25th May 2023
 */

'use strict';

const bodyParser              = require('body-parser');
const envProperties           = require('../properties/envProperties');
const underscore              = require('underscore');
const morgan                  = require('morgan');

global._                      = underscore;

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, access-token');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(morgan('dev'));
app.set('port', envProperties.port);
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

app.use(function (error, req, res, next) {

  if (error instanceof SyntaxError) {
    return res.sendStatus(400);
  }
  next();
});

let numberCasting = (obj)=>{
  let queryStings = Object.keys(obj);
  queryStings.forEach((key)=>{
    if(typeof obj[key] == "object"){
      obj[key] = numberCasting(obj[key]);
    } else if(!Number.isNaN(Number(obj[key]))){
      if(obj[key][0] != "+")
        obj[key] = Number(obj[key]);
    } else
      obj[key] = stringToBoolean(obj[key]);
  });
  return obj;
};

function stringToBoolean(stringValue) {
  try {
    return JSON.parse(stringValue);
  } catch (e) {
    return stringValue;
  }
}

app.use(function(req, res,next){
  if(req.query && typeof req.query == "object"){
    req.query = numberCasting(req.query)
  }
  next();
});

console.log("Server Environment Running at: ", app.get('env'), app.get('port'));