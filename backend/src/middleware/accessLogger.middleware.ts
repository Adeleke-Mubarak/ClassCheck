import type { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { appendFile } from "fs/promises";
import { mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accessLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  const dateAndTime = new Date().toISOString().replace("T", " ").slice(0, 19);

  const dateFolder = dateAndTime.slice(0, 10);
  const directory = path.join(__dirname, "..", "..", "logs", dateFolder);
  const filePath = path.join(directory, "access.log");

  mkdirSync(directory, { recursive: true });

  res.on("finish", async () => {
    try {
      const responseTime = Number(process.hrtime.bigint() - start) / 1_000_000;
      const log = `${dateAndTime} -- ${req.ip} -- ${req.method} ${req.originalUrl} ${res.statusCode} ${res.statusMessage} -- response-time: ${Math.round(responseTime)} ms \n`;
      await appendFile(filePath, log, "utf8");
    } catch (error) {
      console.error(error);
    }
  });

  next();
};

export default accessLogger;
