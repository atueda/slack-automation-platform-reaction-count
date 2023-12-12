import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { ReactionRankingFunctionDefinition } from "../functions/reaction_ranking_function.ts";

export const Workflow = DefineWorkflow({
  callback_id: "reaction_ranking",
  title: "Reaction Ranking Workflow",
  input_parameters: {
    properties: {
      user_id: {
        type: Schema.slack.types.user_id,
      },
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      event_ts: { //threadTs
        type: Schema.types.string,
      },
    },
    required: ["user_id", "channel_id"],
  },
});

Workflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: Workflow.inputs.channel_id,
  // thread_ts: Workflow.inputs.threadTs, // TODO send thread
  message: "集計中です。しばらくお待ちください！",
});

const getReactionsListFunctionDefinition = Workflow.addStep(
  ReactionRankingFunctionDefinition,
  {
    user_id: Workflow.inputs.user_id,
  },
);

Workflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: Workflow.inputs.channel_id,
  message: getReactionsListFunctionDefinition.outputs.reactionRanking,
});

export default Workflow;
