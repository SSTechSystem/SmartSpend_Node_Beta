const { DataTypes } = require("sequelize");
const smartspendDB = require("../config/dbconfig");

const DriveMaster = smartspendDB.define(
  "drivemaster",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    deviceId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileName: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: "drivemaster",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["deviceId"],
      },
    ]
  }
);

// DriveMaster.sync({ alter: true });
module.exports = DriveMaster;
