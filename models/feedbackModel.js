const { DataTypes } = require("sequelize");
const smartspendDB = require("../config/dbconfig");

const Feedback = smartspendDB.define(
  "feedback",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    AppExperience: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    Message: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    UserId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    IsRead: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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
    tableName: "feedback",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

// Feedback.sync({ alter: true });
module.exports = Feedback;
