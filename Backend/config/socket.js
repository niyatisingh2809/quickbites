import { Server } from "socket.io";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:5173",
        process.env.ADMIN_URL || "http://localhost:5174",
        "http://localhost:5173",
        "http://localhost:5174"
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

    // Customer joins room for their specific order
    socket.on("join_order", (orderId) => {
      if (orderId) {
        const room = `order_${orderId}`;
        socket.join(room);
        console.log(`📦 Socket ${socket.id} joined ${room}`);
      }
    });

    // Customer leaves order room
    socket.on("leave_order", (orderId) => {
      if (orderId) {
        const room = `order_${orderId}`;
        socket.leave(room);
        console.log(`🚪 Socket ${socket.id} left ${room}`);
      }
    });

    // Admin dashboard joins admin broadcast channel
    socket.on("join_admin", () => {
      socket.join("admin_room");
      console.log(`👑 Admin socket ${socket.id} joined admin_room`);
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized!");
  }
  return io;
};

// Dispatch real-time status update to customer and admin
export const notifyOrderStatusUpdate = (orderId, newStatus) => {
  if (!io) return;
  const payload = {
    orderId,
    status: newStatus,
    timestamp: new Date().toISOString()
  };

  // Broadcast to customer tracking this specific order
  io.to(`order_${orderId}`).emit("order_status_updated", payload);

  // Broadcast to admin dashboard
  io.to("admin_room").emit("admin_order_updated", payload);
  console.log(`📡 Broadcasted status update for order ${orderId}: ${newStatus}`);
};

// Dispatch new order notification to admin panel
export const notifyNewOrder = (order) => {
  if (!io) return;
  io.to("admin_room").emit("new_order_placed", {
    orderId: order._id,
    orderNumber: order.orderNumber,
    amount: order.amount,
    customerName: order.address?.firstName ? `${order.address.firstName} ${order.address.lastName}` : "Customer",
    itemsCount: order.items?.length || 0,
    timestamp: new Date().toISOString()
  });
  console.log(`🔔 Notified admin panel of new order: ${order.orderNumber || order._id}`);
};
