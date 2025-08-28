const db = require("../../models/index");
const constant = require("../../common/constant/constant.json");
const common = require("../../common/statics/static.json");
const smartspendDB = require("../../config/dbconfig");
const { Sequelize, Op } = require("sequelize");
const moment = require("moment");
const generatePassword = require("../../common/helper/generateEncryptedPassword");
const { isEmpty } = require("../../common/utils/utils");

exports.getDashboardData = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    const { Id } = req.userProfile;

    const dashboardStats = await smartspendDB.query(
      `
        SELECT
            (SELECT LastLogin FROM usermaster WHERE Id = :Id) as lastLogin,
            (SELECT COUNT(*) FROM usermaster WHERE RoleId = :adminRole AND Enable = 1) as adminCount,
            (SELECT COUNT(*) FROM usermaster WHERE RoleId = :appUserRole AND Enable = 1) as appUserCount,
            (SELECT COUNT(*) FROM usermaster WHERE RoleId = :guestRole AND Enable = 1) as guestUserCount,
            (SELECT COUNT(*) FROM feedback WHERE IsRead = 1) as viewedFeedbackCount,
            (SELECT COUNT(*) FROM feedback) as totalFeedbackCount
        `,
      {
        replacements: {
          Id,
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
      lastLogin: dashboardStats.lastLogin,
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
        ["Id", "id"],
        ["Name", "name"],
        ["Email", "email"],
        ["Phone", "phone"],
        ["DeviceType", "device_type"],
        ["CreatedAt", "created_at"],
        ["Enable", "enable"],
      ],
      include: [
        {
          model: db.RoleMaster,
          as: "Role",
          attributes: [
            ["RoleId", "role_id"],
            ["Name", "role_name"],
          ],
        },
      ],
      ...options,
      raw: true,
      nest: true,
    });

    const totalPages = Math.ceil(data.count / limit);
    data.customer_details = data.rows.map((customer) => {
      if (customer.Role && customer.Role.role_id === constant.ROLE.APP_USER) {
        customer.Role.role_name = "Registered User";
      } else if (
        customer.Role &&
        customer.Role.role_id === constant.ROLE.APP_GUEST_USER
      ) {
        customer.Role.role_name = "Guest User";
      }
      return customer;
    });
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
        { AppExperience: { [Sequelize.Op.like]: `%${search}%` } },
        { Message: { [Sequelize.Op.like]: `%${search}%` } },
      ];
    }

    if (date) {
      query.CreatedAt = date;
    }

    const data = await db.Feedback.findAndCountAll({
      where: query,
      attributes: [
        ["Id", "id"],
        ["Name", "name"],
        ["Email", "email"],
        ["AppExperience", "app_experience"],
        ["Message", "message"],
        ["IsRead", "is_read"],
        ["CreatedAt", "created_at"],
      ],
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
        { "$user.Email$": { [Sequelize.Op.like]: `%${search}%` } },
        { BackupFileName: { [Sequelize.Op.like]: `%${search}%` } },
      ];
    }

    if (date) {
      query.CreatedAt = date;
    }

    const data = await db.Backup.findAndCountAll({
      where: query,
      attributes: [
        ["Id", "id"],
        ["BackupFileName", "backup_file_name"],
        ["CreatedAt", "created_at"],
        ["UpdatedAt", "updated_at"],
        ["Enable", "enable"],
      ],
      include: [
        {
          model: db.UserMaster,
          as: "user",
          attributes: [
            ["Name", "name"],
            ["Email", "email"],
          ],
        },
      ],
      order: [[sortby, order_type]],
      offset: (page - 1) * limit,
      limit: limit,
      raw: true,
      nest: true,
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
    if (req.method != "POST" && !req.body.id) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.id_required,
      };
    }

    const adminExists = await db.UserMaster.findOne({
      where: {
        [Op.or]: [{ Name: name }, { Email: email }, { Phone: phone }],
        RoleId: { [Op.eq]: constant.ROLE.ADMIN },
        ...(req.method !== "POST" && req.body.id
          ? { Id: { [Op.ne]: req.body.id } }
          : {}),
      },
      raw: true,
    });
    if (!isEmpty(adminExists)) {
      return {
        statusCode: common.response_status_code.bad_request,
        type: common.response_type.error,
        message: common.response_msg.admin_already_exists,
      };
    }

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
      await db.UserMaster.update(adminData, {
        where: {
          Id: req.body.id,
        },
      });

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
    let query = {
      RoleId: constant.ROLE.ADMIN,
      // Enable: 1,
    };

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
        ["Id", "id"],
        ["Name", "name"],
        ["Email", "email"],
        ["Phone", "phone"],
        ["CreatedAt", "created_at"],
        ["LastLogin", "last_login"],
        ["Enable", "enable"],
      ],
      ...options,
      raw: true,
      nest: true,
    });

    data.admins_details = data.rows;
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
      attributes: [
        ["Id", "id"],
        ["Name", "name"],
        ["Email", "email"],
        ["Phone", "phone"],
        ["Enable", "enable"],
      ],
      raw: true,
    });

    if (isEmpty(data)) {
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

    await db.UserMaster.destroy({ where: { Id: id } });

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

exports.getRoles = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    data = await db.RoleMaster.findAll({
      attributes: [
        ["RoleId", "id"],
        ["Name", "name"],
      ],
      raw: true,
    });

    data = data.map((role) => {
      if (role.id === constant.ROLE.APP_USER) {
        role.name = "Registered User";
      } else if (role.id === constant.ROLE.APP_GUEST_USER) {
        role.name = "Guest User";
      }
      return role;
    });

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.role_list;
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
