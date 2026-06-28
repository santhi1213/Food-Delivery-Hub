import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signToken } from "../lib/jwt";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, passwordHash });
    const token = signToken({ userId: user._id.toString(), email: user.email });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken({ userId: user._id.toString(), email: user.email });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json({ user });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.put("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { name, phone } },
      { new: true }
    ).select("-passwordHash");
    res.json({ user });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Update failed" });
  }
});

router.post("/addresses", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { type, address, lat, lng } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { addresses: { type, address, lat, lng } } },
      { new: true }
    ).select("-passwordHash");
    res.json({ addresses: user?.addresses });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Failed to add address" });
  }
});

export default router;
