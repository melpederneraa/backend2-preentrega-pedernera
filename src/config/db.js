import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ecommerce";
  await mongoose.connect(mongoUrl);
  console.log(`Mongo conectado: ${mongoUrl}`);
};
