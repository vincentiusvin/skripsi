import { createLogger, format, transports } from "winston";
const { colorize, simple, json, timestamp, combine } = format;
const { File, Console } = transports;

const logger = createLogger({
  format: combine(timestamp(), json()),
  defaultMeta: { service: "skripsi" },
  level: "silly",
  transports: [new File({ filename: "combined.log" })],
});

if (process.env.LOG === "on") {
  logger.add(
    new Console({
      format: combine(colorize(), simple()),
    }),
  );
}

export default logger;
