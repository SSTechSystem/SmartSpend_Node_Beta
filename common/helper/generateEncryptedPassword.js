const bcrypt = require("bcrypt");

const generatePassword = async (plainPassword) => {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainPassword, salt);
  } catch (error) {
    console.log("error in generating passsword :", error);
  }
};

module.exports = generatePassword;
