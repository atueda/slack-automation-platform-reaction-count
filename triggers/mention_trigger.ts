import { Trigger } from "deno-slack-api/types.ts";
import Workflow from "../workflows/workflow.ts";
import { CHANNEL_IDS } from "../env.ts";

const trigger: Trigger<typeof Workflow.definition> = {
  type: "event",
  name: "Send a greeting",
  description: "Send greeting to channel",
  workflow: "#/workflows/reaction_ranking",
  event: {
    event_type: "slack#/events/app_mentioned",
    channel_ids: CHANNEL_IDS,
  },
  inputs: {
    user_id: {
      value: "{{data.user_id}}",
    },
    channel_id: {
      value: "{{data.channel_id}}",
    },
  },
};

export default trigger;
