#!/usr/bin/env node
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import dotenv, { config } from "dotenv";
dotenv.config(config.path || ".env.local");

// ─── Load .env.local manually ─────────────────────────────────────────────────
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf-8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex === -1) continue;
        const key = trimmed.substring(0, eqIndex).trim();
        const val = trimmed
          .substring(eqIndex + 1)
          .trim()
          .replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
      console.log(`✅ Loaded env from ${file}`);
      break;
    }
  }
}

loadEnv();
/**
 * Seed script: Creates the root admin user
 * Run with: node scripts/seed.js
 * Or: npm run seed
 */

console.log(process.env.MONGODB_URI);
const MONGODB_URI = process.env.MONGODB_URI;
const ROOT_EMAIL = process.env.ROOT_EMAIL || "root@cartrade.com";
const ROOT_PASSWORD = process.env.ROOT_PASSWORD || "Admin@123456";
const ROOT_NAME = process.env.ROOT_NAME || "Root Admin";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: String,
    permissions: [String],
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    refreshTokens: [String],
  },
  { timestamps: true },
);

async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected");

    const User = mongoose.models.User || mongoose.model("User", userSchema);

    // Check if root already exists
    const existing = await User.findOne({ email: ROOT_EMAIL });
    if (existing) {
      console.log(`⚠️  Root user already exists: ${ROOT_EMAIL}`);
      console.log("   Delete it first or use a different email.");
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ROOT_PASSWORD, 12);

    // Create root user
    const root = await User.create({
      name: ROOT_NAME,
      email: ROOT_EMAIL,
      password: hashedPassword,
      role: "root",
      permissions: [
        "cars:create",
        "cars:edit",
        "cars:delete",
        "cars:view",
        "inquiries:view",
        "inquiries:reply",
        "employees:manage",
      ],
      isActive: true,
      mustChangePassword: false,
    });

    console.log("\n🎉 Root admin created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email    : ${ROOT_EMAIL}`);
    console.log(`🔑 Password : ${ROOT_PASSWORD}`);
    console.log(`🆔 ID       : ${root._id}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(
      "\n⚠️  IMPORTANT: Change the root password immediately after first login!",
    );
    console.log("🌐 Admin Portal: http://localhost:3000/admin/login\n");

    await mongoose.disconnect();
    console.log("✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
