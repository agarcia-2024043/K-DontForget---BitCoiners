import mongoose from "mongoose";
import logger from "./logger.js";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/k-dontforget";
    await mongoose.connect(uri);
    logger.info(`MongoDB conectado: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error(`Error conectando a MongoDB: ${error.message}`);
    process.exit(1);
  }
};
