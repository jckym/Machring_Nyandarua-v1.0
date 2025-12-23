import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("❌ Admin already exists");
      process.exit(0);
    }

    const admin = new User({
      name: "System Admin",
      email: "jckym001@gmail.com",
      phone: "0711417507",
      password: "Admin.mr01",
      role: "admin",
      status: "active",
    });

    await admin.save();

    console.log("✅ Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
    process.exit(1);
  }
}

createAdmin();


