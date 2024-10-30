import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import type { BaseResponse } from "deno-slack-api/types.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const GetReactsFunctionDefinition = DefineFunction({
    callback_id: "get_reacts_function",
    title: "Get reacts function",
    description: "A Get reacts function",
    source_file: "functions/get_reacts_function.ts",
    input_parameters: {
        properties: {
            user: {
                type: Schema.slack.types.user_id,
                description: "The user invoking the workflow",
            },
            message_ts: {
                type: Schema.slack.types.message_ts,
                description: "Timestamp of the thread?",
            },
            channel_id: {
                type: Schema.slack.types.channel_id,
                description: "Channel ID",
            },
        },
        required: ["message_ts", "user", "channel_id"],
    },
    output_parameters: {
        properties: {
            reactedUsers: {
                type: Schema.types.array,
                description: "The list of reacted users",
                items: {
                    type: Schema.slack.types.user_id,
                },
            },
            names: {
                type: Schema.types.string,
            },
        },
        required: ["reactedUsers", "names"],
    },
});

export default SlackFunction(
    GetReactsFunctionDefinition,
    async ({ inputs, client }) => {
        const reactsRes = await client.reactions.get({
            channel: inputs.channel_id,
            timestamp: inputs.message_ts,
            full: true,
        });

        if (!reactsRes.ok) {
            return {
                error:
                    `Failed to put item into the datastore: ${reactsRes.error}`,
            };
        }

        const { reactions } = reactsRes.message as {
            reactions: {
                name: string;
                users: string[];
                count: number;
            }[];
        };

        const reactedUsers = [
            ...new Set(reactions.map(({ users }) => users).flat()),
        ];

        const names = reactedUsers.map((id)=>`<@${id}>`).join(", ");

        return { outputs: { reactedUsers, names } };

        // const uuid = crypto.randomUUID();
        //
        // // inputs.user is set from the interactivity_context defined in sample_trigger.ts
        // // https://api.slack.com/automation/forms#add-interactivity
        // const updatedMsg = `:wave: ` + `<@${inputs.user}>` +
        //     ` submitted the following message: \n\n>${inputs.message}`;
        //
        // const sampleObject = {
        //     original_msg: inputs.message,
        //     updated_msg: updatedMsg,
        //     object_id: uuid,
        // };
        //
        // // Save the sample object to the datastore
        // // https://api.slack.com/automation/datastores
        // const putResponse = await client.apps.datastore.put<
        //     typeof SampleObjectDatastore.definition
        // >({
        //     datastore: "SampleObjects",
        //     item: sampleObject,
        // });
        //
        // if (!putResponse.ok) {
        //     return {
        //         error:
        //             `Failed to put item into the datastore: ${putResponse.error}`,
        //     };
        // }
        //
        // return { outputs: { updatedMsg } };
    },
);
