const apiReferenceModule                  = "media";
const Joi                                 = require('joi');
const validator                           = require('./../../../validators/joiValidator');


const emptyHeaderStructure            = Joi.object().keys({
});


const uploadFile =async (req, res, next) => {
  req.apiReference = {
    module          : apiReferenceModule,
    api             : "uploadFile",
  };
  let schema =  Joi.object().keys ({
    mainTemplate      : Joi.object().keys({
      fieldName         : Joi.string().required(),
      originalFilename  : Joi.string().required(),
      path              : Joi.string().required(),
      headers           : Joi.any().required(),
      size              : Joi.number().required(),
      name              : Joi.string().required(),
      type              : Joi.string().required()
    }).required(),
    subTemplate: Joi.array().items(
      Joi.object().keys({
        fieldName: Joi.string().required(),
        originalFilename: Joi.string().required(),
        path: Joi.string().required(),
        headers: Joi.any().required(),
        size: Joi.number().required(),
        name: Joi.string().required(),
        type: Joi.string().required(),
      })
    ).optional(),
    // entity    : Joi.string().required(),
    searchText: Joi.string().required()
  });
  let reqBody = { ...req.files };
  let request = { ...req, headers: req.headers };
  reqBody.searchText  = req.body.searchText;
  let validFields = await validator.validateFields(req.apiReference, request, reqBody, res, schema, emptyHeaderStructure);
  if(validFields){
    next();
  }
};

exports.uploadFile                  = uploadFile;
