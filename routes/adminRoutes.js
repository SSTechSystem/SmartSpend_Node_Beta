const express = require('express');
const authControllers = require('../controllers/adminControllers/authControllers');
const adminControllers = require('../controllers/adminControllers/adminControllers');
const cmsControllers = require('../controllers/adminControllers/cmsControllers');
const { signInValidationForAdmin, adminUpdatePasswordVal, adminUpdateProfileVal, validateAdminDetails } = require('../common/middleware/validation');
const { ROLE } = require('../common/constant/constant.json');
const { verifyToken } = require('../common/helper/auth');
const route = express.Router();

/* Admin Authentication Routes */
route.post('/signin', signInValidationForAdmin, authControllers.signIn);

route.get('/profile', verifyToken([ROLE.ADMIN]), authControllers.getProfile);

route.patch('/update-profile', verifyToken([ROLE.ADMIN]), adminUpdateProfileVal,authControllers.updateProfile);

route.patch('/change-password', verifyToken([ROLE.ADMIN]), adminUpdatePasswordVal, authControllers.updatePassword);

route.post('/signout', verifyToken([ROLE.ADMIN]), authControllers.signOut);
/* Admin Authentication Routes */

/* Admin Panel Routes */
route.get('/dashboard', verifyToken([ROLE.ADMIN]), adminControllers.getDashboardData);

route.post('/customers', verifyToken([ROLE.ADMIN]), adminControllers.getCustomersData);

route.post('/feedbacks', verifyToken([ROLE.ADMIN]), adminControllers.getFeedbacksData);

route.get('/backups', verifyToken([ROLE.ADMIN]), adminControllers.getBackupsData);

route.get('/admins', verifyToken([ROLE.ADMIN]), adminControllers.getAdminsData);

route.post('/admin-add-or-edit', verifyToken([ROLE.ADMIN]), validateAdminDetails, adminControllers.adminAddOrEdit);

route.patch('/admin-add-or-edit', verifyToken([ROLE.ADMIN]), validateAdminDetails, adminControllers.adminAddOrEdit);

route.get('/admin-details/:id', verifyToken([ROLE.ADMIN]), adminControllers.getAdminDetails);

route.delete('/admin-delete/:id', verifyToken([ROLE.ADMIN]), adminControllers.adminDelete);

route.get('/roles', verifyToken([ROLE.ADMIN]), adminControllers.getRoles);
/* Admin Panel Routes */

/* Admin CMS Routes */
route.get('/cms', verifyToken([ROLE.ADMIN]), cmsControllers.getCmsData);

route.post('/add-cms', verifyToken([ROLE.ADMIN]), cmsControllers.manageCms);

route.patch('/edit-cms', verifyToken([ROLE.ADMIN]), cmsControllers.manageCms);

route.get('/cms-details/:id', verifyToken([ROLE.ADMIN]), cmsControllers.getCmsDetails);

route.get('/view-cms/:id', verifyToken([ROLE.ADMIN]), cmsControllers.viewCms);

route.delete('/delete-cms/:id', verifyToken([ROLE.ADMIN]), cmsControllers.deleteCms);

route.delete('/delete-version-history', verifyToken([ROLE.ADMIN]), cmsControllers.deleteVersionHistory);
/* Admin CMS Routes */

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