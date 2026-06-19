import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./api";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  if (socket) return socket;

  const token = getAccessToken();
  if (!token) return null;

  socket = io(`${SOCKET_URL}/realtime`, {
    transports: ["websocket"],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    // eslint-disable-next-line no-console
    console.log("📡 Socket connected");
  });
  socket.on("disconnect", (reason) => {
    // eslint-disable-next-line no-console
    console.log("📡 Socket disconnected:", reason);
  });

  return socket;
}

export function connectSocket(): Socket | null {
  return getSocket();
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
