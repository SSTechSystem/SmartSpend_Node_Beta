const db = require("../../models/index");
const countries = require("../../common/constant/countries.json");
const constant = require("../../common/constant/constant.json");
const common = require("../../common/statics/static.json");
const { generateToken } = require("../../common/helper/auth");
const { isEmpty, getDeviceType } = require("../../common/utils/utils");
const { Sequelize, Op } = require("sequelize");

exports.userSkip = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const { CurrencyCountry, CurrencyCode, CurrencySymbol, DeviceType } = req.body;

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

    const created = await db.UserMaster.create(usermaster_data);

    if (!createdUser?.Id) {
      throw new Error("User data insertion failed");
    }
    
    const token = await generateToken({ Id: created.Id });
    await db.UserMaster.update({ AuthToken: token }, { where: { Id: created.Id } });

    const responseData = {
      Id: createdUser.Id,
      RoleId: createdUser.RoleId,
      CurrencyCountry: createdUser.CurrencyCountry,
      CurrencyCode: createdUser.CurrencyCode,
      CurrencySymbol: createdUser.CurrencySymbol,
      DeviceType: createdUser.DeviceType,
      AuthToken: token
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
