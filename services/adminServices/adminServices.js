const db = require("../../models/index");
const constant = require("../../common/constant/constant.json");
const common = require("../../common/statics/static.json");
const smartspendDB = require("../../config/dbconfig");
const { Sequelize } = require("sequelize");
const moment = require("moment");
const generatePassword = require("../../common/helper/generateEncryptedPassword");

exports.getDashboardData = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const dashboardStats = await smartspendDB.query(
      `
        SELECT
            (SELECT COUNT(*) FROM UserMaster WHERE RoleId = :adminRole AND Enable = 1) as adminCount,
            (SELECT COUNT(*) FROM UserMaster WHERE RoleId = :appUserRole AND Enable = 1) as appUserCount,
            (SELECT COUNT(*) FROM UserMaster WHERE RoleId = :guestRole AND Enable = 1) as guestUserCount,
            (SELECT COUNT(*) FROM Feedback WHERE IsRead = 1) as viewedFeedbackCount,
            (SELECT COUNT(*) FROM Feedback) as totalFeedbackCount
        `,
      {
        replacements: {
          adminRole: constant.ROLE.ADMIN,
          appUserRole: constant.ROLE.APP_USER,
          guestRole: constant.ROLE.APP_GUEST_USER,
        },
        type: Sequelize.QueryTypes.SELECT,
        plain: true,
      }
    );

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.dashboard_data_get;
    res_arr.data = {
      totalRegisteredAdmins: dashboardStats.adminCount,
      totalRegisteredAppUsers: dashboardStats.appUserCount,
      totalGuestUsers: dashboardStats.guestUserCount,
      totalViewedFeedbacks: dashboardStats.viewedFeedbackCount,
      totalFeedbacks: dashboardStats.totalFeedbackCount,
    };
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

exports.getCustomersData = async (req) => {
  try {
    let {
      page,
      limit,
      search,
      user_role,
      device_type,
      start_date,
      end_date,
      sortby,
      order_type,
    } = req.query;
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    page = parseInt(page) || constant.DEFAULT_PAGE;
    limit = parseInt(limit) || constant.DEFAULT_PAGE_LIMIT;
    sortby = sortby || "CreatedAt";
    order_type = order_type || "DESC";
    let query = {};

    if (search) {
      query[Sequelize.Op.or] = [
        { Name: { [Sequelize.Op.like]: `%${search}%` } },
        { Email: { [Sequelize.Op.like]: `%${search}%` } },
        { Phone: { [Sequelize.Op.like]: `%${search}%` } },
      ];
    }

    if (user_role) {
      query.RoleId = user_role;
    }

    if (device_type) {
      query.DeviceType = device_type;
    }

    if (start_date && end_date) {
      query.CreatedAt = {
        [Op.between]: [start_date, moment(end_date).endOf("day")],
      };
    } else if (start_date) {
      query.CreatedAt = {
        [Op.gte]: start_date,
      };
    } else if (end_date) {
      query.CreatedAt = {
        [Op.lte]: moment(end_date).endOf("day"),
      };
    }

    let options = {
      offset: (page - 1) * limit,
      limit: limit,
      order: [[sortby.toLowerCase(), order_type.toLowerCase()]],
    };

    const data = await db.UserMaster.findAndCountAll({
      where: query,
      attributes: [
        "Id",
        "Name",
        "Email",
        "Phone",
        "DeviceType",
        "CreatedAt",
        "Enable",
      ],
      include: [
        {
          model: db.RoleMaster,
          as: "Role",
          attributes: ["RoleId", "Name"],
        },
      ],
      ...options,
    });

    const totalPages = Math.ceil(data.count / limit);
    data.customer_details = data.rows;
    data.limit = limit;
    data.total_pages = totalPages;
    data.total_records = data.count;
    data.current_page = page;

    delete data.rows;
    delete data.count;

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.customer_lists;
    res_arr.data = data;
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

exports.getFeedbacksData = async (req) => {
  try {
    let { page, limit, search, sortby, order_type, date } = req.query;
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    page = parseInt(page) || constant.DEFAULT_PAGE;
    limit = parseInt(limit) || constant.DEFAULT_PAGE_LIMIT;
    sortby = sortby || "CreatedAt";
    order_type = order_type || "DESC";
    let query = {};

    if (search) {
      query[Sequelize.Op.or] = [
        { Name: { [Sequelize.Op.like]: `%${search}%` } },
        { Email: { [Sequelize.Op.like]: `%${search}%` } },
        { AppExperience: { [Sequelize.Op.like]: `%${AppExperience}%` } },
        { Message: { [Sequelize.Op.like]: `%${Message}%` } },
        { IsRead: { [Sequelize.Op.like]: `%${IsRead}%` } },
      ];
    }

    if (date) {
      query.CreatedAt = date;
    }

    const data = await db.Feedback.findAndCountAll({
      where: query,
      order: [[sortby, order_type]],
      offset: (page - 1) * limit,
      limit: limit,
    });

    data.feedbacks_details = data.rows;
    data.limit = limit;
    data.total_pages = Math.ceil(data.count / limit);
    data.current_page = page;
    data.total_records = data.count;

    delete data.rows;
    delete data.count;

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.feedback_lists;
    res_arr.data = data;
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

exports.getBackupsData = async (req) => {
  try {
    let { page, limit, search, sortby, order_type, date } = req.query;
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    page = parseInt(page) || constant.DEFAULT_PAGE;
    limit = parseInt(limit) || constant.DEFAULT_PAGE_LIMIT;
    sortby = sortby || "CreatedAt";
    order_type = order_type || "DESC";
    let query = {};

    if (search) {
      query[Sequelize.Op.or] = [
        { "$user.Name$": { [Sequelize.Op.like]: `%${search}%` } },
        { Email: { [Sequelize.Op.like]: `%${search}%` } },
        { BackupFileName: { [Sequelize.Op.like]: `%${search}%` } },
      ];
    }

    if (date) {
      query.CreatedAt = date;
    }

    const data = await db.Backup.findAndCountAll({
      where: query,
      attributes: ["Id", "BackupFileName", "CreatedAt", "Enable"],
      include: [
        {
          model: db.UserMaster,
          attributes: ["Name"],
        },
      ],
      order: [[sortby, order_type]],
      offset: (page - 1) * limit,
      limit: limit,
    });

    data.backups_details = data.rows;
    data.limit = limit;
    data.total_pages = Math.ceil(data.count / limit);
    data.current_page = page;
    data.total_records = data.count;

    delete data.rows;
    delete data.count;

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.backup_lists;
    res_arr.data = data;
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

exports.adminAddOrEdit = async (req) => {
  try {
    const { name, email, phone, password, is_enable = 1 } = req.body;
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const adminData = {
      Name: name,
      Email: email,
      Phone: phone,
      Enable: is_enable,
      RoleId: constant.ROLE.ADMIN,
    };
    if (password) {
      adminData.Password = await generatePassword(password);
    }

    if (req.method == "POST") {
      await db.UserMaster.create(adminData);
      res_arr.statusCode = common.response_status_code.success;
      res_arr.type = common.response_type.success;
      res_arr.message = common.response_msg.new_admin_added;
    } else {
      if (!req.body.id) {
        return {
          statusCode: common.response_status_code.bad_request,
          type: common.response_type.error,
          message: common.response_msg.id_required,
        };
      }
      await db.UserMaster.update(
        adminData,
        {
          where: {
            Id: req.body.id,
          },
        }
      );

      res_arr.statusCode = common.response_status_code.success;
      res_arr.type = common.response_type.success;
      res_arr.message = common.response_msg.admin_details_updated;
    }

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

exports.getAdminsData = async (req) => {
  try {
    let { page, limit, search, sortby, order_type, date } = req.query;
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    page = parseInt(page) || constant.DEFAULT_PAGE;
    limit = parseInt(limit) || constant.DEFAULT_PAGE_LIMIT;
    sortby = sortby || "CreatedAt";
    order_type = order_type || "DESC";
    let query = {};

    const options = {
      order: [[sortby, order_type]],
      offset: (page - 1) * limit,
      limit: limit,
    };

    if (search) {
      query[Sequelize.Op.or] = [
        { Name: { [Sequelize.Op.like]: `%${search}%` } },
        { Email: { [Sequelize.Op.like]: `%${search}%` } },
        { Phone: { [Sequelize.Op.like]: `%${search}%` } },
      ];
    }

    if (date) {
      query.CreatedAt = date;
    }

    const data = await db.UserMaster.findAndCountAll({
      where: query,
      attributes: [
        "Id",
        "Name",
        "Email",
        "Phone",
        "CreatedAt",
        "LastLogin",
        "Enable",
      ],
      ...options,
    });

    data.backups_details = data.rows;
    data.limit = limit;
    data.total_pages = Math.ceil(data.count / limit);
    data.current_page = page;
    data.total_records = data.count;

    delete data.rows;
    delete data.count;

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.admin_lists;
    res_arr.data = data;
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

exports.getAdminDetails = async (req) => {
  try {
    let { id } = req.params;
    id = parseInt(id);
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    if (!id) {
      res_arr.statusCode = common.response_status_code.bad_request;
      res_arr.message = common.response_msg.incorrect_params;
      return res_arr;
    }
    const query = {
      Id: id,
      RoleId: constant.ROLE.ADMIN,
    };

    const data = await db.UserMaster.findOne({
      where: query,
      attributes: ["Id", "Name", "Email", "Phone", "Enable"],
      raw: true,
    });

    if (!isEmpty(data)) {
      return {
        statusCode: common.response_status_code.not_found,
        type: common.response_type.error,
        message: common.response_msg.user_not_found,
      };
    }

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.admin_details;
    res_arr.data = data;
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

exports.adminDelete = async (req) => {
  try {
    let { id } = req.params;
    id = parseInt(id);
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    if (!id) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.incorrect_params,
      };
    }

    await db.UserMaster.update({ Enable: false }, { where: { Id: id } });

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.admin_deleted;
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