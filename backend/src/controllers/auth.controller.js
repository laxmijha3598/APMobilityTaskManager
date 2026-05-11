import bcrypt from "bcryptjs";
import validator from "validator";
import { User } from "../models/User.js";
import { signAccessToken } from "../utils/auth.js";

function publicUser(u) {
  return { _id: u._id, name: u.name, email: u.email };
}

export async function register(req, res) {
  const { name, email, password } = req.body ?? {};

  if (!email || typeof email !== "string" || !validator.isEmail(email)) {
    return res.status(400).json({ error: { message: "Valid email is required" } });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      error: { message: "Password must be at least 6 characters" },
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    return res.status(409).json({ error: { message: "Email already registered" } });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: typeof name === "string" ? name.trim() : "",
    email: normalizedEmail,
    passwordHash,
  });

  const token = signAccessToken({ userId: user._id });
  res.status(201).json({ data: { token, user: publicUser(user) } });
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};

  if (!email || typeof email !== "string" || !validator.isEmail(email)) {
    return res.status(400).json({ error: { message: "Valid email is required" } });
  }
  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: { message: "Password is required" } });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ error: { message: "Invalid credentials" } });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: { message: "Invalid credentials" } });
  }

  const token = signAccessToken({ userId: user._id });
  res.json({ data: { token, user: publicUser(user) } });
}

export async function me(req, res) {
  res.json({ data: { user: req.user } });
}

