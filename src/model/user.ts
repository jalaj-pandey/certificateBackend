import mongoose from "mongoose";
import validator, { trim } from "validator";
import bcrypt from "bcrypt";

const batches = ["Web Development", "Gen AI"];
const userDetails = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: [true, "Email already exists"],
      required: [true, "Please enter email"],
      validate: validator.default.isEmail,
    },
    status: {
      type: String,
      enum: ["Normal", "Applied", "Accepted", "Rejected"],
      default: "Normal",
    },
    certificates: [
      {
        certificateId: String,
        pdfPath: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user", "intern"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Enter your gender"],
    },
    batch: {
      type: String,
      required: [true, "Please select your batch"],
      enum: batches,
      trim: true,
    },
    isWebDevelopment: { type: Boolean, default: false },
    phoneNo: {
      type: String,
      unique: [true, "This phone number is already registered"],
      required: [true, "Please enter your mobile number"],
      validate: {
        validator: function (v: string) {
          return validator.isMobilePhone(v, "en-IN");
        },
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
    },
  },
  {
    timestamps: true,
  }
);

userDetails.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

export const User = mongoose.model("User", userDetails);
