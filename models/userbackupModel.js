const { DataTypes } = require("sequelize");
const smartspendDB = require("../config/dbconfig");

const UserBackup = smartspendDB.define(
  "userbackup",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    BackupType: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
    tableName: "userbackup",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

// UserBackup.sync({ alter: true });
module.exports = UserBackup;
