import mongoose from "mongoose";
import "dotenv/config.js";
export default async function dbConnect() {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `Database connected successfully to : ${connection.host} `.green.underline
    );
  } catch (error) {
    console.log(error);
    console.log("Database connection failed");
    process.exit(1);
  }
}
