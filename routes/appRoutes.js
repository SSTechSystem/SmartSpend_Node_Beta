const express = require('express');
const { ROLE } = require('../common/constant/constant.json');
const { verifyToken } = require('../common/helper/auth');
const appControllers = require('../controllers/appControllers/appControllers');
const validation = require('../common/middleware/validation');
const { profileUpload } = require('../common/helper/multerHelper');
const route = express.Router();

route.get('/country/countrylist', appControllers.getCountryList);

route.post('/users/user_skip', validation.userSkipVal, appControllers.userSkip);

route.post('/users/user_authorization', validation.userAuthVal, appControllers.userAuthorization);

route.post('/users/resend_otp', appControllers.resendOtp);

route.post('/users/new_user_submit', validation.newUserSubmitVal, appControllers.newUserSubmit);

route.post('/users/get_user_data', appControllers.getUserData);

route.post('/users/update_user_data', validation.updateUserDataVal, appControllers.updateUserData);

route.post('/users/update_profile', profileUpload.single('ProfilePhotoFile'), appControllers.updateProfile);

route.post('/users/delete_profile', appControllers.deleteProfile);

route.post('/feedback/add', validation.feedbackValidation, appControllers.feedbackAdd);

route.post('/users/logout', appControllers.logout);

route.post('/versionhistory/get_data', validation.versionHistoryValidation, appControllers.getVersionHistory);

route.use((_, res) => {
  res.status(405).json({
    statusCode: 405,
    success: false,
    type: "Error",
    message: "Method Not Allowed",
    data: {},
  });
});

module.exports = route;