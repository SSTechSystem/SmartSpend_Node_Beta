const express = require('express');
const router = express.Router();
// const appRoutes = require('./appRoutes');
const adminRoutes = require('./adminRoutes');

// router.use('/app_api', appRoutes);

router.use('/admin_api', adminRoutes);

router.use((_, res) => {
  res.status(405).json({
    statusCode: 405,
    success: false,
    type: "Error",
    message: "Method Not Allowed",
    data: {},
  });
});

module.exports = router;