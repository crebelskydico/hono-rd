import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import pino from "pino";

const app = new Hono();
const logger = pino({
  name: "hono",
  level: "trace",
});

app.use((c, next) => {
  logger.trace(`${c.req.header("X-Request-Id")}`);
  return next();
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    console.log(err.status);
    console.log(err.getResponse());
    logger.error(`${err.status}`);
    return err.getResponse();
  }
  return c.text("Internal Server Error", 500);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/error", (c) => {
  const errorResponse = new Response("Unauthorized", {
    status: 401,
    headers: {
      Authenticate: 'error="invalid_token"',
    },
  });
  throw new HTTPException(401, { res: errorResponse });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
