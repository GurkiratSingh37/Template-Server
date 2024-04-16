const { DOMParser,DOMImplementation,XMLSerializer } = require('@xmldom/xmldom');
// const { XMLParser } = require('fast-xml-parser');
const logging                = require('../../../logging/logging');
const fs = require('fs/promises');
const path = require('path');
const xpath = require('xpath');

exports.headerFooter = async(apiReference, files)=>{
  logging.log(apiReference, {EVENT: "Header Footer Service", FILES: files});
  // const sourcepath = "/home/gurkirat/Documents/workspace/Growth Natives/Merge_Files/files/template_xmls/word/document.xml";

  // const mainTemp = "/home/gurkirat/Documents/workspace/Growth Natives/Merge_Files/files/header_footer/TemplateFile_A";
  // const subTemp = "/home/gurkirat/Documents/workspace/Growth Natives/Merge_Files/files/header_footer/SubTemplatefile_B"
  const mainTemp = files.mainTemplate.path;
  const subTemp = files.subTemplate1.path;

  try {
    let files = await fs.readdir(mainTemp + "/word/_rels");
    console.log(files);
    const headerRelsRegex = /header\d*\.xml\.rels/;
    const footerRelsRegex = /footer\d*\.xml\.rels/;

    const headerXmlRegex = /header\d*\.xml/;
    const footerXmlRegex = /footer\d*\.xml/;

    const headerData = []; // Array to store header data
    const footerData = []; // Array to store footer data
    for (const filename of files) {
      if (headerRelsRegex.test(filename)) {
        const relsFilePath = path.join(mainTemp + "/word/_rels", filename);
        const relsContent = await fs.readFile(relsFilePath, 'utf-8');
        headerData.push({
          name: filename,
          content: relsContent
        });
        // await fs.writeFile(subTemp+"/word/_rels/"+filename,relsContent);
      } else if (footerRelsRegex.test(filename)) {
        const relsFilePath = path.join(mainTemp + "/word/_rels", filename);
        const relsContent = await fs.readFile(relsFilePath, 'utf-8');
        footerData.push({
          name: filename,
          content: relsContent
        });
        // await fs.writeFile(subTemp+"/word/_rels/"+filename,relsContent);
      }
    }
    // Now you have headerData and footerData arrays containing the content of header and footer files respectively
    console.log("Header Data:", headerData);
    console.log("Footer Data:", footerData);

    let headerImagesArr = [];
    let footerImagesArr = [];
    
    let PREFIX = "image_";

    // Iterate through each footer data
    for (const { name, content } of headerData) {
      // Use a global regular expression to find all occurrences of the Target attribute
      const targetRegex = /Target\s*=\s*"media\/([^"]+)"/g;
      let match;
      let newContent = content;
      while ((match = targetRegex.exec(content)) !== null) {
        // Extract the target value and image name from each match
        const targetValue = match[1];
        const prevImage = targetValue.split('/').pop();
        const newImage = PREFIX + "head_" + prevImage;
        const imageContent = await fs.readFile(mainTemp + "/word/media/" + prevImage);
        await fs.writeFile(subTemp + "/word/media/" + newImage, imageContent);
        newContent = newContent.replace(prevImage, newImage);
      }
      await fs.writeFile(subTemp + "/word/_rels/" + name, newContent);
    }
    console.log("Header Image Names:", headerImagesArr);
    for (const { name, content } of footerData) {
      // Use a global regular expression to find all occurrences of the Target attribute
      const targetRegex = /Target\s*=\s*"media\/([^"]+)"/g;
      let match;
      let newContent = content;
      while ((match = targetRegex.exec(content)) !== null) {
        // Extract the target value and image name from each match
        const targetValue = match[1];
        const prevImage = targetValue.split('/').pop();
        const newImage = PREFIX + "foot_" + prevImage;
        const imageContent = await fs.readFile(mainTemp + "/word/media/" + prevImage);
        await fs.writeFile(subTemp + "/word/media/" + newImage, imageContent);
        newContent = newContent.replace(prevImage, newImage);
      }
      await fs.writeFile(subTemp + "/word/_rels/" + name, newContent);
    }
    console.log("Footer Image Names:", footerImagesArr);
    // for (let i = 0; i < headerImagesArr.length; i++) {
    //   const prevImage = headerImagesArr[i];
    //   const newImage = PREFIX + "head_" + prevImage;
    //   const imageContent = await fs.readFile(mainTemp + "/word/media/" + prevImage);
    //   await fs.writeFile(subTemp + "/word/media/" + newImage, imageContent);
    // }
    // for (let i = 0; i < footerImagesArr.length; i++) {
    //   const prevImage = footerImagesArr[i];
    //   const newImage = PREFIX + "foot_" + prevImage;
    //   const imageContent = await fs.readFile(mainTemp + "/word/media/" + prevImage);
    //   await fs.writeFile(subTemp + "/word/media/" + newImage, imageContent);
    // }

    // --------------------------------------------------------------------------------
    
    // 1. saving the document relationships of headers & footers
    const relsXml = await fs.readFile(mainTemp + "/word/_rels/document.xml.rels");
    const relsDom = new DOMParser().parseFromString(relsXml.toString(), 'text/xml');
    const relations = xpath.select("//*[local-name()='Relationship']", relsDom);
    const idMap = {};
    for (let i = 0; i < relations.length; i++) {
      let relation = relations[i];
      const Id = relation.getAttribute("Id");
      const Target = relation.getAttribute("Target");
      if (headerXmlRegex.test(Target)) {
        idMap[Id] = {
          Id : "Header_" + Id,
          Target
        }
      }
      else if (footerXmlRegex.test(Target)) {
        idMap[Id] = {
          Id : "Footer_" + Id,
          Target
        }
      }
      // console.log(">>>>>>>>>>>>>",i,attributes);
    }
    console.log(idMap, ">>>>>>>>>>>>>>>>>>idmap");

    // 2. Using the above idMap to change the `sectPr` we get and saved from mainTemplate
    const origDocumentXml = await fs.readFile(mainTemp + "/word/document.xml");
    const origDom = new DOMParser().parseFromString(origDocumentXml.toString(), 'text/xml');
    let origSectionPr = xpath.select1("//*[local-name()='sectPr']", origDom);
    let origSectionPrXml = new XMLSerializer().serializeToString(origSectionPr);
    console.log("#########", origSectionPrXml, "\n\n\n");
    Object.keys(idMap).forEach(key => {
      origSectionPrXml = origSectionPrXml.replace(key, idMap[key].Id);
    });
    // console.log(">>>>>>>>>>>>>",origSectionPrXml);

    // saving the size setting inside the `sectPr` tag of subTemplate File.
    origSectionPr = new DOMParser().parseFromString(origSectionPrXml, 'text/xml');
    let subDocumentXml = await fs.readFile(subTemp + "/word/document.xml");
    let subDom = new DOMParser().parseFromString(subDocumentXml.toString(), 'text/xml');
    const subSectionPr = xpath.select1("//*[local-name()='sectPr']", subDom);
    let subPageSize = xpath.select1('//*[local-name()="pgSz"]', subSectionPr);
    let origPageSize = xpath.select1('//*[local-name()="pgSz"]', origSectionPr);
    for (let i = 0; i < subPageSize.attributes.length; i++) {
      let nodeName = subPageSize.attributes[i].nodeName;
      let nodeValue = subPageSize.attributes[i].nodeValue;
      origPageSize.setAttribute(nodeName, nodeValue); // mainTemplate's `sectPr` tags --> pgSz changed according to the subTemplate file tag.
    }

    subSectionPr.parentNode.insertBefore(origPageSize.parentNode, subSectionPr);
    console.log(">>>>>");
    subSectionPr.parentNode.removeChild(subSectionPr);
    console.log(">>>>>>>>>>>");
    subDocumentXml = new XMLSerializer().serializeToString(subDom);
    await fs.writeFile(subTemp + "/word/document.xml", subDocumentXml);

    // ********************* adding footer and header relationship *******************
    let documentRelsXml = await fs.readFile(subTemp + "/word/_rels/document.xml.rels");
    let documentRelsDom = new DOMParser().parseFromString(documentRelsXml.toString(), "text/xml");
    let relationships = xpath.select('//*[local-name()="Relationship"]', documentRelsDom);
    console.log(relationships.length);
    for (let i = 0; i<relationships.length; i++) {
      let relation = relationships[i];
      let target = relation.getAttribute("Target"); // `target` consists of "header" or "footer".
      // console.log("target >>>>>>>>>>>> ", target);
      if( headerXmlRegex.test(target) || footerXmlRegex.test(target) ){
        relation.parentNode.removeChild(relation);
      }
    }
    
    const relationType = relationships[0].getAttribute("Type");
    console.log(relationType);

    Object.keys(idMap).forEach(key=>{
      const target = idMap[key].Target;
      const id = idMap[key].Id;
      const relationXml = `<Relationship Id="${id}"
      Type="${relationType}"
      Target="${target}" />`;
      const relationDom = new DOMParser().parseFromString(relationXml);
      const relationChild = xpath.select1("//*[local-name()='Relationship']",relationDom);
      relationships[0].parentNode.insertBefore(relationChild,relationships[0]);
    });
    documentRelsXml = new XMLSerializer().serializeToString(documentRelsDom);
    // console.log(documentRelsXml);
    await fs.writeFile(subTemp + "/word/_rels/document.xml.rels", documentRelsXml);
    // ***************** copying header and footer in word ***************************
    files = await fs.readdir( mainTemp + "/word" );
    console.log(files);

    console.log("done");


    // Delete existing header and footer files in subTemplate
    const subWordDir = path.join(subTemp, "/word");
    const subWordFiles = await fs.readdir(subWordDir);
    for (const file of subWordFiles) {
      if (file.startsWith("header") || file.startsWith("footer")) {
        await fs.unlink(path.join(subWordDir, file));
      }
    }

    // Copy header and footer files from mainTemplate to subTemplate
    const mainWordDir = path.join(mainTemp, "/word");
    const mainWordFiles = await fs.readdir(mainWordDir);
    for (const file of mainWordFiles) {
      if (file.startsWith("header") || file.startsWith("footer")) {
        const sourcePath = path.join(mainWordDir, file);
        const destPath = path.join(subWordDir, file);
        await fs.copyFile(sourcePath, destPath);
      }
    }

    console.log("Header and footer files copied successfully.");

  } catch (error) {
    // Handle error if footer1.xml.rels doesn't exist
    if (error.code === 'ENOENT') {
      console.log("footer1.xml.rels does not exist.");
    } else {
      console.error("Error occurred:", error);
    }
  }
}