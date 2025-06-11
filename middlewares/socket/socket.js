// socket/socket.js
export default function setupSocketIO(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinBookingChat", ({ bookingId }) => {
      socket.join(bookingId);
      console.log(`User joined chat room: ${bookingId}`);
    });

    socket.on("sendChatMessage", ({ bookingId, senderId, message }) => {
      const timestamp = new Date().toISOString();
      const chatMessage = { senderId, message, timestamp };
      io.to(bookingId).emit("receiveChatMessage", chatMessage);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
