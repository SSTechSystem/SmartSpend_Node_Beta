const universalFunction = require("../../common/helper/universalFunction");
const {
  getDashboardData,
  getCustomersData,
  getFeedbacksData,
  getBackupsData,
  adminAddOrEdit,
  getAdminsData,
  getAdminDetails,
  adminDelete
} = require("../../services/adminServices/adminServices");
const { validationResult } = require("express-validator");

exports.getDashboardData = async (req, res) => {
  try {
    const { statusCode, message, data } = await getDashboardData(req);
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

exports.getCustomersData = async (req, res) => {
  try {
    const { statusCode, message, data } = await getCustomersData(req);
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

exports.getFeedbacksData = async (req, res) => {
  try {
    const { statusCode, message, data } = await getFeedbacksData(req);
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

exports.getBackupsData = async (req, res) => {
  try {
    const { statusCode, message, data } = await getBackupsData(req);
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

exports.adminAddOrEdit = async (req, res) => {
  try {
    if (validationResult(req).errors.length > 0) {
      return universalFunction.sendErrorResponse(
        res,
        validationResult(req).errors[0].msg,
        400
      );
    }
    const { statusCode, message, data } = await adminAddOrEdit(req);
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

exports.getAdminsData = async (req, res) => {
  try {
    const { statusCode, message, data } = await getAdminsData(req);
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

exports.getAdminDetails = async (req, res) => {
  try {
    const { statusCode, message, data } = await getAdminDetails(req);
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

exports.adminDelete = async (req, res) => {
  try {
    const { statusCode, message, data } = await adminDelete(req);
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
