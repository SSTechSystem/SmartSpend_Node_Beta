const jwt = require("jsonwebtoken");
const common = require("../statics/static.json");
const universalFunction = require("../helper/universalFunction");
const { Sequelize, QueryTypes } = require("sequelize");
const smartspendDB = require("../../config/dbconfig");

const secretkey = process.env.JWT_SECRET;

exports.generateToken = async (user) => {
  try {
    const payload = {
      id: user.Id,
      email: user.Email,
    };

    return await jwt.sign(payload, secretkey);
  } catch (error) {
    console.error("error in creating token: ", error);
  }
};

exports.verifyToken = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.headers.authorization)
        throw common.response_msg.blank_auth_token;
      const token = req.headers.authorization.replace("Bearer ", "");
      if (!token) throw common.response_msg.blank_auth_token;

      jwt.verify(token, secretkey, (err) => {
        if (err) throw common.response_msg.invalid_token;
      });

      const user_details = await smartspendDB.query(
        "SELECT Id, Name, Email, RoleId FROM usermaster WHERE AuthToken = :token",
        {
          replacements: { token },
          type: QueryTypes.SELECT,
          raw: true,
        }
      );

      if (!user_details || user_details.length === 0) {
        throw common.response_msg.invalid_token;
      }

      if (!requiredRole.includes(user_details[0].RoleId)) {
        throw common.response_msg.unauthorized_action;
      }
      req.userProfile = user_details[0];
      next();
    } catch (error) {
      console.error("error in verifying token: ", error);
      return universalFunction.sendErrorResponse(
        res,
        error || common.response_msg.unauthorized_action,
        common.response_status_code.unauthorized
      );
    }
  };
};

exports.verifyEmail = async (email) => {
  try {
    const [result, metadata] = await smartspendDB.query(
      `SELECT * FROM usermaster WHERE Email = :email`,
      {
        replacements: { email },
        type: Sequelize.QueryTypes.SELECT,
        raw: true,
      }
    );

    if(result && Object.keys(result).length > 0){
      return { success: true, message: "user exist" };
    }
    return { success: false, message: "Email address not found" };
  } catch (error) {
    console.log("Error in verifying email: ", error);
    return {
      success: false,
      message: "something went wrong while verifying email",
    };
  }
};
