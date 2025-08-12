const { DataTypes } = require("sequelize");
const smartspendDB = require("../config/dbconfig");

const ApiLog = smartspendDB.define(
  "apilogs",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ApUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    RequestType: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Request: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    Response: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ResponseCode: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    OriginIP: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    RequestBy: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ResponseTime: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
    }
  },
  {
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
    tableName: "apilogs",
  }
);

// ApiLog.sync({ alter: true });
module.exports = ApiLog;
