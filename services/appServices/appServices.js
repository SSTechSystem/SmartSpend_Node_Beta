const db = require("../../models/index");
const countries = require("../../common/constant/countries.json");
const constant = require("../../common/constant/constant.json");
const common = require("../../common/statics/static.json");
// const { generateToken } = require("../../common/helper/auth");
const {
  isEmpty,
  getDeviceType,
  generateOTP,
  readHTMLFile,
  enhanceGoogleProfilePic,
} = require("../../common/utils/utils");
const handlebars = require("handlebars");
const path = require("path");
const { sendMail } = require("../../common/utils/sendEmail");
const smartspendDB = require("../../config/dbconfig");
const { QueryTypes } = require("sequelize");
const moment = require("moment");
const axios = require("axios");

//** Helper functions - START **//
const handleGmailAuth = async (id_token) => {
  try {
    const response = await axios.get(
      `${constant.GOOGLE_TOKENINFO_BASE_URL}${id_token}`
    );
    if (!response.data) {
      throw new Error("Empty response from Google token verification");
    }

    const payload = response.data;
    const gmailData = {
      email: payload.email,
      name: payload.name,
      picture: await enhanceGoogleProfilePic(payload.picture),
    };
    return gmailData;
  } catch (error) {
    console.error("Google token verification failed:", error);
    return { error: true };
  }
};

const validateUserStatus = (db_user_data, Name, login_with, Id) => {
  if (!Name && !db_user_data && login_with !== "gmail") {
    return common.response_msg.user_not_found;
  }
  if (Name && db_user_data?.IsAuthorizedAppUser === 1 && !Id) {
    return common.response_msg.email_exist;
  }
  if (
    Name &&
    db_user_data?.IsAuthorizedAppUser === 1 &&
    Id &&
    login_with === "default"
  ) {
    return common.response_msg.email_already_registered_with_google;
  }
  if (
    !Name &&
    db_user_data?.IsAuthorizedAppUser === 0 &&
    login_with !== "gmail"
  ) {
    return common.response_msg.email_not_verified;
  }
  return null;
};

const prepareUserData = ({ db_user_data, gmailData, req, input }) => {
  const AuthorizationCode = generateOTP();
  const ip =
    req.ip ||
    req.connection.remoteAddress ||
    req.headers["x-forwarded-for"]?.split(",")[0];
  const useragent = req.headers["user-agent"];
  const device = input.DeviceType || getDeviceType(useragent);

  return {
    Name: db_user_data?.Name || gmailData?.name || input.Name || "",
    RoleId: constant.ROLE.APP_USER,
    Email: input.Email || gmailData?.email,
    ForgotEmailToken: AuthorizationCode,
    IPAddress: ip,
    DeviceType: device,
    UserAgent: useragent,
    expire_email_token: !gmailData?.email ? new Date(Date.now() + 30 * 60 * 1000) : null, // OTP will expire in 30 minutes
    CurrencyCountry: input.CurrencyCountry,
    CurrencyCode: input.CurrencyCode,
    CurrencySymbol: input.CurrencySymbol,
    Phone: db_user_data?.Phone || input.Phone,
    ...(gmailData && {
      GoogleProfilePhoto: gmailData.picture,
      IsAuthorizedAppUser: 1,
    }),
    ...(db_user_data && {
      PurposeOfProfile: db_user_data.PurposeOfProfile || "",
      ProfilePhoto: db_user_data.ProfilePhoto || "",
      MoreInformation: db_user_data.MoreInformation || "",
      PrimaryBankAccountNumber: db_user_data.PrimaryBankAccountNumber || "",
      PrimaryBankName: db_user_data.PrimaryBankName || "",
    }),
  };
};

const handleUserUpsert = async (db_user_data, usermaster_data, Id) => {
  let user_insert_update_data;
  let ExistingUser = 0;

  if (db_user_data?.Id || Id) {
    const userId = db_user_data?.Id || Id;
    ExistingUser =
      db_user_data?.Id && db_user_data?.IsAuthorizedAppUser ? 1 : 0;
    await db.UserMaster.update(usermaster_data, { where: { Id: userId } });
    user_insert_update_data = { Id: userId };
  } else {
    user_insert_update_data = await db.UserMaster.create(usermaster_data);
  }

  return { user_insert_update_data, ExistingUser };
};

const determineSuccessMessage = (Name, google_api_email) => {
  if (!Name) {
    return google_api_email
      ? common.response_msg.user_registered_successfully
      : common.response_msg.user_loggedin_successfully;
  }
  return common.response_msg.user_registered_successfully;
};

const sendVerificationEmail = async (Email, AuthorizationCode) => {
  try {
    await readHTMLFile(
      path.join(__dirname, "../../views/email_template/verify_otp.html"),
      function (_, html) {
        var template = handlebars.compile(html);
        const image_path = constant.BASE_URL + "/public/smart_spend_logo.png";
        var replacements = {
          USER_OTP: AuthorizationCode,
          INQUIRY_EMAIL: process.env.INQUIRY_EMAIL,
          LOGO_IMG: image_path,
        };
        var htmlToSend = template(replacements);
        const sub = "One-Time Login Code";
        const text = htmlToSend;
        sendMail(Email, sub, text);
      }
    );
  } catch (error) {
    console.error("Email sending failed:", error);
    return true; // Indicate error
  }
  return false; // No error
};

const prepareUpdateData = (fields) => {
  const updateData = {};
  const fieldMappings = {
    Name: String,
    Email: String,
    RoleId: String,
    PurposeOfProfile: String,
    Phone: String,
    MoreInformation: String,
    PrimaryBankAccountNumber: String,
    PrimaryBankName: String,
    CurrencyCountry: { type: String, default: "United States of America" },
    CurrencyCode: { type: String, default: "USD" },
    CurrencySymbol: { type: String, default: "$" },
    DateFormat: { type: String, default: "dd-MM-yyyy" },
    OpeningBalance: { type: String, default: "0.00" },
    CarryForward: { type: String, default: "0" },
    Theme: { type: String, default: "F16D7C" },
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (key in fieldMappings) {
      const fieldConfig = fieldMappings[key];
      if (typeof fieldConfig === "function") {
        // Simple field without default
        if (value !== undefined) {
          updateData[key] = value;
        }
      } else {
        // Field with default value
        updateData[key] = value || fieldConfig.default;
      }
    }
  });

  return updateData;
};
//** Helper functions - END **//

exports.userSkip = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const { CurrencyCountry, CurrencyCode, CurrencySymbol, DeviceType } =
      req.body;

    const userAgent = req.headers["user-agent"] || "";
    const device = DeviceType || getDeviceType(userAgent);

    const usermaster_data = {
      RoleId: constant.ROLE.APP_GUEST_USER,
      CurrencyCountry,
      CurrencyCode,
      CurrencySymbol,
      DeviceType: device,
      UserAgent: userAgent,
    };

    const createdUser = await db.UserMaster.create(usermaster_data);

    if (!createdUser?.Id) {
      throw new Error("User data insertion failed");
    }

    // const token = await generateToken({ Id: createdUser.Id });
    // await db.UserMaster.update(
    //   { AuthToken: token },
    //   { where: { Id: createdUser.Id } }
    // );

    const responseData = {
      Id: createdUser.Id,
      RoleId: createdUser.RoleId,
      CurrencyCountry: createdUser.CurrencyCountry,
      CurrencyCode: createdUser.CurrencyCode,
      CurrencySymbol: createdUser.CurrencySymbol,
      DeviceType: createdUser.DeviceType,
      // AuthToken: token,
    };

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.user_data_inserted;
    res_arr.data = responseData;
    return res_arr;
  } catch (error) {
    console.log("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.getCountryList = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const countryList = countries.map((country) => ({
      Name: country.Name,
      CurrencyCode: country.CurrencyCode,
      CurrencySymbol: country.CurrencySymbol,
    }));

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.country_list;
    res_arr.data = countryList;
    return res_arr;
  } catch (error) {
    console.log("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.userAuthorization = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const { Id, ForgotEmailToken } = req.body;

    const userData = await db.UserMaster.findOne({
      where: { Id },
      raw: true,
    });

    if (isEmpty(userData)) {
      res_arr.statusCode = common.response_status_code.not_found;
      res_arr.type = common.response_type.error;
      res_arr.message = common.response_msg.user_not_found;
      return res_arr;
    }

    const currentTime = moment();
    if (
      userData.ForgotEmailToken !== ForgotEmailToken ||
      moment(userData.expire_email_token).isSameOrBefore(currentTime)
    ) {
      res_arr.statusCode = common.response_status_code.unauthorized;
      res_arr.type = common.response_type.error;
      res_arr.message = common.response_msg.invalid_token;
      return res_arr;
    }

    await db.UserMaster.update(
      {
        IsAuthorizedAppUser: 1,
        ForgotEmailToken: null,
        expire_email_token: null,
      },
      { where: { Id } }
    );

    const updatedUserData = await db.UserMaster.findOne({
      where: { Id },
      raw: true,
    });

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.user_authorized;
    res_arr.data = updatedUserData;
    return res_arr;
  } catch (error) {
    console.log("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.newUserSubmit = async (req) => {
  try {
    const {
      Email,
      login_with,
      CurrencyCountry,
      CurrencyCode,
      CurrencySymbol,
      id_token,
      Name,
      Phone,
      Id,
      DeviceType,
    } = req.body;

    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    if (!Email && login_with !== "gmail") {
      return {
        ...res_arr,
        message: common.response_msg.email_required,
      };
    }

    const gmailData =
      login_with === "gmail" && id_token
        ? await handleGmailAuth(id_token)
        : null;

    if (gmailData?.error) {
      return {
        ...res_arr,
        message: common.response_msg.google_token_verification_failed,
      };
    }

    const db_user_data = await db.UserMaster.findOne({
      where: { Email: Email || gmailData?.email },
      raw: true,
    });

    const validationError = validateUserStatus(
      db_user_data,
      Name,
      login_with,
      Id
    );
    if (validationError) {
      return {
        ...res_arr,
        message: validationError,
      };
    }

    const usermaster_data = prepareUserData({
      db_user_data,
      gmailData,
      req,
      input: {
        Name,
        Email,
        Phone,
        CurrencyCountry,
        CurrencyCode,
        CurrencySymbol,
        DeviceType,
      },
    });

    const { user_insert_update_data, ExistingUser } = await handleUserUpsert(
      db_user_data,
      usermaster_data,
      Id
    );

    if (!user_insert_update_data) {
      return {
        ...res_arr,
        message: common.response_msg.common_error,
      };
    }

    if (!login_with || login_with !== "gmail") {
      const emailError = await sendVerificationEmail(
        Email,
        usermaster_data.ForgotEmailToken
      );
      if (emailError) {
        return {
          ...res_arr,
          message: common.response_msg.something_went_wrong_while_sending_email,
        };
      }
    }

    const user_data = await db.UserMaster.findOne({
      where: { Id: user_insert_update_data.Id },
      raw: true,
    });

    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: determineSuccessMessage(Name, gmailData?.email),
      data: {
        ...user_data,
        ExistingUser: ExistingUser ? "1" : "0",
        ProfilePhotoURL: user_data.ProfilePhoto || user_data.GoogleProfilePhoto,
      },
    };
  } catch (error) {
    console.error("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.getUserData = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const { Id } = req.body;
    if (isEmpty(Id)) {
      res_arr.message = common.response_msg.id_required;
      return res_arr;
    }

    const userData = await db.UserMaster.findOne({
      where: { Id },
      raw: true,
    });

    if (isEmpty(userData)) {
      res_arr.statusCode = common.response_status_code.not_found;
      res_arr.message = common.response_msg.user_not_found;
      return res_arr;
    }

    // Set ProfilePhotoURL preference (ProfilePhoto or GoogleProfilePhoto)
    userData.ProfilePhotoURL =
      userData.ProfilePhoto || userData.GoogleProfilePhoto;

    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.user_data_fetched,
      data: userData,
    };
  } catch (error) {
    console.error("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.updateUserData = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const { Id, ...updateFields } = req.body;

    if (isEmpty(Id)) {
      res_arr.message = common.response_msg.id_required;
      return res_arr;
    }

    // Prepare update data with default value
    const usermaster_data = prepareUpdateData(updateFields);

    await db.UserMaster.update(usermaster_data, {
      where: { Id },
    });

    const userData = await db.UserMaster.findOne({
      where: { Id },
      raw: true,
    });

    return {
      statusCode: common.response_status_code.success,
      type: common.response_type.success,
      message: common.response_msg.user_data_updated,
      data: userData,
    };
  } catch (error) {
    console.error("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.updateProfile = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const { Id, ...updateFields } = req.body;

    if (isEmpty(Id)) {
      res_arr.message = common.response_msg.id_required;
      return res_arr;
    }

    const usermaster_data = {
      ...(req.file && { ProfilePhoto: req.file.filename }),
      Name: updateFields.Name || "",
      PurposeOfProfile: updateFields.PurposeOfProfile || "",
      Phone: updateFields.Phone || "",
      MoreInformation: updateFields.MoreInformation || "",
      PrimaryBankAccountNumber: updateFields.PrimaryBankAccountNumber || "",
      PrimaryBankName: updateFields.PrimaryBankName || "",
      OpeningBalance: updateFields.OpeningBalance || "0.00",
      CarryForward: updateFields.CarryForward || "0",
      CurrencyCountry:
        updateFields.CurrencyCountry || "United States of America",
      CurrencyCode: updateFields.CurrencyCode || "USD",
      CurrencySymbol: updateFields.CurrencySymbol || "$",
      DateFormat: updateFields.DateFormat || "dd-MM-yyyy",
      Theme: updateFields.Theme || "F16D7C",
    };

    // Update user data
    await db.UserMaster.update(usermaster_data, {
      where: { Id },
    });

    // Get updated user data
    const userData = await db.UserMaster.findOne({
      where: { Id },
      raw: true,
    });

    if (isEmpty(userData)) {
      res_arr.message = common.response_msg.profile_not_found;
      return res_arr;
    }

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.profile_updated;
    res_arr.data = userData;
    return res_arr;
  } catch (error) {
    console.error("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.deleteProfile = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const { Id } = req.body;
    if (isEmpty(Id)) {
      res_arr.message = common.response_msg.id_required;
      return res_arr;
    }

    // Start a transaction to ensure data consistency
    const transaction = await smartspendDB.transaction();

    try {
      // First, delete any existing backups for this user
      await db.Backup.destroy({
        where: { UserId: Id },
        transaction,
      });

      // Then delete the user from usermaster
      await db.UserMaster.destroy({
        where: { Id },
        transaction,
      });

      // If both operations succeed, commit the transaction
      await transaction.commit();
      res_arr.statusCode = common.response_status_code.success;
      res_arr.type = common.response_type.success;
      res_arr.message = common.response_msg.profile_deleted;
      return res_arr;
    } catch (error) {
      // If any operation fails, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.feedbackAdd = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const { Name, Email, UserId, AppExperience, Message } = req.body;
    const feedback_data = {
      Name,
      Email,
      AppExperience,
      Message,
      UserId,
      CreatedAt: new Date(),
    };

    const createdFeedback = await db.Feedback.create(feedback_data);
    if (isEmpty(createdFeedback)) {
      res_arr.message = common.response_msg.common_error;
      return res_arr;
    }

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.feedback_submitted;
    return res_arr;
  } catch (error) {
    console.error("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.logout = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const { Id } = req.body;
    if (isEmpty(Id)) {
      res_arr.message = common.response_msg.id_required;
      return res_arr;
    }

    await db.UserMaster.update(
      {
        // AuthToken: null, // Clear the auth token
        LastLogin: new Date(), // Track last login time
      },
      {
        where: { Id },
      }
    );

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.logout_success;
    return res_arr;
  } catch (error) {
    console.error("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.getVersionHistory = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const { Platform } = req.body;

    const versionHistory = await smartspendDB.query(
      `SELECT vh.*, pg.Id as page_id 
       FROM version_history vh 
       INNER JOIN pages pg ON vh.cms_id = pg.Id 
       WHERE vh.Platform = ? 
         AND pg.IsRelease = 1 
         AND pg.Enable = 1 
       ORDER BY vh.created_at DESC`,
      {
        replacements: [Platform],
        type: QueryTypes.SELECT,
        raw: true,
      }
    );

    if (isEmpty(versionHistory)) {
      res_arr.statusCode = common.response_status_code.not_found;
      res_arr.message = common.response_msg.version_history_not_found;
      res_arr.data = {
        totalcount: 0,
        versionhistory: [],
      };
      return res_arr;
    }

    const transformedData = versionHistory.map((version) => ({
      cms_id: version.cms_id,
      Description: version.Description,
      IsForce: version.IsForce,
      VersionNumber: version.Title,
      Platform: version.Platform === 1 ? "Android" : "Ios",
    }));

    res_arr.statusCode = common.response_status_code.success;
    res_arr.message = common.response_msg.version_history_get;
    res_arr.data = {
      totalcount: transformedData.length,
      versionhistory: transformedData,
    };
    return res_arr;
  } catch (error) {
    console.error("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.resendOtp = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const { Id } = req.body;
    if (isEmpty(Id)) {
      res_arr.message = common.response_msg.id_required;
      return res_arr;
    }

    const userData = await db.UserMaster.findOne({ where: { Id } });
    if (isEmpty(userData)) {
      res_arr.message = common.response_msg.user_not_found;
      return res_arr;
    }

    const otp = generateOTP();
    userData.ForgotEmailToken = otp;
    (userData.expire_email_token = new Date(Date.now() + 30 * 60 * 1000)), // OTP will expire in 30 minutes
      await userData.save();
    const emailError = await sendVerificationEmail(userData.Email, otp);
    if (emailError) {
      return {
        ...res_arr,
        message: common.response_msg.something_went_wrong_while_sending_email,
      };
    }

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.otp_sent;
    return res_arr;
  } catch (error) {
    console.error("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};
