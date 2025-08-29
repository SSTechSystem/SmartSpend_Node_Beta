const express = require('express');
const { ROLE } = require('../common/constant/constant.json');
const { verifyToken } = require('../common/helper/auth');
const appControllers = require('../controllers/appControllers/appControllers');
const validation = require('../common/middleware/validation');
const route = express.Router();

route.get('/country/countrylist',verifyToken([ROLE.APP_GUEST_USER,ROLE.APP_USER]), appControllers.getCountryList);

route.post('/users/user_skip', validation.userSkipVal, appControllers.userSkip);

module.exports = route;