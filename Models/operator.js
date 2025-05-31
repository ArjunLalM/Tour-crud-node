import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";
import validator from "validator";
const operatorSchema = new mongoose.Schema(
  {
    tourAgencyName: {
      type: String,
      required: true,
      trim: true,
    },
    agencyLocation: {
      type: String,
      required: true,
      trim: true,
    },
 
    companyPhoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    companyEmailId: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email address"],
    },
    password: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

operatorSchema.plugin(mongooseUniqueValidator);

const Operator = mongoose.model("Operator", operatorSchema);

export default Operator;
