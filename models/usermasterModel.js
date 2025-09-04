const { DataTypes } = require("sequelize");
const smartspendDB = require("../config/dbconfig");
const generatePassword = require("../common/helper/generateEncryptedPassword");

const UserMaster = smartspendDB.define(
  "usermaster",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING(100),
    },
    Email: {
      type: DataTypes.STRING(200),
    },
    Password: {
      type: DataTypes.STRING(200),
    },
    Phone: {
      type: DataTypes.STRING(15),
    },
    RoleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ForgotEmailToken: {
      type: DataTypes.STRING(50),
      defaultValue: null,
    },
    PurposeOfProfile: {
      type: DataTypes.STRING(255),
    },
    ProfilePhoto: {
      type: DataTypes.STRING(255),
    },
    GoogleProfilePhoto: {
      type: DataTypes.TEXT,
    },
    MoreInformation: {
      type: DataTypes.TEXT,
    },
    PrimaryBankAccountNumber: {
      type: DataTypes.STRING(255),
    },
    PrimaryBankName: {
      type: DataTypes.STRING(255),
    },
    CurrencyCountry: {
      type: DataTypes.STRING(50),
      defaultValue: "United States of America",
    },
    CurrencyCode: {
      type: DataTypes.STRING(50),
      defaultValue: "USD",
    },
    CurrencySymbol: {
      type: DataTypes.STRING(50),
      defaultValue: "$",
    },
    DateFormat: {
      type: DataTypes.STRING(50),
      defaultValue: "dd-MM-yyyy",
    },
    Theme: {
      type: DataTypes.STRING(50),
      defaultValue: "F1607C",
    },
    IsAuthorizedAppUser: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    IPAddress: {
      type: DataTypes.STRING(200),
    },
    LastLogin: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    Enable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    LogoutTime: {
      type: DataTypes.DATE,
    },
    DeviceType: {
      type: DataTypes.STRING(200),
      defaultValue: "WINDOWS",
    },
    UserAgent: {
      type: DataTypes.TEXT,
    },
    CarryForward: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    OpeningBalance: {
      type: DataTypes.DECIMAL(30, 2).UNSIGNED,
      defaultValue: 0.0,
    },
    expire_email_token: {
      type: DataTypes.DATE,
    },
    AuthToken: {
      type: DataTypes.TEXT,
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
    tableName: "usermaster",
    timestamps: true,
    createdAt: "CreatedAt",
    updatedAt: "UpdatedAt",
    hooks: {
      beforeUpdate: (instance) => {
        instance.LastLogin = new Date();
      }
    },
    indexes: [
      {
        fields: ["RoleId"],
      },
    ],
  }
);

UserMaster.belongsTo(require('./rolemasterModel'),{
  foreignKey: 'RoleId',
  as: 'Role'
});

// UserMaster.sync({ alter: true });
module.exports = UserMaster;
