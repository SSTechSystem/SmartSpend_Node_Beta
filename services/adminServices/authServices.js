const bcrypt = require('bcryptjs');
const db = require('../../models/index');
const common = require('../../common/statics/static.json');
const { generateToken } = require('../../common/helper/auth');
const { isEmpty } = require('../../common/utils/utils');
const generatePassword = require('../../common/helper/generateEncryptedPassword');

exports.signIn = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const { email, password } = req.body;

    const existUser = await db.UserMaster.findOne({
      where: {
        Email: email,
        RoleId: 1,
        Enable: 1,
      },
      attributes: ['Id', 'Email', 'Name', 'Password'],
    });

    if (!isEmpty(existUser)) {
      const passwordMatch = await bcrypt.compare(password, existUser.Password);
      if (passwordMatch) {
        const user = {
          Id: existUser.Id,
          Email: existUser.Email,
        };
        const authToken = await generateToken(user);
        existUser.AuthToken = authToken;
        existUser.save();

        res_arr.statusCode = common.response_status_code.success;
        res_arr.type = common.response_type.success;
        res_arr.message = common.response_msg.user_loggedin;
        res_arr.data = {
          username:  existUser.Name,
          email: existUser.Email,
          token: authToken,
        };

        return res_arr;
      } else {
        res_arr.message = common.response_msg.invalid_login_details;
        return res_arr;
      }
    } else {
      res_arr.message = common.response_msg.invalid_login_details;
      return res_arr;
    }
  } catch (error) {
    console.log("error: ", error);
    return {
      statusCode: common.response_status_code.internal_error,
      type: common.response_type.error,
      message: common.response_msg.catch_error,
    };
  }
};

exports.getProfile = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const { Id } = req.userProfile;
    const  userDetails = await db.UserMaster.findOne({
      where: { Id },
      attributes: ['Id', 'Name', 'Email', 'Phone'],
      raw: true
    });

    if (isEmpty(userDetails)) {
      res_arr.statusCode = common.response_status_code.not_found;
      res_arr.message = common.response_msg.profile_not_found;
      return res_arr;
    }
    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.profile_found;
    res_arr.data = userDetails;
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

exports.updateProfile = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const { Id } = req.userProfile;
    const { name, email, phone } = req.body;

    await db.UserMaster.update(
      { Name: name, Email: email, Phone: phone },
      { where: { Id } }
    );

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.profile_updated;
    res_arr.data = { Id, Name: name, Email: email, Phone: phone };
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

exports.updatePassword = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const { Id } = req.userProfile;
    const { oldPassword, newPassword } = req.body;

    const user = await db.UserMaster.findOne({
      where: { Id },
      attributes: ['Id', 'Password'],
    });

    if (!user) {
      res_arr.statusCode = common.response_status_code.not_found;
      res_arr.message = common.response_msg.user_not_found;
      return res_arr;
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.Password);
    if (!passwordMatch) {
      res_arr.message = common.response_msg.oldpassword_incorrect;
      return res_arr;
    }

    const hashedNewPassword = await generatePassword(newPassword);
    await db.UserMaster.update(
      { Password: hashedNewPassword },
      { where: { Id } }
    );

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.reset_pass;
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

exports.signOut = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const { Id } = req.userProfile;
    await db.UserMaster.update({ AuthToken: null }, { where: { Id } });
    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.logout_done;
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