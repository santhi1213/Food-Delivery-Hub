import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "./logger";
import { verifyToken } from "./jwt";

let io: SocketIOServer;

export function initSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: { 
      origin: "*", 
      methods: ["GET", "POST"],
      credentials: true 
    },
    path: "/api/socket.io",
    transports: ["websocket", "polling"],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth["token"] as string | undefined;
    const restaurantId = socket.handshake.auth["restaurantId"] as string | undefined;
    
    console.log("🔐 Socket auth - Token:", !!token, "RestaurantId:", restaurantId);
    
    if (!token && !restaurantId) {
      next(new Error("Unauthorized - No token or restaurantId provided"));
      return;
    }
    
    try {
      // If token is provided, verify it
      if (token) {
        try {
          const payload = verifyToken(token);
          socket.data["userId"] = payload.userId;
          socket.data["email"] = payload.email;
          
          // If restaurantId is provided in auth, store it
          if (restaurantId) {
            socket.data["restaurantId"] = restaurantId;
          }
          
          console.log(`✅ Socket authenticated via token: ${payload.userId}`);
          next();
          return;
        } catch (verifyError) {
          console.warn("⚠️ Token verification failed:", verifyError);
          // Fall through to check restaurantId
        }
      }
      
      // If restaurantId is provided directly
      if (restaurantId) {
        socket.data["restaurantId"] = restaurantId;
        console.log(`✅ Socket authenticated via restaurantId: ${restaurantId}`);
        next();
        return;
      }
      
      next(new Error("Authentication failed"));
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data["userId"];
    const restaurantId = socket.data["restaurantId"];
    
    console.log(`🔌 Socket connected: ${socket.id}`);
    console.log(`📡 User ID: ${userId || 'none'}, Restaurant ID: ${restaurantId || 'none'}`);

    // Join user room for customer notifications
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`📡 User ${userId} joined room: user:${userId}`);
    }

    // Join restaurant room for restaurant notifications
    if (restaurantId) {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`📡 Restaurant ${restaurantId} joined room: restaurant:${restaurantId}`);
    }

    // Handle manual join for restaurant
    socket.on("join_restaurant", (data) => {
      const { restaurantId } = data;
      if (restaurantId) {
        const roomName = `restaurant:${restaurantId}`;
        socket.join(roomName);
        socket.data["restaurantId"] = restaurantId;
        console.log(`📡 Manual join: Restaurant ${restaurantId} joined room: ${roomName}`);
        socket.emit("joined_restaurant_room", { 
          restaurantId, 
          room: roomName,
          message: "Successfully joined restaurant notification room" 
        });
      }
    });

    // Handle order status updates
    socket.on("order:status", (data) => {
      const { orderId, status } = data;
      console.log(`📋 Order ${orderId} status update: ${status}`);
      socket.to(`order:${orderId}`).emit("order:status", { status });
    });

    socket.on("order:location", (data) => {
      const { orderId, lat, lng } = data;
      socket.to(`order:${orderId}`).emit("order:location", { lat, lng });
    });

    socket.on("join:order", (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`📡 Socket joined order room: order:${orderId}`);
    });

    socket.on("leave:order", (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.IO not initialised");
  return io;
}

