import { loadEnv } from "@restaurant/config";
import { buildApp } from "./app.js";
import { PrismaStore } from "./prisma-store.js";

const env = loadEnv();
const app = await buildApp({ store: new PrismaStore(), env });

app
  .listen({ port: env.PORT, host: "0.0.0.0" })
  .then(() => app.log.info(`api listening on :${env.PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
