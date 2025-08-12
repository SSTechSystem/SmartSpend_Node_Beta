const { DataTypes } = require("sequelize");
const smartspendDB = require("../config/dbconfig");

const Backup = smartspendDB.define(
  "backups",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    BackupFileName: {
      type: DataTypes.STRING(255),
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
    }
  },
  {
    tableName: "backups",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
  }
);

Backup.belongsTo(require('./usermasterModel'), {
  foreignKey: "UserId",
  as: "user",
});

// Backup.sync({ alter: true });
module.exports = Backup;
