import mongoose from "mongoose";

const appointmentHistorySchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
  },
  action: {
    type: String,
    enum: ["CREATED", "UPDATED", "CANCELLED", "CONFIRMED", "COMPLETED"],
    required: true,
  },
  performedBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AppointmentHistory = mongoose.model(
  "AppointmentHistory",
  appointmentHistorySchema
);

export default AppointmentHistory;