import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";
const messageSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

messageSchema.plugin(mongooseUniqueValidator);

const Message = mongoose.model("Message", messageSchema);

export default Message;
