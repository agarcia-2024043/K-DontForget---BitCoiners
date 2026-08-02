import mongoose from "mongoose";

const appointmentHistorySchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["CREATED", "UPDATED", "CONFIRMED", "CANCELLED", "COMPLETED"],
      required: true,
    },
    performedBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AppointmentHistory", appointmentHistorySchema);
