'use strict';

const authValidator                 = require('../../validators/authValidator');
const loginValidator                = require('./validators/loginValidator');
const loginController               = require('./controllers/loginController');
const passwordController            = require('./controllers/passwordController');
const userAuth                      = authValidator.authenticateUser;


router.post("/user/sendOtp",             loginValidator.sendOTP,                         loginController.sendOTP);

router.post("/user/login",               loginValidator.login,                           loginController.login);
router.post("/user/loginViaOtp",         loginValidator.loginViaOTP,                     loginController.loginViaOTP);
router.post("/user/loginViaAccessToken", loginValidator.loginViaAccessToken, userAuth,   loginController.loginViaAccessToken);
router.put("/user/logout",               loginValidator.logout,              userAuth,   loginController.logout);
router.put("/user/logoutAll",            loginValidator.logoutAll,           userAuth,   loginController.logoutAll);

router.put("/user/resetPassword",        loginValidator.resetPassword,       userAuth,   passwordController.resetPassword);
router.put("/user/forgotPassword",       loginValidator.forgotPassword,                  passwordController.forgotPassword);
router.put("/user/forgotUsername",       loginValidator.forgotUsername,                  passwordController.forgotUsername)

router.get("/user/search",               loginValidator.search,              userAuth,   loginController.search);
