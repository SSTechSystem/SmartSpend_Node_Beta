const { DataTypes } = require("sequelize");
const smartspendDB = require("../config/dbconfig");

const Page = smartspendDB.define(
  "pages",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    PageTitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    PageDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    MetaTags: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    MetaDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Platform: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    IsRelease: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    CreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    UpdatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Enable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "pages",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

// Page.sync({ alter: true });
module.exports = Page;
