const path = require("path");
const constant = require("../constant/constant.json");
const { ROLE } = require("../constant/constant.json");
// const CryptoJS = require("crypto-js");
// const SECRET_KEY = constant.CHAT_ENCRYPT_DATA_SECRET_KEY;
const db = require("../../models/index");
const { Op } = require("sequelize");
// const axios = require("axios");
const fs = require("fs");

// check {},"",undefined,null
exports.isEmpty = (data) => {
  if (data === null || data === undefined || data === "") {
    return true;
  }
  if (typeof data === "string" && data.trim().length === 0) {
    return true;
  }
  if (Array.isArray(data) && data.length === 0) {
    return true;
  }
  if (typeof data === "object" && Object.keys(data).length === 0) {
    return true;
  }

  return false;
};

// rename img name
exports.generateUniqueFileName = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = (path.extname(originalFilename)).toLowerCase();
  return `${timestamp}_${randomString}${extension}`;
};

// check valid file type
exports.isValidFileType = (filepath, mediatype = "img") => {
  var allowed_types = "";
  if (mediatype === "doc") {
    allowed_types = constant.DOC_ALLOWED_TYPES;
  } else {
    allowed_types = constant.IMG_ALLOWED_TYPES;
  }
  if (typeof filepath == "object") {
    const invalid_img = [];
    for (const image of filepath) {
      var extension = path.extname(image);
      extension = extension.toLowerCase();
      if (allowed_types.includes(extension) == false) {
        invalid_img.push(image);
      }
    }
    return invalid_img;
  } else {
    var extension = path.extname(filepath);
    extension = extension.toLowerCase();
    return allowed_types.includes(extension);
  }
};

// check valid file size
exports.isValidFileSize = (filesize, mediatype = "img") => {
  var max_file_size = "";
  if (mediatype === "doc") {
    max_file_size = constant.DOC_MAX_SIZE;
  } else {
    max_file_size = constant.IMG_MAX_SIZE;
  }

  if (typeof filesize == "object") {
    const exceed_size = [];
    for (const image of filesize) {
      if (image > max_file_size) {
        exceed_size.push(image);
      }
    }
    return exceed_size;
  } else {
    return filesize <= max_file_size;
  }
};

// Validate phone number
exports.isValidPhoneNumber = (phone_no) => {
  const phone_regex = /^\+?\d[\d()-]{8,20}\d$/;
  return phone_regex.test(phone_no);
};

// Validate post code
exports.isValidPostcode = (post_code) => {
  const postcode_regex = /^[a-zA-Z0-9]{3,10}$/;
  return postcode_regex.test(post_code);
};

// generate unique code
exports.idGenerator = (length = 6) => {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

// Function to generate random numeric string for OTP
exports.generateOTP = () => {
  const otpLength = 4; // Define the length of the OTP (e.g., 6 digits)

  // Generate a random number within the range 100000 to 999999
  const min = Math.pow(10, otpLength - 1);
  const max = Math.pow(10, otpLength) - 1;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  // const otp = otp.toString();  // Convert the OTP to a string (if needed)

  return otp;
};

// Function to generate random password string for driver login
exports.generateRandomPassword = (length) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

exports.role_arr = () => {
  const auth_arr = [ROLE.ADMIN, ROLE.APP_GUEST_USER, ROLE.APP_USER];
  return auth_arr;
};

exports.replacePlaceholders = async (text, replacements) => {
  for (const placeholder in replacements) {
    if (Object.hasOwnProperty.call(replacements, placeholder)) {
      const regex = new RegExp(`{${placeholder}}`, "g");
      text = text?.replace(regex, replacements[placeholder]);
    }
  }
  return text;
};

exports.convertDateToYYYYMMDD = (date) => {
  if(!date) {
    return null;
  }
  const parsedDate = new Date(date);
  if(isNaN(parsedDate.getTime())) {
    return null;
  } 
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2,'0');
  const day = String(parsedDate.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
};

exports.enhanceGoogleProfilePic = async (url, size = 250, uploadDir = path.join(path.resolve('./uploads/profiles'))) => {
  try { 
    let editedURL;
    if (url.includes("=s")) {
        // Replace existing size
        editedURL = url.replace(/=s\d+/, `=s${size}`);
    } else {
        // Append size if not present
        editedURL = url;
    }

    const filename = `${Date.now()}_profilepic.jpg`;
    const filepath = path.join(uploadDir,filename);
    const success = await downloadImage(editedURL,filepath);
    if(!success) {
      throw new Error('Failed to download or save the image from the google.');
    }
    return filename;
  } catch (error) {
    console.log('error in enhancing google profile: ', error);
    throw error;
  }
};

// Function to download an image using axios and save it to a given filePath
// async function downloadImage(url, filePath) {
//   try {
//       const response = await axios({
//           url,
//           method: 'GET',
//           responseType: 'stream',
//       });

//       return new Promise((resolve, reject) => {
//           const writer = fs.createWriteStream(filePath);
//           response.data.pipe(writer);
//           writer.on('finish', () => resolve(true));
//           writer.on('error', (err) => {
//               fs.unlinkSync(filePath);
//               reject(err);
//           });
//       });
//   } catch (error) {
//       return false;
//   }
// };

exports.storeFacebookProfileImage = async (accessToken, imageUrl, uploadDir = path.join(path.resolve('./uploads/profiles'))) => {
  try {
      if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filename = `${Date.now()}_profilepic.jpg`;
      const filePath = path.join(uploadDir,filename);

      const largeImgUrl = `https://graph.facebook.com/v22.0/me/picture?type=large&access_token=${accessToken}`;

      let success = await downloadImage(largeImgUrl, filePath);
      if (!success) {
          success = await downloadImage(imageUrl, filePath);
      }
      if (success) {
          return filename;
      } else {
          throw new Error('Failed to download or save the image from the facebook.');
      }
  } catch (error) {
      throw error;
  }
};

exports.removeDuplicateToken = async (token) => {
  try {
    await db.UserMaster.update({
      FCMRegId: null
    }, { 
      where : { FCMRegId: token }
    });
  } catch(error) {
    console.log("Error in removing duplicate tokens: ", error);
    throw error;
  }
};

exports.getDeviceType = (userAgent = "") => {
  const ua = String(userAgent).toLowerCase();
  if (ua.includes("windows")) return "WINDOWS";
  if (ua.includes("iphone") || ua.includes("ios")) return "IOS";
  if (ua.includes("android")) return "ANDROID";
  return "OTHER";
};

exports.readHTMLFile = (path, callback) => {
  try {
    fs.readFile(path, { encoding: "utf-8" }, (err, html) => {
      if (err) {
        throw err;
      } else {
        callback(null, html);
      }
    });
  } catch (error) {
    console.log("Error in reading HTML file:", error);
    callback(error);
  }
};