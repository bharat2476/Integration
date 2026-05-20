import { createApp } from "./app.js";
import { logger } from "./shared/logger.js";

const port = Number(process.env.PORT ?? 8080);
const app = createApp();

app.listen(port, () => {
  logger.info({ port }, "omniroute-core-api.started");
});
