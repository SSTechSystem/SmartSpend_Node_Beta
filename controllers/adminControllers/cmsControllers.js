const { validationResult } = require("express-validator");
const universalFunction = require("../../common/helper/universalFunction");
const { getCmsData, addCms, getCmsDetails, viewCms, deleteCms } = require("../../services/adminServices/cmsServices");

exports.getCmsData = async (req, res) => {
  try {
    const { statusCode, message, data } = await getCmsData(req);
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

exports.addCms = async (req, res) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return universalFunction.sendErrorResponse(
        res,
        validationResult(req).errors[0].msg,
        400
      );
    }
    const { statusCode, message, data } = await addCms(req);
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

exports.getCmsDetails = async (req, res) => {
  try {
    const { statusCode, message, data } = await getCmsDetails(req);
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

exports.viewCms = async (req, res) => {
  try {
    const { statusCode, message, data } = await viewCms(req);
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

exports.deleteCms = async (req, res) => {
  try {
    const { statusCode, message, data } = await deleteCms(req);
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