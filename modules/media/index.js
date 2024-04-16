

const multipartMiddleware = require('connect-multiparty')();

const mediaValidator      = require('./validators/mediaValidator');
const mediaController     = require('./controllers/mediaController');
const convertFile         = require('./services/convertFileFormat').init;


router.post("/file/upload",  multipartMiddleware,  mediaValidator.uploadFile,  convertFile,  mediaController.uploadFile);


