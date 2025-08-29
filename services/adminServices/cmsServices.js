const { Sequelize, Op } = require("sequelize");
const constant = require("../../common/constant/constant.json");
const common = require("../../common/statics/static.json");
const db = require("../../models/index");
const { isEmpty } = require("../../common/utils/utils");

exports.getCmsData = async (req) => {
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
      offset: (page - 1) * limit,
      limit: limit,
      order: [[sortby, order_type]],
    };

    if (search) {
      query[Sequelize.Op.or] = [
        { Name: { [Sequelize.Op.like]: `%${search}%` } },
        { Slug: { [Sequelize.Op.like]: `%${search}%` } },
        { PageTitle: { [Sequelize.Op.like]: `%${search}%` } },
      ];
    }

    if (date) {
      query.CreatedAt = date;
    }

    const data = await db.Page.findAndCountAll({
      where: query,
      attributes: [
        ["Id", "id"],
        ["Name", "name"],
        ["Slug", "slug"],
        ["PageTitle", "page_title"],
        ["PageDescription", "page_description"],
        ["IsRelease", "is_release"],
        ["CreatedAt", "created_at"],
        ["Enable", "enable"],
      ],
      ...options,
    });

    data.cms_details = data.rows;
    data.limit = limit;
    data.total_pages = Math.ceil(data.count / limit);
    data.current_page = page;
    data.total_records = data.count;

    delete data.rows;
    delete data.count;

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.cms_lists;
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

exports.addCms = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const {
      name,
      title,
      description = "",
      meta_tags = "",
      meta_description = "",
      is_release = false,
      version_history = [],
      enable = true,
    } = req.body;
    const { Id } = req.userProfile;

    if (!name || typeof name !== "string" || name.trim() === "") {
      res_arr.message = common.response_msg.invalid_cms_name;
      return res_arr;
    }
    if (!title || typeof title !== "string" || title.trim() === "") {
      res_arr.message = common.response_msg.invalid_cms_pagetitle;
      return res_arr;
    }

    const createSlug = (name) =>
      name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const slug = createSlug(name);

    const criteria = { Slug: slug, Enable: true };
    const cmsData = await db.Page.findOne({ where: criteria });

    if (cmsData) {
      res_arr.statusCode = common.response_status_code.bad_request;
      res_arr.type = common.response_type.error;
      res_arr.message = common.response_msg.already_cms_exist;
      return res_arr;
    }

    const cmsObj = {
      Name: name,
      PageTitle: title,
      Slug: slug,
      PageDescription: description || null,
      MetaTags: meta_tags || null,
      MetaDescription: meta_description || null,
      IsRelease: is_release,
      CreatedBy: Id,
      Enable: enable,
    };

    const cms = await db.Page.create(cmsObj);
    if (version_history && version_history.length > 0) {
      const addVersionDetailsPromise = version_history.map((item) => {
        return db.VersionHistory.create({
          cms_id: cms.Id,
          Title: item.title,
          Description: item.description,
          Platform: item.platform,
          IsForce: item.is_force,
          created_by: Id,
        });
      });
      await Promise.all(addVersionDetailsPromise);
    }

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.cms_added_successfully;
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

exports.editCms = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };

    const {
      id,
      name,
      title,
      description = "",
      meta_tags = "",
      meta_description = "",
      is_release = false,
      version_history = [],
      enable = true,
    } = req.body;
    const { Id } = req.userProfile;

    if (!parseInt(id)) {
      res_arr.message = common.response_msg.cms_id_required;
      return res_arr;
    }
    if (!name || typeof name !== "string" || name.trim() === "") {
      res_arr.message = common.response_msg.invalid_cms_name;
      return res_arr;
    }
    if (!title || typeof title !== "string" || title.trim() === "") {
      res_arr.message = common.response_msg.invalid_cms_pagetitle;
      return res_arr;
    }

    const createSlug = (name) =>
      name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const slug = createSlug(name);

    const criteria = { Slug: slug, Enable: true, Id: { [Op.ne]: id } };
    const cmsData = await db.Page.findOne({ where: criteria });

    if (cmsData) {
      res_arr.statusCode = common.response_status_code.bad_request;
      res_arr.type = common.response_type.error;
      res_arr.message = common.response_msg.already_cms_exist;
      return res_arr;
    }

    const cmsObj = {
      Name: name,
      PageTitle: title,
      Slug: slug,
      PageDescription: description || null,
      MetaTags: meta_tags || null,
      MetaDescription: meta_description || null,
      IsRelease: is_release,
      UpdatedBy: Id,
      Enable: enable,
    };

    await db.Page.update(cmsObj, { where: { Id: id } });
    if (Array.isArray(version_history) && version_history.length > 0) {
      const versionOps = version_history
        .filter(
          (item) => item && (item.is_updated === 1 || item.is_created === 1)
        )
        .map((item) => {
          const baseData = {
            Title: item.title,
            Description: item.description,
            Platform: item.platform,
            IsForce: item.is_force,
            cms_id: id,
          };
          if (item.is_updated === 1 && item.id) {
            return db.VersionHistory.update(
              { ...baseData, UpdatedBy: Id },
              { where: { id: item.id } }
            );
          } else if (item.is_created === 1) {
            return db.VersionHistory.create({
              ...baseData,
              CreatedBy: Id,
            });
          }
          return null;
        })
        .filter(Boolean);
      await Promise.all(versionOps);
    }
    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.cms_updated_successfully;
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

exports.getCmsDetails = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    let { id } = req.params;
    id = parseInt(id);

    if (!id) {
      res_arr.statusCode = common.response_status_code.bad_request;
      res_arr.message = common.response_msg.incorrect_params;
      return res_arr;
    }

    const data = await db.Page.findOne({
      where: { Id: id },
      attributes: [
        ["Id", "id"],
        ["Name", "name"],
        ["Slug", "slug"],
        ["PageTitle", "page_title"],
        ["PageDescription", "page_description"],
        ["MetaTags", "meta_tags"],
        ["MetaDescription", "meta_description"],
        ["Platform", "platform"],
        ["IsRelease", "is_release"],
        ["CreatedAt", "created_at"],
        ["Enable", "enable"],
      ],
      raw: true,
    });
    if (isEmpty(data)) {
      res_arr.statusCode = common.response_status_code.not_found;
      res_arr.message = common.response_msg.not_found_cms;
      return res_arr;
    }

    const versionHistory = await db.VersionHistory.findAll({
      where: { cms_id: id },
      attributes: [
        "id",
        ["Title", "title"],
        ["Description", "description"],
        ["Platform", "platform"],
        ["IsForce", "is_force"],
      ],
      raw: true,
    });
    data.version_history = versionHistory;

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.cms_details;
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

exports.viewCms = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    let { id } = req.params;
    id = parseInt(id);

    if (!id) {
      res_arr.statusCode = common.response_status_code.bad_request;
      res_arr.message = common.response_msg.incorrect_params;
      return res_arr;
    }

    const data = await db.Page.findOne({
      where: { Id: id },
      attributes: [
        ["PageDescription", "page_description"],
        ["IsRelease", "is_release"],
      ],
      raw: true,
    });
    if (isEmpty(data)) {
      res_arr.statusCode = common.response_status_code.not_found;
      res_arr.message = common.response_msg.not_found_cms;
      return res_arr;
    }

    if (data.is_release) {
      const versionHisory = await db.VersionHistory.findAll({
        where: { cms_id: id },
        attributes: [
          "id",
          ["Title", "title"],
          ["Description", "description"],
          ["Platform", "platform"],
          ["IsForce", "is_force"],
        ],
        raw: true,
      });
      data.version_history = versionHisory;
      delete data.PageDescription;
    }
    delete data.IsRelease;

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.cms_description_get;
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

exports.deleteCms = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    let { id } = req.params;
    id = parseInt(id);

    if (!id) {
      res_arr.statusCode = common.response_status_code.bad_request;
      res_arr.message = common.response_msg.incorrect_params;
      return res_arr;
    }

    await db.VersionHistory.destroy({ where: { cms_id: id } });
    await db.Page.destroy({ where: { Id: id } });

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.cms_deleted_successfully;
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

exports.deleteVersionHistory = async (req) => {
  try {
    const res_arr = {
      statusCode: common.response_status_code.bad_request,
      type: common.response_type.error,
      data: {},
    };
    let { cms_id, version_history_id } = req.body;
    cms_id = parseInt(cms_id);
    version_history_id = parseInt(version_history_id);

    if (!cms_id || !version_history_id) {
      res_arr.statusCode = common.response_status_code.bad_request;
      res_arr.message = common.response_msg.invalid_request_body;
      return res_arr;
    }

    await db.VersionHistory.destroy({
      where: { id: version_history_id, cms_id },
    });

    res_arr.statusCode = common.response_status_code.success;
    res_arr.type = common.response_type.success;
    res_arr.message = common.response_msg.version_history_record_deleted;
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
