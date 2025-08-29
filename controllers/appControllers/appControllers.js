const universalFunction = require("../../common/helper/universalFunction");
const { getCountryList, userSkip } = require("../../services/appServices/appServices");
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
