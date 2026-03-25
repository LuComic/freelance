import { httpRouter } from "convex/server";
import { registerRoutes } from "@convex-dev/stripe";
import { auth } from "./auth";
import { components } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);
registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
});

export default http;
