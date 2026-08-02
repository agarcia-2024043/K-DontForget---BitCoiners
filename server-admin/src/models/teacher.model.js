import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    materia: {
      type: String,
      required: true,
      trim: true,
    },
    grados: {
      type: [String],
      default: [],
    },
    correo: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    telefono: {
      type: String,
      required: true,
      trim: true,
    },
    horario: {
      type: String,
      trim: true,
    },
    estado: {
      type: String,
      enum: ["Activo", "Inactivo"],
      default: "Activo",
    },
    fotoUrl: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacherSchema);
