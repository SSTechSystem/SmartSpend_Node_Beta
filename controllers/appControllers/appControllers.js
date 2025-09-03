const universalFunction = require("../../common/helper/universalFunction");
const {
  getCountryList,
  userSkip,
  userAuthorization,
  newUserSubmit,
  getUserData,
  updateUserData,
  updateProfile,
  deleteProfile,
  feedbackAdd,
  getVersionHistory,
  logout,
  resendOtp
} = require("../../services/appServices/appServices");
const { validationResult } = require("express-validator");

exports.getCountryList = async (req, res) => {
  try {
    const { statusCode, message, data } = await getCountryList(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};

exports.userSkip = async (req, res) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return universalFunction.sendErrorResponse(
        res,
        validationResult(req).errors[0].msg,
        400
      );
    }
    const { statusCode, message, data } = await userSkip(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};

exports.userAuthorization = async (req, res) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return universalFunction.sendErrorResponse(
        res,
        validationResult(req).errors[0].msg,
        400
      );
    }
    const { statusCode, message, data } = await userAuthorization(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};

exports.newUserSubmit = async (req, res) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return universalFunction.sendErrorResponse(
        res,
        validationResult(req).errors[0].msg,
        400
      );
    }
    const { statusCode, message, data } = await newUserSubmit(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};

exports.getUserData = async (req, res) => {
  try {
    const { statusCode, message, data } = await getUserData(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};

exports.updateUserData = async (req, res) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return universalFunction.sendErrorResponse(
        res,
        validationResult(req).errors[0].msg,
        400
      );
    }
    const { statusCode, message, data } = await updateUserData(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { statusCode, message, data } = await updateProfile(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const { statusCode, message, data } = await deleteProfile(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};

exports.feedbackAdd = async (req, res) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return universalFunction.sendErrorResponse(
        res,
        validationResult(req).errors[0].msg,
        400
      );
    }
    const { statusCode, message, data } = await feedbackAdd(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};

exports.logout = async (req, res) => {
  try {
    const { statusCode, message, data } = await logout(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};

exports.getVersionHistory = async (req, res) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return universalFunction.sendErrorResponse(
        res,
        validationResult(req).errors[0].msg,
        400
      );
    }
    const { statusCode, message, data } = await getVersionHistory(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { statusCode, message, data } = await resendOtp(req);
    return universalFunction.sendSuccessResponse(
      res,
      statusCode,
      message,
      data || {}
    );
  } catch (error) {
    console.log("error: ", error);
    return universalFunction.sendErrorResponse(res, error);
  }
};
