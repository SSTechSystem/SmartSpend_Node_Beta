const { check, query, body, validationResult } = require("express-validator");
const { verifyEmail } = require("../helper/auth");

const signUpValidation = [
  check("firstname")
    .not()
    .isEmpty()
    .withMessage("Firstname is required")
    .trim()
    .escape()
    .isAlpha()
    .withMessage("Firstname must contain only alphabetic characters")
    .isLength({ max: 35 })
    .withMessage("Firstname must not be more than 35 character"),
  check("lastname")
    .not()
    .isEmpty()
    .withMessage("Lastname is required")
    .trim()
    .escape()
    .isAlpha()
    .withMessage("Lastname must contain only alphabetic characters")
    .isLength({ max: 35 })
    .withMessage("Lastname must not be more than 35 character"),
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .trim()
    .escape()
    .isEmail()
    .withMessage("Invalid Email format")
    .custom((value) => {
      if (/[A-Z]/.test(value)) {
        throw new Error("Email must not contain uppercase letters");
      }
      return true;
    })
    .toLowerCase(),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .trim()
    .escape()
    .isLength({ min: 8, max: 12 })
    .withMessage("Password must be between 8 to 12 characters")
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one number, and one special character"
    ),
  check("fcm_token")
    .not()
    .trim()
    .escape()
    .isEmpty()
    .withMessage("FCM token is required"),
];

const signInValidation = [
  // check("email")
  //   .not()
  //   .isEmpty()
  //   .withMessage("Email is required")
  //   .trim()
  //   .escape()
  //   .isEmail()
  //   .withMessage("Invalid Email format")
  //   .custom((value) => {
  //     if (/[A-Z]/.test(value)) {
  //       throw new Error("Email must not contain uppercase letters");
  //     }
  //     return true;
  //   })
  //   .toLowerCase(),
  
  check("social_type")
    .not()
    .trim()
    .escape()
    .isEmpty()
    .withMessage("Social type is required"),
  check("fcm_token")
    .not()
    .trim()
    .escape()
    .isEmpty()
    .withMessage("FCM token is required"),
];

const validateEmail = [
  query("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .custom((value) => {
      if (/[A-Z]/.test(value)) {
        throw new Error("Email must not contain uppercase letters");
      }
      return true;
    })
    .toLowerCase(),
  check("email").custom(async (val) => {
    const response = await verifyEmail(val.toLowerCase());
    if (!response.success) {
      throw new Error(response.message || "Something went wrong.");
    }
  }),
];

const changePasswordvalidation = [
  check("oldPassword")
    .not()
    .isEmpty()
    .withMessage("Previous password is required")
    .trim()
    .escape()
    .isLength({ min: 6, max: 12 })
    .withMessage("Incorrect previous password"),
  check("newPassword")
    .not()
    .isEmpty()
    .withMessage("New password is required")
    .trim()
    .escape()
    .isLength({ min: 6, max: 12 })
    .withMessage("New password must be between 6 to 12 characters"),
  check("confirmPassword")
    .not()
    .isEmpty()
    .withMessage("Confirm password is required")
    .trim()
    .escape()
    .isLength({ min: 6, max: 12 })
    .withMessage("Confirm password must be between 6 to 12 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value != req.body.newPassword) {
      throw new Error("Confirm password does not match the new password");
    }
    return true;
  }),
];

const signInValidationForAdmin = [
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .trim()
    .escape()
    .isEmail()
    .withMessage("Invalid Email format"),
  check("password")
    .not()
    .trim()
    .isEmpty()
    .withMessage("Password is required")
];

const updateProfileValidation = [
  check("firstname")
    .not()
    .isEmpty()
    .withMessage("Firstname is required")
    .trim()
    .escape()
    .isLength({ max: 35 })
    .withMessage("Firstname must not be more than 35 character"),
  check("lastname")
    .not()
    .isEmpty()
    .withMessage("Lastname is required")
    .trim()
    .escape()
    .isLength({ max: 35 })
    .withMessage("Lastname must not be more than 35 character"),
  // check("birthdate")
  //   .optional()
  //   .trim()
  //   .escape()
  //   .custom((value) => {
  //     const birthdate = new Date(value);
  //     const currentDate = new Date();
  //     if(isNaN(birthdate.getTime())) {
  //       throw new Error("Invalid Birthdate");
  //     }
  //     if (birthdate > currentDate) {
  //       throw new Error("Invalid Birthdate");
  //     }
  //     return true;
  //   })
    // check("gender")
    // .optional()
    // .trim()
    // .escape()
    // .isIn(["M", "F", "O"])
    // .withMessage("Gender must be either 'M', 'F', or 'O'")
];

const adminUpdatePasswordVal = [
  check("oldPassword")
    .not()
    .isEmpty()
    .withMessage("Previous password is required")
    .trim()
    .escape()
    .isLength({ min: 6, max: 12 })
    .withMessage("Incorrect previous password"),
  check("newPassword")
    .not()
    .isEmpty()
    .withMessage("New password is required")
    .trim()
    .escape()
    .isLength({ min: 6, max: 12 })
    .withMessage("New password must be between 6 to 12 characters"),
  check("confirmPassword")
    .not()
    .isEmpty()
    .withMessage("Confirm password is required")
    .trim()
    .escape()
    .isLength({ min: 6, max: 12 })
    .withMessage("Confirm password must be between 6 to 12 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value != req.body.newPassword) {
      throw new Error("Confirm password does not match the new password");
    }
    return true;
  }),
];

const adminUpdateProfileVal = [
  check("name")
    .not()
    .isEmpty()
    .withMessage("Name is required")
    .trim()
    .escape()
    .isLength({ max: 35 })
    .withMessage("Name must not be more than 35 character"),
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .trim()
    .escape()
    .isEmail()
    .withMessage("Invalid Email format")
    .custom((value) => {
      if (/[A-Z]/.test(value)) {
        throw new Error("Email must not contain uppercase letters");
      }
      return true;
    }),
  check("phone")
    .not()
    .isEmpty()
    .withMessage("Phone number is required")
    .trim()
    .escape()
    .isMobilePhone("any")
    .withMessage("Invalid phone number format"),
];

const validateAdminDetails = async (req, res, next) => {
  const isUpdate = req.method === "PUT" || req.method === "PATCH";
  const validators = [
    check("name")
      .not()
      .isEmpty()
      .withMessage("Name is required")
      .trim()
      .escape()
      .isLength({ max: 35 })
      .withMessage("Name must not be more than 35 characters"),
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .trim()
      .escape()
      .isEmail()
      .withMessage("Invalid Email format")
      .custom((value) => {
        if (/[A-Z]/.test(value)) {
          throw new Error("Email must not contain uppercase letters");
        }
        return true;
      }),
    check("phone")
      .not()
      .isEmpty()
      .withMessage("Phone number is required")
      .trim()
      .escape()
      .isMobilePhone("any")
      .withMessage("Invalid phone number format"),
    isUpdate
      ? check("password")
          .if((_, { req }) => req.body.password)
          .trim()
          .escape()
          .isLength({ min: 6, max: 12 })
          .withMessage("Password must be between 6 to 12 characters")
      : check("password")
          .not()
          .isEmpty()
          .withMessage("Password is required")
          .trim()
          .escape()
          .isLength({ min: 6, max: 12 })
          .withMessage("Password must be between 6 to 12 characters")
  ];

  // Run all validators
  await Promise.all(validators.map((v) => v.run(req)));

  // Get results and send only the first error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array({ onlyFirstError: true })[0];
    return res
      .status(400)
      .send({ statusCode: 400, success: false, type: "Error", message: firstError.msg, data: {} });
  }

  next();
};

module.exports = {
  signUpValidation,
  signInValidation,
  validateEmail,
  changePasswordvalidation,
  signInValidationForAdmin,
  updateProfileValidation,
  adminUpdatePasswordVal,
  adminUpdateProfileVal,
  validateAdminDetails,
};
