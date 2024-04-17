"use strict";

const { DOMParser,DOMImplementation,XMLSerializer } = require('@xmldom/xmldom');
// const { XMLParser } = require('fast-xml-parser');
const fs                                            = require('fs/promises');
const xpath                                         = require('xpath');
const logging                                       = require('../../../logging/logging');

const pdfService                                    = require('./pdfService.js');
const headerFooterService                           = require('./headerFooterService.js');
const fontService                                   = require('./fontService.js');

exports.fileUpload = async (apiReference, files, opts) => {
  let response = { success: false };
  logging.log(apiReference, { EVENT: "File Service", FILES: files, OPTS: opts });

  try{
    if (requestFile.subTemplate) {
      for (let i = 0; i < requestFile.subTemplate.length; i++) {

        const sourcepath = files.mainTemplate.path+"/word/document.xml";
        const content = await fs.readFile(sourcepath);
        // console.log(content);
        const mydoc = new DOMParser().parseFromString(content.toString(),'text/xml');
        const paragraph = xpath.select(`//*[local-name()="p"]`, mydoc);
        let targetId = null;
        for( let p=0; p<paragraph.length; p++ ){
          let para = paragraph[p];
          const textNodes = xpath.select('.//*[local-name()="t"]', para);
          let mytext = "";
          for( let ind = 0; ind<textNodes.length; ind++ ){
            let curr = textNodes[ind].childNodes[0]?.data;
            if( curr ){
              mytext += curr ;
            }
          }
          logging.log(apiReference, {EVENT: "mytext", TEXT: mytext});
      
          if(mytext.includes(requestFile.subTemplate[i].originalFilename)){
            logging.log(apiReference, {MY_TEXT: mytext});
      
            const attributes = {};
            for(let at=0; at<para.attributes.length; at++){
              attributes[para.attributes[at].nodeName] = para.attributes[at].nodeValue;
            }
            logging.log(apiReference, {EVENT: "attributes", attributes: attributes});
      
            let paraIdKey = Object.keys(attributes).filter(key=>key.includes("paraId"))[0];
            targetId = attributes[paraIdKey];
            break;
          }
        }
      
        logging.log(apiReference, {targetId: targetId});
      
        if(!targetId){
          continue;
          // return "not found";
        }
        const targetParagraph = xpath.select1(`//*[local-name()="p" and @*[local-name()="paraId"]="${targetId}"]`, mydoc);
        // console.log("targetParagraph:", targetParagraph);
        logging.log(apiReference, {EVENT: "targetParagraph:", RESPONSE: targetParagraph});
      
        const newParaElement = mydoc.createElement('w:p');
        const newRow = mydoc.createElement('w:pPr');
        const newSpacing = mydoc.createElement('w:spacing');
        newSpacing.setAttribute('w:before', '20000');
        newSpacing.setAttribute('w:after', '20000');
        newSpacing.setAttribute('w:line', '240');
        newSpacing.setAttribute('w:lineRule', 'auto');
      
        const newr = mydoc.createElement('w:r');
        const rpr = mydoc.createElement('w:rPr');
      
        const wrFonts = mydoc.createElement('w:rFonts');
        wrFonts.setAttribute('w:ascii', 'Work Sans');
        wrFonts.setAttribute('w:eastAsia', 'Times New Roman');
        wrFonts.setAttribute('w:hAnsi', 'Work Sans');
        wrFonts.setAttribute('w:cs', 'Times New Roman');
      
        const newt = mydoc.createElement('w:t');
        const textValue = mydoc.createTextNode(opts.searchText);
      
        rpr.appendChild(wrFonts);
        newr.appendChild(rpr);
        newr.appendChild(newt);
      
        newRow.appendChild(newSpacing);
        newt.appendChild(textValue);
        newParaElement.appendChild(newRow);
        newParaElement.appendChild(newr);
      
        // Insert newParaElement after targetParagraph
        const parentNode = targetParagraph.parentNode;
        const nextSibling = targetParagraph.nextSibling;
        if (nextSibling) {
          parentNode.insertBefore(newParaElement, nextSibling);
        } else {
          parentNode.appendChild(newParaElement);
        }
      
        // Replace the parent of targetParagraph
        targetParagraph.parentNode.replaceChild(newParaElement, targetParagraph);
      
        const xml = new XMLSerializer().serializeToString(mydoc);
        await fs.writeFile(sourcepath,Buffer.from(xml));
      
        logging.log(apiReference, {EVENT: "XML Changes Completed"});
      }
    }
  

    // Font Changes
    await fontService.replaceFont(apiReference, files);
  
    // Header-Footer Changes
    await headerFooterService.headerFooter(apiReference, files);
    
    // Pdf Changes.
    await pdfService.init(apiReference, files, opts);
  
    response.success  = true;
    return response;
  }
  catch(err){
    logging.logError(apiReference, {EVENT: "Error Occured in Service", ERROR: err})
    response.error = err;
    return response;
  }

}
