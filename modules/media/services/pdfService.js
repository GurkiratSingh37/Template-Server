"use strict";

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const logging                = require('../../../logging/logging');

const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);

const PDFDocument = require('pdf-lib').PDFDocument;
const pdf = require('pdf-parse');

exports.init = async (apiReference, files, opts) => {
  let response = {success: false};
  logging.log(apiReference, {EVENT: "pdf Service", FILES: files, OPTS: opts});

  if(files.subTemplate){
    for (let i=0; i<files.subTemplate.length; i++){
      let searchText = files.subTemplate[i].originalFilename.replace('.docx', '');
      searchText="{:include "+searchText+"}";

      console.log("searchText:", searchText);

      const sourcepath = files.mainTemplate.path;
      const subTempPath = files.subTemplate[i].path;

      await zipAndChangeExtension(sourcepath, "mainTemplate");
      await zipAndChangeExtension(subTempPath, "subTemplate");
      logging.log(apiReference, {EVENT: "Successfully Changed to .docx"});

      await docxToPdf(sourcepath, "mainTemplate");
      await docxToPdf(subTempPath, "subTemplate");
      logging.log(apiReference, {EVENT: "Successfully Changed to .docx"});

      // to pdf
      const sourceFile = await fs.promises.readFile(sourcepath+"/mainTemplate.pdf");
      const subTempFile = await fs.promises.readFile(subTempPath+"/subTemplate.pdf");
      
      const firstFile = await PDFDocument.load(sourceFile);
      const secondFile = await PDFDocument.load(subTempFile);

      const numberOfPages = firstFile.getPages().length;

      // Create a new "sub" document
      const subDocument = await PDFDocument.create();

      for (let i = 0; i < numberOfPages; i++) {
        // copy the page at current index
        const [copiedPage] = await subDocument.copyPages(firstFile, [i]);
        subDocument.addPage(copiedPage);

        const pdfBytes = await subDocument.save();
        
        const parsing = await pdf(pdfBytes);
        // console.log("parsing.text", parsing.text.trim());
        // console.log("searchText.trim()", searchText.trim())
        if(parsing.text.includes(searchText)){
          logging.log(apiReference, {PageNumber: i+1});

          subDocument.removePage(i);
          
          for (let j = 0; j < secondFile.getPages().length; j++) {
            const [copiedPage] = await subDocument.copyPages(secondFile, [j]);
            subDocument.addPage(copiedPage);
          }
        }
      }

      // Save the modified document
      const modifiedPdfBytes = await subDocument.save();
      fs.promises.writeFile(`${sourcepath}/res.pdf`, modifiedPdfBytes);
    }
  }

  response.success = true;
  return response;
};


async function zipAndChangeExtension(folderPath, fileName) {
  const outputPath = path.join(folderPath, fileName+'.zip'); // Output zip file in the same folder
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', function () {
      // Rename the zip file to .docx
      const docxPath = path.join(folderPath, fileName+'.docx');
      console.log("docxPath:", docxPath);
      fs.rename(outputPath, docxPath, function(err) {
        if (err) {
          console.error('Error occurred while renaming:', err);
          reject(err);
        } else {
          console.log('Folder compression and extension change completed successfully.');
          resolve(docxPath);
        }
      });
    });

    archive.on('error', function (err) {
      console.error('An error occurred:', err);
      reject(err);
    });

    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
  });
}

async function docxToPdf(folderPath, fileName) {
  const ext = '.pdf'
  const inputPath = path.join(folderPath, `${fileName}.docx`);
  const outputPath = path.join(folderPath, `${fileName}.pdf`);

  // Read file
  const docxBuf = await fs.promises.readFile(inputPath);

  // Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
  let pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);
  
  // Here in done you have pdf file which you can save or transfer in another stream
  await fs.promises.writeFile(outputPath, pdfBuf);
}

async function doesPageContainText(pdfDocument, pageNumber, searchText) {
  const page = pdfDocument.getPage(pageNumber);
  const content = await page.getTextContent();
  const pageText = content.items.map(item => item.str).join('');
  return pageText.includes(searchText);
}