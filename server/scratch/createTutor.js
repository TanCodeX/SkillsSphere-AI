import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../src/database/models/User.js";
import logger from "../src/utils/logger.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/skillsphere";

async function run() {
  logger.info(`Connecting to MongoDB at: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);

  const email = "tutor@test.com";
  const plainPassword = "assowrd123"; // exactly as requested
  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  // Upsert the user
  const user = await User.findOneAndUpdate(
    { email },
    {
      name: "Expert Tutor",
      password: hashedPassword,
      role: "tutor",
      isVerified: true,
      provider: "local",
    },
    { new: true, upsert: true }
  );

  logger.info("Successfully created/updated Tutor user:");
  logger.info(`ID: ${user._id}`);
  logger.info(`Email: ${user.email}`);
  logger.info(`Role: ${user.role}`);
  logger.info(`isVerified: ${user.isVerified}`);

  await mongoose.disconnect();
  logger.info("Disconnected from MongoDB.");
}

run().catch((err) => {
  logger.error(`Error creating tutor user: ${err.message}`);
  process.exit(1);
});
