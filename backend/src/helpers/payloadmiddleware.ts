import { json } from "express";

export const FILE_LIMIT = "50mb";
export const payloadMiddleware = json({ limit: FILE_LIMIT });
