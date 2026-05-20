import { createServer } from "http";
import app from "./src/app";
import { connectDB } from "./src/configs/db";
import { env } from "./src/configs/env";
import CronService from "./src/services/schedule.service";

const server = createServer(app);

const PORT = env.PORT;

server.listen(PORT, async () => {
  await connectDB(env.DB_URI);
  console.log(`Server is running on port ${PORT}`);
  
  // Initialize Cron Service and load active jobs from DB
  const cronService = new CronService();
  await cronService.initialize();
});
