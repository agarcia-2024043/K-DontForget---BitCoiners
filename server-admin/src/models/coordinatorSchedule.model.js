import mongoose from "mongoose";

const coordinatorScheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6, // 0 = Domingo, 6 = Sábado
    },
    startTime: {
      type: String,
      required: true, // Formato "HH:mm" (ej: "08:00")
    },
    endTime: {
      type: String,
      required: true, // Formato "HH:mm" (ej: "17:00")
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Índice compuesto para buscar horarios por coordinador y día
coordinatorScheduleSchema.index({ userId: 1, dayOfWeek: 1 });

export default mongoose.model("CoordinatorSchedule", coordinatorScheduleSchema);
