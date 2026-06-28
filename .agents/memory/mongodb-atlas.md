---
name: MongoDB Atlas dev setup
description: How to configure the server and Atlas so MongoDB connection failures don't kill the process
---

## Rule
The Express server must NOT call `process.exit(1)` when `connectDB()` fails. Catch the error, log it, and let the server start anyway. This keeps `/api/healthz` alive and gives a better error message than a dead workflow.

**Why:** Replit container IPs change on restart and may not be whitelisted in Atlas Network Access. Without this, every restart after an IP change kills the workflow.

**How to apply:**
- In `connectDB()`, wrap `mongoose.connect()` in try/catch
- On catch: log the error with guidance ("check Atlas IP whitelist → Network Access → Allow 0.0.0.0/0")
- Do NOT re-throw or call `process.exit`

**Atlas fix for dev:** In MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0). This is fine for development; tighten for production.
