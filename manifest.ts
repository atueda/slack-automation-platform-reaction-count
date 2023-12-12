import { Manifest } from "deno-slack-sdk/mod.ts";
import Workflow from "./workflows/workflow.ts";

export default Manifest({
  name: "reaction ranking",
  description: "reaction ranking bot",
  icon: "assets/icon.png",
  workflows: [Workflow],
  outgoingDomains: [],
  botScopes: [
    "chat:write", // メッセージを投稿するための基本的な権限
    "chat:write.public", // public channel に参加することなくメッセージを投稿する権限
    "app_mentions:read",
    "channels:read",
    "reactions:read",
    "channels:history",
  ],
});
