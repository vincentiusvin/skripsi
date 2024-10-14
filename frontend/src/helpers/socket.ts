import { Socket, io } from "socket.io-client";
import type { ServerToClientEvents } from "../../../backend/src/sockets";

export const socket: Socket<ServerToClientEvents, never> = io({
  path: "/api/chat",
  autoConnect: false,
});
