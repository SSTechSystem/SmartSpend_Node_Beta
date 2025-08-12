const multer = require("multer");
const path = require("path");
const fs = require("fs");
const common = require("../statics/static.json");
const { encryptMessage } = require("../utils/utils");

exports.createMulterInstance = (uploadFilePath) => {
  try {
    if (!fs.existsSync(uploadFilePath)) {
      fs.mkdirSync(uploadFilePath, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const filePath = path.join(uploadFilePath);
        cb(null, filePath);
      },
      filename: function (req, file, cb) {
        const newFileName = `${Date.now()}_${(path.extname(file.originalname)).toLowerCase()}`;
        cb(null, newFileName);
      },
    });

    return multer({ storage });
  } catch (error) {
    console.log("error in file handling: ", error);
  }
};

exports.multerInstanceForSentFiles = () => {
  try {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const filename = file.originalname;
        const extension = (path.extname(filename)).toLowerCase();
        if (!req.body.fileArr) {
          req.body.fileArr = [];
        }
        const fileData = {};
        let filepath;
         if (
          extension === common.file_extension.jpg ||
          extension === common.file_extension.jpeg ||
          extension === common.file_extension.png
        ) {
          filepath = path.join(
            path.resolve('./uploads/images')
          );
          fileData.ChatImage = encryptMessage(filename);
          fileData.ChatType = "I";
          fileData.messageLabel = "photo";
        } else if (
          extension === common.file_extension.pdf ||
          extension === common.file_extension.csv ||
          extension === common.file_extension.doc ||
          extension === common.file_extension.docx ||
          extension === common.file_extension.xls ||
          extension === common.file_extension.xlsx
        ) {
          filepath = path.join(
            path.resolve('./uploads/documents')
          );
          fileData.ChatDocument = encryptMessage(filename);
          fileData.ChatType = "D";
          fileData.messageLabel = "document";
        } else if (extension === common.file_extension.mp4) {
          filepath = path.join(
            path.resolve('./uploads/videos')
          );
          fileData.ChatVideo = encryptMessage(filename);
          fileData.ChatType = "V";
          fileData.messageLabel = "video";
        } else if (extension === common.file_extension.mp3) {
          filepath = path.join(path.resolve('./uploads/audio'));
          fileData.ChatAudio = encryptMessage(filename);
          fileData.ChatType = "A";
          fileData.messageLabel = "audio";
        } else {
          return cb(new Error("Unsupported file type"));
        }
        req.body.fileArr.push(fileData);
        cb(null,filepath);
      },
      filename: function (req, file, cb) {
        cb(null,file.originalname);
      }
    });

    return multer({ 
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }
    });
  } catch (error) {
    console.log('error in handling file that are to be sent : ', error);
    throw error;
  }
};