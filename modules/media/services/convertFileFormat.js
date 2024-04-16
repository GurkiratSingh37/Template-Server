"use strict";

const logging                = require('../../../logging/logging');
const stringsUtility         = require('../../../utility/stringsUtility');

const fs = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');
const unzipper = require('unzipper');
const AdmZip = require('adm-zip');

// Promisify fs.rename and exec functions
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);

exports.init = async (req, res, next) => {
  let apiReference  = req.apiReference;
  let requestFile   = {...req.files};
  console.log("requestFile:", requestFile);
  try {
    if(requestFile.mainTemplate.path.includes('.docx')) {
      logging.log(apiReference, {EVENT: "File Conversion .docx to xml", requestFile: requestFile});
      console.log("requestFile.file.path: ",requestFile.mainTemplate.path);
      
      // Rename .docx to .zip
      const zipFilePath = requestFile.mainTemplate.path.replace('.docx', '.zip');
      await rename(requestFile.mainTemplate.path, zipFilePath);

      let outputFilename  = '/tmp/' + requestFile.mainTemplate.originalFilename.replace(".docx","")

      // Read the zip file
      const zip = new AdmZip(zipFilePath);

      // Extract the contents
      zip.extractAllTo(outputFilename, true /*overwrite*/);

      // outputFilename = outputFilename+"/word/document.xml";

      console.log('Extraction and work completed successfully.');
      console.log("requestFile.mainTemplate.path: ",requestFile.mainTemplate.path);
      console.log("outputFilename", outputFilename)

      requestFile.mainTemplate.path = outputFilename;

    }

    if(requestFile.subTemplate1.path.includes('.docx')) {
      logging.log(apiReference, {EVENT: "File Conversion .docx to xml", requestFile: requestFile});
      console.log("requestFile.file.path: ",requestFile.subTemplate1.path);
      
      const zipFilePath = requestFile.subTemplate1.path.replace('.docx', '.zip');
      await rename(requestFile.subTemplate1.path, zipFilePath);

      let outputFilename  = '/tmp/' + requestFile.subTemplate1.originalFilename.replace(".docx","")

      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(outputFilename, true /*overwrite*/);

      // outputFilename = outputFilename;

      console.log('Extraction and work completed successfully.');
      console.log("requestFile.subTemplate1.path: ",requestFile.subTemplate1.path);
      console.log("outputFilename", outputFilename)

      requestFile.subTemplate1.path = outputFilename;
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }

  next();
}

