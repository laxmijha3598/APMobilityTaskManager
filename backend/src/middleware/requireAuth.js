import mongoose from "mongoose";

import { User } from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }


    const userId = payload?.sub;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    const user = await User.findById(userId).select("_id name email").lean();
    if (!user) {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }

    req.user = user;
    next();
  } catch (_e) {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }
}

