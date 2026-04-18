import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { handleWebhook } from "./telegram/webhook/actions";

const http = httpRouter();

auth.addHttpRoutes(http);

// Telegram Bot Webhook
http.route({
  path: "/telegram/webhook",
  method: "POST",
  handler: handleWebhook,
});

export default http;
