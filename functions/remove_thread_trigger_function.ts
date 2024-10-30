import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const RemoveThreadTriggerFunctionDefinition = DefineFunction({
    callback_id: "remove_thread_trigger",
    title: "Remove thread trigger",
    description: "Delete prompt and survey data for a message",
    source_file: "functions/remove_thread_trigger_function.ts",
    input_parameters: {
        properties: {
            channel_id: {
                type: Schema.slack.types.channel_id,
                description: "The channel containing the reacted message",
            },
            prompt_ts: {
                type: Schema.slack.types.message_ts,
                description:
                    "Message timestamp of the ephemeral message with the trigger link",
            },
            trigger_id: {
                type: Schema.types.string,
                description: "Trigger id",
            },
        },
        required: [
            "channel_id",
            "prompt_ts",
            "trigger_id",
        ],
    },
    output_parameters: { properties: {}, required: [] },
});

export default SlackFunction(
    RemoveThreadTriggerFunctionDefinition,
    async ({ inputs, client }) => {
        const { channel_id, prompt_ts, trigger_id } = inputs;

        const deleteEphemeralMessage = await client.chat.delete({
            channel: channel_id,
            ts: prompt_ts,
        });

        if (!deleteEphemeralMessage.ok) {
            return {
                error:
                    `Failed to delete ephemeral message with trigger: ${deleteEphemeralMessage.error}`,
            };
        }

        // Delete link trigger
        const deleteTrigger = await client.workflows.triggers.delete({
            trigger_id,
        });

        if (!deleteTrigger.ok) {
            return {
                error: `Failed to delete link trigger: ${deleteTrigger.error}`,
            };
        }

        return { outputs: {} };
    },
);
