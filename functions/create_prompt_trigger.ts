import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import CreateChannelWorkflow from "../workflows/create_channel.ts";
import ReactWorkflow from "../workflows/react_workflow.ts";

export const CreatePromptTriggerFunctionDefinition = DefineFunction({
    callback_id: "create_prompt_trigger",
    title: "Create prompt trigger link",
    description: "Create a link trigger that prompts survey creation",
    source_file: "functions/create_prompt_trigger.ts",
    input_parameters: {
        properties: {
            channel_id: {
                type: Schema.slack.types.channel_id,
                description: "The channel containing the reacted message",
            },
            parent_url: {
                type: Schema.types.string,
                description: "Permalink of the reacted message",
            },
            reactors: {
                type: Schema.types.array,
                items: {
                    type: Schema.slack.types.user_id,
                },
            },
            // ephemeralMessageTs: {
            //     type: Schema.slack.types.message_ts,
            //     description: "Message timestamp of the ephemeral message",
            // },
            user_id: {
                type: Schema.slack.types.user_id,
            },
        },
        required: [
            "channel_id",
            "parent_url",
            "reactors",
            // "ephemeralMessageTs",
            "user_id",
        ],
    },
    output_parameters: {
        properties: {
            prompt_id: {
                type: Schema.types.string,
                description: "Link trigger ID of the prompt",
            },
            prompt_url: {
                type: Schema.types.string,
                description: "Link trigger URL of the prompt",
            },
        },
        required: ["prompt_id", "prompt_url"],
    },
});

export default SlackFunction(
    CreatePromptTriggerFunctionDefinition,
    async ({ inputs, client }) => {
        const { channel_id, reactors } = inputs;

        const trigger = await client.workflows.triggers.create<
            typeof CreateChannelWorkflow.definition
        >({
            type: TriggerTypes.Shortcut,
            name: "Create a channel",
            description: "Create a channel with reactors",
            workflow:
                `#/workflows/${CreateChannelWorkflow.definition.callback_id}`,
            inputs: {
                channel_id: { value: channel_id },
                user_id: { value: TriggerContextData.Shortcut.user_id },
                reactors: { value: reactors },

                interactivity: {
                    value: TriggerContextData.Shortcut.interactivity,
                },
            },
            shortcut: { button_text: "Create" },
        });

        if (!trigger.ok || !trigger.trigger.shortcut_url) {
            return {
                error:
                    `Failed to create link trigger for the survey: ${trigger.error}`,
            };
        }

        return {
            outputs: {
                prompt_id: trigger.trigger.id,
                prompt_url: trigger.trigger.shortcut_url,
            },
        };
    },
);
