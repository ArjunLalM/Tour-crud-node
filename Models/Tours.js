import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const tourSchema = new mongoose.Schema(
  {
    tour_operator:{
      ref:"Operator",
      type:mongoose.Schema.Types.ObjectId,
      required:true
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price:{
    type:Number,
    require:true
    },
      isDeleted:{
        type:Boolean,
        default: false
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    activityTypes: {
      type:String,
      required: true,
    },
    duration: {
      type: Number, 
      required: true,
    },
    availability: {
     type:Number,
     required:true
    },
    destination: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], 
       required:true,
      }
    },
    images: {
      type: [String],
      required: true,
    },
    itinerary: [
      {
        step: { type: Number},
        description: { type: String, required: true },
      },
     ],
  },
  { timestamps: true }
);

tourSchema.plugin(mongooseUniqueValidator);

const Tour = mongoose.model("Tour", tourSchema);

export default Tour;
