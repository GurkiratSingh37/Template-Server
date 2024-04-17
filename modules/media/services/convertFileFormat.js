"use strict";

const logging                = require('../../../logging/logging');
const stringsUtility         = require('../../../utility/stringsUtility');

const fs = require('fs').promises;
const AdmZip = require('adm-zip');

// Promisify fs.rename and exec functions
// const rename = promisify(fs.rename);
// const mkdir = promisify(fs.mkdir);

exports.init = async (req, res, next) => {
  let apiReference = req.apiReference;
  let requestFile = { ...req.files };
  console.log("requestFile:", requestFile);
  try {
    if (requestFile.mainTemplate.path.includes('.docx')) {
      logging.log(apiReference, { EVENT: "File Conversion .docx to xml", requestFile: requestFile });

      // Rename .docx to .zip
      const zipFilePath = requestFile.mainTemplate.path.replace('.docx', '.zip');
      await fs.rename(requestFile.mainTemplate.path, zipFilePath);

      let outputFilename = '/tmp/' + requestFile.mainTemplate.originalFilename.replace(".docx", "");

      // Remove existing files inside the directory
      await fs.rm(outputFilename, { recursive: true, force: true });

      // Read the zip file
      const zip = new AdmZip(zipFilePath);

      // Extract the contents
      zip.extractAllTo(outputFilename, true /*overwrite*/);

      logging.log(apiReference, {EVENT: "Converting & Extracting Work Completed", PATH: requestFile.mainTemplate.path, outputFilename: outputFilename});
      requestFile.mainTemplate.path = outputFilename;
    }

    if (requestFile.subTemplate) {

      for (let i = 0; i < requestFile.subTemplate.length; i++) {
        if (requestFile.subTemplate[i].path.includes('.docx')) {
          logging.log(apiReference, { EVENT: "File Conversion .docx to xml", requestFile: requestFile.subTemplate[i] });

          const zipFilePath = requestFile.subTemplate[i].path.replace('.docx', '.zip');
          await fs.rename(requestFile.subTemplate[i].path, zipFilePath);

          let outputFilename = '/tmp/' + requestFile.subTemplate[i].originalFilename.replace(".docx", "");

          // Remove existing files inside the directory
          await fs.rm(outputFilename, { recursive: true, force: true });

          const zip = new AdmZip(zipFilePath);
          zip.extractAllTo(outputFilename, true /*overwrite*/);

          logging.log(apiReference, {EVENT: "Converting & Extracting Work Completed", PATH: requestFile.subTemplate[i].path, outputFilename: outputFilename});
          requestFile.subTemplate[i].path = outputFilename;
        }
      }
    }

  } catch (error) {
    console.error('An error occurred:', error);
  }

  next();
}

