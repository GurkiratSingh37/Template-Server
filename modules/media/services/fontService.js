"use strict";

const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');
const fs = require('fs/promises');
const xpath = require('xpath');

const logging                = require('../../../logging/logging');

exports.replaceFont = async(apiReference, files)=>{
  let response = {success: false};
  logging.log(apiReference, {EVENT: "Fetch Response Details", FILES: files});

  try {
    const mainTemp = files.mainTemplate.path;

    // Read contents of fontTable.xml and styles.xml from File A
    const fontTableA = await fs.readFile(mainTemp + '/word/fontTable.xml', 'utf-8');
    const stylesA = await fs.readFile(mainTemp + '/word/styles.xml', 'utf-8');

    // Read content of file A (document.xml)
    const fileAContent = await fs.readFile(mainTemp + "/word/document.xml", 'utf-8');
    const fileADom = new DOMParser().parseFromString(fileAContent, 'text/xml');

    // Get the font value from file A
    const fontTagA = xpath.select1("//*[local-name()='rFonts']", fileADom);
    const font = fontTagA.getAttribute('w:ascii');

    if(files.subTemplate){
      for(let i=0; i<files.subTemplate.length; i++){
        const subTemp = files.subTemplate[i].path;

        // Write contents of fontTable.xml and styles.xml to File B
        await fs.writeFile(subTemp + '/word/fontTable.xml', fontTableA);
        await fs.writeFile(subTemp + '/word/styles.xml', stylesA);

        // Read content of file B (document.xml)
        let fileBContent = await fs.readFile(subTemp + "/word/document.xml", 'utf-8');
        let fileBDom = new DOMParser().parseFromString(fileBContent, 'text/xml');

        // Replace font tags in file B with those from file A
        const fontTagsB = xpath.select("//*[local-name()='rFonts']", fileBDom);
        for (let i = 0; i < fontTagsB.length; i++) {
          const fontTagB = fontTagsB[i];
          fontTagB.setAttribute('w:ascii', font);
          fontTagB.setAttribute('w:hAnsi', font);
          fontTagB.setAttribute('w:cs', font);
        }

        // Serialize the modified DOM to string
        fileBContent = new XMLSerializer().serializeToString(fileBDom);

        // Write the modified content back to file B
        await fs.writeFile(subTemp + '/word/document.xml', fileBContent);
      }
    }
    console.log('Font replaced successfully.');
  } catch(error){
    logging.logError(apiReference, {EVENT: "Replace Font ERROR", ERROR: error, STACK: error.stack});
    response.error = error;
    return response;
  }
}