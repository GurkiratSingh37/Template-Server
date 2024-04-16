"use strict";

exports.responseMessages = {
   INVALID_OTP                 : "Invalid OTP",
   PERMISSION_DENIED           : "Permission denied",
   LOGIN_SUCCESS               : "Login successfully",
   UPDATE_PROFILE              : "Profile Updated Successfully",
   SIGNUP_SUCCESS              : "SignUp Successfully",
   OTP_EXPIRES                 : "OTP Expired . Try another One",
   OTP_SEND_ERROR              : "OTP Sending Unsuccessful",
   OTP_SUCCESS                 : "OTP Sent Successfully",
   LOGOUT_ERROR                : "Logout Error",
   LOGOUT_SUCCESS              : "Logout Successfully",
   LOGOUTALL_SUCCESS           : "Logout From All Devices Success",
   BLOCK_SUCCESS               : "User Block Successfully",
   USER_BLOCK                  : "You are Blocked by Admin",
   INVALID_TYPE                : "Invalid Object Id", 
};

exports.default_minutes=0;
exports.default_seconds=60;

exports.SAMPLE_NUMBERS = [];

exports.REQUEST_STATUS = {
   PENDING   : 1,
   ACCEPTED  : 2,
   REJECTED  : 3
};
