// import jwt from "jsonwebtoken";

// const SECRET = process.env["JWT_SECRET"] ?? "foodrush-dev-secret-change-in-prod";

// export function signToken(payload: { userId: string; email: string }) {
//   return jwt.sign(payload, SECRET, { expiresIn: "30d" });
// }

// export function verifyToken(token: string): { userId: string; email: string } {
//   return jwt.verify(token, SECRET) as { userId: string; email: string };
// }

// src/lib/jwt.ts
import jwt from "jsonwebtoken";

// Use the same secret as in your frontend
// Make sure this matches what's used in the frontend
const SECRET = process.env["JWT_SECRET"] ?? "foodrush-dev-secret-change-in-prod";

console.log("🔐 JWT Secret:", SECRET ? "Set (not showing for security)" : "Using default secret");

export function signToken(payload: { userId: string; email: string }) {
  console.log("🔐 Signing token for user:", payload.userId);
  const token = jwt.sign(payload, SECRET, { expiresIn: "30d" });
  console.log("✅ Token signed successfully");
  return token;
}

export function verifyToken(token: string): { userId: string; email: string } {
  console.log("🔐 Verifying token...");
  console.log("🔑 Token length:", token.length);
  
  try {
    const decoded = jwt.verify(token, SECRET) as { userId: string; email: string };
    console.log("✅ Token verified for user:", decoded.userId);
    return decoded;
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    console.error("❌ Error details:", error instanceof Error ? error.message : "Unknown error");
    throw error;
  }
}