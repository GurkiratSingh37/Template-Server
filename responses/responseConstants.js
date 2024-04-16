/**
 * Created by Vaibhav Kaushal on 25th May 2023
 */

'use strict';


exports.requestMethods  = {
  POST  : 'POST',
  GET   : 'GET',
  PUT   : 'PUT',
  PATCH : 'PATCH',
  DELETE: 'DELETE'
};

exports.responseHttpStatus = {
  BAD_REQUEST              : 400,
  UNAUTHORIZED             : 401,
  SUCCESS                  : 200,
  INTERNAL_SERVER_ERROR    : 500,
  CONFLICT                 : 409,
  NOT_FOUND                : 404
};

exports.modules  = {
  REGISTER        : "register",
  LOGIN           : "login",
  PROFILE         : "profile",
  MEDIA           : "media",
  LAYOUT          : "layout",
  EMPLOYMENT      : "employment",
  RESUME          : "resume",
  SKILLS          : "skills",
  INDUSTRY        : "industry", 
  ENDORSEMENT     : "endorsement",
  THEMES          : "themes",
  MODULES         : "modules",
  IDENTITY        : "identity",
  ACTIVITY        : "activity",
  IMAGES          : "images",
  APP_VERSION     : "app_version"
};

exports.permissions  = {
  "READ"    : 1,
  "CREATE"  : 2,
  "UPDATE"  : 3,
  "DELETE"  : 4
};

exports.responseStatus = {
  BAD_REQUEST                 : 400,
  UNAUTHORIZED                : 401,
  SESSION_EXPIRED             : 440,
  SUCCESS                     : 200,
  INTERNAL_SERVER_ERROR       : 500,
  CONFLICT                    : 409,
  NOT_FOUND                   : 404,
  PLAN_EXPIRED                : 402
};

exports.responseMessages = {
  SUCCESS                     : "Success",
  FAILURE                     : "Failure",
  UNAUTHORIZED                : "You are not authorized to perform this action.",
  USER_ALREADY_REGISTERED     : "User already registered with us. Try signing in",
  EMAIL_ALREADY_REGISTERED    : "Email already registered with us. Try signing in",
  REGISTER_SUCCESS            : "User registered successfully",
  REGISTER_ALREADY_VERIFY     : "User already verified",
  RESET_PASSWORD_REQUESTED    : "You will receive instructions on your registered email.",
  PARAMETER_MISSING           : "Insufficient information was supplied. Please check and try again.",
  INVALID_AUTH_KEY            : "Invalid Token!",
  REGISTRATION_INCOMPLETE     : "Incomplete registration. Initial setup pending.",
  USER_INACTIVE               : "This account is not active yet. Please contact support.",
  ACCOUNT_INACTIVE            : "This account is not active or blocked by admin. Please contact admin.",
  SESSION_EXPIRED             : "User session expired",
  INTERNAL_SERVER_ERROR       : "Some error occurred.",
  DUPLICATE_ENTRY             : "Something duplicate in database.",
  ALREADY_EXITS               : "User already exists.",
  NOT_FOUND                   : "No data found",
  NO_REQUEST_FOUND            : "No request found",
  USER_NOT_FOUND              : "User not registered with us",
  INVALID_OTP                 : "Invalid OTP!",
  PLAN_EXPIRED                : "Your Trial period has expired! Please select a plan to continue.",
  OTP_SUCCESS                 : "OTP sent successfully",
  OTP_EXPIRES                 : "OTP is expired! ",
  INVALID_CREDENTIALS         : "Invalid Credentials!",
  INVALID_OLD_PASSWORD        : "Invalid old password!",
  DUPLICATE_USERNAME          : "Username already taken.",
  DUPLICATE_EMAIL             : "Email already exists, Please login instead.",
  ALREADY_PRIMARY_EMAIL       : "Already your primary email",
  ALREADY_ALTERNATIVE_EMAIL   : "This alternative email is added to your account.",
  ALREADY_ACCEPTED            : "Request already accepted",
  ALREADY_CANCELLED           : "Request Expired!",
  DUPLICATE_PHONE_NUMBER      : "Phone number already exists. Please login instead.",
  INCOMPLETE_REGISTRATION     : "Please verify your email and phone number.",
  SAME_NEW_PASSWORD           : "New password is same as old password.",
  NO_THEME_FOUND              : "No Theme was found for this user.",
  USER_THEME_ACTIVE           : "Cannot Delete Theme, it's currently in use.",
  INACTIVE_MODULE             : "Please Activate the Module ",
  NO_MODULE_FOUND             : "No module found.",
  NO_PROFILE_VISIBILITY       : "User has disabled profile viewing",
  INVALID_PASSWORD            : "Password must be at least 8 characters long and must contain one lower case, one uppercase, one numeric and one special character.",
  RESET_PASSWORD_LINK         : "Link has expired",
  APP_VERSION_MISMATCH        : "App Version Mismatch"
};


exports.LOCATION_TRIGGER = {
  REGISTER                : 1,
  VERIFY_REGISTRATION     : 2,
  LOGIN                   : 3,
  LOGIN_VIA_OTP           : 4,
  LOGIN_VIA_ACCESS_TOKEN  : 5,
  FORGET_PASSWORD         : 6,
  UPDATE_USER_DETAILS     : 7
}
exports.APP_TYPE = {
  MOBILE_APP  :  1,
  WEB_APP     :  2
}

exports.EMAIL_SERVICE = {
  SES         : 1,
  MANDRILL    : 2
};

exports.activityMessages = {
  ENDORSEMENT               : "Received an endorsement",
  ADDED_RESUME              : "Added a resume",
  UPDATED_RESUME            : "Updated resume",
  USER_ADDED_MODULE         : module => `${module} added to site`,
  COMPANY_ADDED_MODULE      : (module,company) => `${module} added to ${company} site`,
  EVENT_ADDED_MODULE        : (module,event) => `${module} added to ${event} site`,
  USER_UPDATED_MODULE       : module => `${module} updated on site`,
  COMPANY_UPDATED_MODULE    : (module,company) => `${module} updated on ${company} site`,
  EVENT_UPDATED_MODULE      : (module,event) => `${module} updated on ${event} site`
}