const {
  response_msg,
  response_status_code,
  response_success,
  response_type,
} = require("../statics/static.json");

/**
 *
 * @param {*} res - Response Data
 * @param {*} code - Status Code
 * @param {*} message - Message
 * @param {*} data - Reponse Body
 * @param {*} type - Flag for Reponse Success or Failure
 * @param {*} success - Flag for Reponse Success or Failure
 */

const sendSuccessResponse = async (
  res,
  code,
  message,
  data = {},
  type = response_type.error,
  success = response_success.false,
  page = null, // Optional pagination parameters
  limit = null,
  totalRecords = null,
  totalPages = null
) => {
  try {
    if (code == response_status_code.success) {
      success = response_success.true;
      type = response_type.success;
    }

    // Construct the response object
    const response = {
      statusCode: code,
      success,
      type,
      message,
      data,
    };

    // Add pagination to the response if it's provided
    if (page !== null) response.page = page;
    if (limit !== null) response.limit = limit;
    if (totalRecords !== null) response.totalRecords = totalRecords;
    if (totalPages !== null) response.totalPages = totalPages;

    return res.status(code).send(response);
  } catch (error) {
    return res.status(response_status_code.internal_error).json({
      statusCode: response_status_code.internal_error,
      success: response_success.false,
      type: response_type.error,
      message: error,
      data: {},
    });
  }
};

/**
 *
 * @param {*} res - Response Data
 * @param {*} code - Status Code
 * @param {*} error - Error
 * @param {*} data - Reponse Body
 * @param {*} type - Flag for Reponse Success or Failure
 * @param {*} success - Flag for Reponse Success or Failure
 */
const sendErrorResponse = async (
  res,
  error,
  code = response_status_code.internal_error,
  data = {},
  type = response_type.error,
  success = response_success.false
) => {
  try {
    let message = response_msg.common_error;
    if (error && error.message) {
      message = error.message;
    } else if (error && !error.message) {
      message = error;
    }

    return res
      .status(code)
      .send({ statusCode: code, success, type, message, data });
  } catch (error) {
    return res.status(code).json({
      statusCode: code,
      success: response_success.false,
      type: response_type.error,
      message: error,
      data: {},
    });
  }
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
};
