import { json } from "express";

export const FILE_LIMIT = "25mb";
export const payloadMiddleware = json({ limit: FILE_LIMIT });
