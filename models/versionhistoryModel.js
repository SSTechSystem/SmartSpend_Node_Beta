const { DataTypes } = require("sequelize");
const smartspendDB = require("../config/dbconfig");

const VersionHistory = smartspendDB.define(
  "version_history",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cms_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    Platform: {
      type: DataTypes.TINYINT,
    },
    created_by: {
      type: DataTypes.INTEGER,
    },
    IsForce: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "version_history",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["cms_id"],
      },
      {
        fields: ["Platform"],
      },
    ],
  }
);

VersionHistory.belongsTo(require('./pagesModel'),{
  foreignKey: 'cms_id',
  as: 'cms'
});

// VersionHistory.sync({ alter: true });
module.exports = VersionHistory;
