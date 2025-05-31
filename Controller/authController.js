import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Operator from "../Models/operator.js";
import HttpError from "../middlewares/httpError.js";
import User from "../Models/user.js";
//Create Signup
export const operatorSignUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("error", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed, Please check your data before retry!",
          422
        )
      );
    }
    const {
      tourAgencyName,
      agencyLocation,
      companyPhoneNumber,
      companyEmailId,
      password,
      passwordConfirm,
    } = req.body;

    // Check if operator already exists with the same email
    const existingEmailOperator = await Operator.findOne({ companyEmailId });
    if (existingEmailOperator) {
      return res.status(401).json({
        status: "error",
        message: "Email already exists",
      });
    }

    // Check if operator already exists with the same phone number
    const existingPhoneOperator = await Operator.findOne({ companyPhoneNumber });
    if (existingPhoneOperator ) {
      return res.status(401).json({
        status: "error",
        message: "Phone number already exists",
      });
    }

    //password Confirm matches password
    if (password !== passwordConfirm) {
      return next(new HttpError("Passwords do not match!", 400));
    }

    // Hash password before saving
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newOperator = await Operator.create({
      tourAgencyName,
      agencyLocation,
      companyPhoneNumber,
      companyEmailId,
      password: hashedPassword,

    });

    // Generate JWT Token
    const token = jwt.sign(
      { operatorId: newOperator._id,role:"operator" },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(201).json({
      status: true,
      message: "operator registered successfully...!",
      data: newOperator,
      access_token: token,
      access_token: token,
      role:"operator"
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Process failed, please contact admin", 500)
    );
  }
};




//Create Signup
export const userSignUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("error", errors);
      return next(
        new HttpError(
          "Invalid data inputs passed, Please check your data before retry!",
          422
        )
      );
    }
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      password,
      passwordConfirm,
      userRole,
    } = req.body;
    // Check if user already exists with the same email
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(401).json({
        status: "error",
        message: "Email already exists",
      });
    }

    // Check if user already exists with the same phone number
    const existingPhoneUser = await User.findOne({ phoneNumber });
    if (existingPhoneUser) {
      return res.status(401).json({
        status: "error",
        message: "Phone number already exists",
      });
    }

    //password Confirm matches password
    if (password !== passwordConfirm) {
      return next(new HttpError("Passwords do not match!", 400));
    }

    // Hash password before saving
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    // Generate JWT Token
    const token = jwt.sign(
      { userId: newUser._id,role:"user" },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(201).json({
      status: true,
      message: "User registered successfully...!",
      data: newUser,
      access_token: token,
      access_token: token,
      userId:newUser._id,
      role:"user"
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Process failed, please contact admin", 500)
    );
  }
};
//create login For Both user and Operator
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        new HttpError(
          "Invalid data inputs passed, Please check your data before retry!",
          422
        )
      );
    }

    const { email, password } = req.body;

const logUser = await User.findOne({ email });

if (logUser) {
  const isPasswordValid = await bcrypt.compare(password, logUser.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      status: "error",
      message: "Incorrect password",
    });
  }

  const token = jwt.sign(
    { userId: logUser._id, role: 'user' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  return res.status(200).json({
    status: true,
    message: "User logged in successfully...!",
    data: logUser,
    access_token: token,
    userId: logUser._id,
    role:'user'
  });
} else {
  const logOperator = await Operator.findOne({ companyEmailId: email });

  if (logOperator) {
    const isPasswordValid = await bcrypt.compare(password, logOperator.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {  userId:logOperator._id, role: "operator" },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    return res.status(200).json({
      status: true,
      message: "Operator logged in successfully...!",
      data: logOperator,
      access_token: token,
      userId: logOperator._id,
      role: "operator",
    });
  } else {
    return res.status(404).json({
      status: "error",
      message: "User or Operator not found with this email",
    });
  }
}

  
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Oops! Login failed, please contact admin", 500)
    );
  }
};
