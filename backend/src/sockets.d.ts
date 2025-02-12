import { Server } from "socket.io";

export type MessageData = {
  id: number;
  message: string;
  created_at: Date;
  user_id: number;
  is_edited: boolean;
  files: {
    id: number;
    filetype: string;
    filename: string;
  }[];
};

type Message = (room_id: number, data: MessageData) => void;

export type ServerToClientEvents = {
  roomUpdate: () => void;
  msg: Message;
  msgUpd: Message;
};

export type SocketData = {
  userId?: number;
};

export type ServerType = Server<never, ServerToClientEvents, never, SocketData>;
