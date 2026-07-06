import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Log all headers for debugging
  console.log("📋 All headers:", JSON.stringify(req.headers, null, 2));
  
  // Get token from Authorization header
  const header = req.headers.authorization;
  
  console.log("🔐 Auth header present:", !!header);
  
  if (!header) {
    console.log("❌ No Authorization header");
    res.status(401).json({ 
      success: false,
      error: "Unauthorized - No authorization header" 
    });
    return;
  }
  
  if (!header.startsWith("Bearer ")) {
    console.log("❌ Invalid Authorization header format - expected 'Bearer <token>'");
    console.log("📝 Header value:", header.substring(0, 30) + "...");
    res.status(401).json({ 
      success: false,
      error: "Unauthorized - Invalid token format" 
    });
    return;
  }
  
  try {
    const token = header.substring(7);
    console.log("🔑 Token extracted, length:", token.length);
    console.log("🔑 Token preview:", token.substring(0, 20) + "...");
    
    const payload = verifyToken(token);
    console.log("✅ Token verified for user:", payload.userId);
    
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    res.status(401).json({ 
      success: false,
      error: "Invalid or expired token",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}