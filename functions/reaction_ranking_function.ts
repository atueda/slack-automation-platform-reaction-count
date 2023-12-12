import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts"; // Add this
import { CHANNEL_ID } from "../env.ts";

export const ReactionRankingFunctionDefinition = DefineFunction({
  callback_id: "reaction_ranking_function",
  title: "Reactions ranking function",
  description: "Get reactions ranking function",
  source_file: "functions/reaction_ranking_function.ts",
  input_parameters: {
    properties: {
      user_id: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["user_id"],
  },
  output_parameters: {
    properties: {
      reactionRanking: {
        type: Schema.types.string,
      },
      error: { type: Schema.types.string },
    },
    required: ["reactionRanking"],
  },
});

export default SlackFunction(
  ReactionRankingFunctionDefinition,
  async ({ inputs, token }) => {
    const loggingOutput = {
      inputs,
      token,
    };
    console.log(JSON.stringify(loggingOutput, null, 2));

    const { user_id } = inputs;
    const reactionsCount: { [key: string]: number } = {};
    const client = SlackAPI(token);

    // チャンネルメンバー一覧
    // const list = await client.conversations.members({
    //   channel: "C05HPB9D9LN",
    // });
    // console.log("user_list: " + JSON.stringify(list));
    // const user_list = list.members;
    // console.log("user list: " + JSON.stringify(user_list));

    const nowDate = new Date();
    nowDate.setDate(1);
    const latest = nowDate.getTime();
    const pastDate = new Date();
    pastDate.setMonth(nowDate.getMonth() - 2);
    const oldest = pastDate.getTime();
    console.log("latest: " + latest);
    console.log("oldest: " + oldest);
    const results = await client.conversations.history({
      channel: CHANNEL_ID,
      latest: latest,
      //oldest: oldest,
      //limit: 10,
      //cursor: "bmV4dF90czoxNjk0NDk2MDI3MjczMDg5",
    });
    //console.log("history: " + JSON.stringify(results.messages));//デバッグ用

    const messages = results.messages;
    for (const value of messages) {
      Object.keys(value).forEach(function (key) {
        //if (key === "ts") console.log("ts: " + JSON.stringify(value[key])); //デバッグ用

        if (key === "reactions") {
          //console.log("reactions: " + JSON.stringify(value[key])); //デバッグ用
          const reactions = value[key];
          for (const reaction of reactions) {
            //console.log("name: " + JSON.stringify(reaction["name"])); //デバッグ用
            //console.log("users: " + JSON.stringify(reaction["users"])); //デバッグ用

            for (const user of reaction.users) {
              if (!Object.keys(reactionsCount).includes(user)) {
                reactionsCount[user] = 0;
              }
              reactionsCount[user] += 1;
            }

            // リアクションを集計する場合
            // if (!(reactions.name in reactionsCount)) {
            //   reactionsCount[reactions.name] = 0;
            // }
            // console.log("reactions.name: " + reactions.name);
            // reactionsCount[reactions.name] += 1;
          }
        }
      });
    }
    console.log("reactionsCount  :" + JSON.stringify(reactionsCount));

    const array = Object.keys(reactionsCount).map((k) => ({
      key: k,
      value: reactionsCount[k],
    }));
    array.sort((a, b) => b.value - a.value);

    console.log(
      array.slice(0, 20).map((item, index) =>
        (index + 1) + "位  :" + item.key + ": " + item.value + "回"
      ).join("\n"),
    );

    const reactionRanking = `<@${user_id}>\nリアクションランキングです！\n` +
      array.slice(0, 20).map((item, index) =>
        (index + 1) + "位 <@" + item.key + "> " + item.value + "回"
      ).join("\n");
    return { outputs: { reactionRanking } };
  },
);
