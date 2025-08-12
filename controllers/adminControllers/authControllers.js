const universalFunction = require('../../common/helper/universalFunction');
const { signIn, getProfile, updateProfile, updatePassword, signOut } = require('../../services/adminServices/authServices');
const { validationResult } = require("express-validator");

exports.signIn = async (req, res) => {
   try {
    if (validationResult(req).errors.length > 0) {
      return universalFunction.sendErrorResponse(
        res,
        validationResult(req).errors[0].msg,
        400
      );
    }
    const { statusCode, message, data } = await signIn(req);
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

exports.getProfile = async (req, res) => {
   try {
    const { statusCode, message, data } = await getProfile(req);
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
    if (validationResult(req).errors.length > 0) {
      return universalFunction.sendErrorResponse(
        res,
        validationResult(req).errors[0].msg,
        400
      );
    }
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

exports.updatePassword = async (req, res) => {
   try {
    if (validationResult(req).errors.length > 0) {
      return universalFunction.sendErrorResponse(
        res,
        validationResult(req).errors[0].msg,
        400
      );
    }
    const { statusCode, message, data } = await updatePassword(req);
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

exports.signOut = async (req, res) => {
   try {
    const { statusCode, message, data } = await signOut(req);
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