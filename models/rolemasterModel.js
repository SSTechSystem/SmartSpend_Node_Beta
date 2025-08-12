const { DataTypes } = require("sequelize");
const smartspendDB = require("../config/dbconfig");

const RoleMaster = smartspendDB.define(
  "rolemaster",
  {
    RoleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
    tableName: "rolemaster",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

// RoleMaster.sync({ alter: true });
module.exports = RoleMaster;
