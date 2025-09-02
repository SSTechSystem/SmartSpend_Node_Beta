const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { generateUniqueFileName } = require("../utils/utils");

const profileStorage = multer.diskStorage({
  destination: function (_,_, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/profiles');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (_, file, cb) {
    const filename = generateUniqueFileName(file.originalname);
    cb(null, filename);
  }
});

const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (_, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (gif, jpg, png, jpeg) or PDF are allowed!'));
  }
});

module.exports = { profileUpload };