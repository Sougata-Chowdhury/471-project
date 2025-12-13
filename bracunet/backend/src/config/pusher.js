import Pusher from "pusher";
import { config } from "../config/index.js";

// Initialize Pusher
export const pusher = new Pusher({
  appId: config.pusher.appId || "placeholder-app-id",
  key: config.pusher.key || "placeholder-key",
  secret: config.pusher.secret || "placeholder-secret",
  cluster: config.pusher.cluster || "ap2",
  useTLS: true,
});

export default pusher;
