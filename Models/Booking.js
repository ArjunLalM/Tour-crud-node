import mongoose from 'mongoose';
import mongooseUniqueValidator from "mongoose-unique-validator";
const bookingSchema = new mongoose.Schema(
    {

  user: {
        ref: "Users",
        type: mongoose.Schema.Types.ObjectId,
        required : true
    },
    tour_operator: {
        ref: "Operator",
        type: mongoose.Schema.Types.ObjectId,
        required : true
    },
    tour_and_activity: {
        ref: "Tour",
        type: mongoose.Schema.Types.ObjectId,
        required : true
    },
    phone_number: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pickup_point: {
        type: String,
        required: true
    },
    special_requirements: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    no_of_persons: {
        type: Number,
        required: true
    },
    total_cost: {
        type: Number,
        required: true
    },
    payment_mode: {
        type: String,
        required: true
    },
    payment_status: {
        type: Boolean,
        default: false
    },
    status: {
          type: String,
  enum: ['pending', 'accepted', 'rejected'],
  default: 'pending'
    },
    isCancelled: {
        type: String,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
    },


  {
    timestamps: true,
  }
);

bookingSchema.plugin(mongooseUniqueValidator);

const Booking = mongoose.model("Booking",  bookingSchema);

export default Booking