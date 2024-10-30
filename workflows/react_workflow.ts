import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetReactsFunctionDefinition } from "../functions/get_reacts_function.ts";
import { GetMessagePermalinkFunctionDefinition } from "../functions/get_message_permalink.ts";
import { CreatePromptTriggerFunctionDefinition } from "../functions/create_prompt_trigger.ts";
import { RemoveThreadTriggerFunctionDefinition } from "../functions/remove_thread_trigger_function.ts";

const ReactWorkflow = DefineWorkflow({
    callback_id: "react_workflow",
    title: "React workflow",
    description: "A react workflow",
    input_parameters: {
        properties: {
            channel_id: {
                type: Schema.slack.types.channel_id,
            },
            user: {
                type: Schema.slack.types.user_id,
            },
            message_ts: {
                type: Schema.slack.types.message_ts,
            },
        },
        required: ["channel_id", "user", "message_ts"],
    },
});

// const loadingMessage = ReactWorkflow.addStep(
//     Schema.slack.functions.SendEphemeralMessage,
//     {
//         channel_id: ReactWorkflow.inputs.channel_id,
//         user_id: ReactWorkflow.inputs.user,
//         message: `Give me 1 sec... :loading:`,
//     },
// );

const parentPermalink = ReactWorkflow.addStep(
    GetMessagePermalinkFunctionDefinition,
    {
        channel_id: ReactWorkflow.inputs.channel_id,
        parent_ts: ReactWorkflow.inputs.message_ts,
    },
);

const reactors = ReactWorkflow.addStep(
    GetReactsFunctionDefinition,
    {
        channel_id: ReactWorkflow.inputs.channel_id,
        user: ReactWorkflow.inputs.user,
        message_ts: ReactWorkflow.inputs.message_ts,
    },
);

const promptTrigger = ReactWorkflow.addStep(
    CreatePromptTriggerFunctionDefinition,
    {
        channel_id: ReactWorkflow.inputs.channel_id,
        parent_url: parentPermalink.outputs.permalink,
        reactors: reactors.outputs.reactedUsers,
        user_id: ReactWorkflow.inputs.user,
    },
);

const sendEphemeralMessageResponse = ReactWorkflow.addStep(
    Schema.slack.functions.SendEphemeralMessage,
    {
        channel_id: ReactWorkflow.inputs.channel_id,
        user_id: ReactWorkflow.inputs.user,
        message:
            `Hey <@${ReactWorkflow.inputs.user}>, would you like to <${promptTrigger.outputs.prompt_url}|create a new channel> for reactors of <${parentPermalink.outputs.permalink}|this message>?`,
    },
);

ReactWorkflow.addStep(
    Schema.slack.functions.Delay,
    { minutes_to_delay: 10 },
);

ReactWorkflow.addStep(
    RemoveThreadTriggerFunctionDefinition,
    {
        channel_id: ReactWorkflow.inputs.channel_id,
        prompt_ts: sendEphemeralMessageResponse.outputs.message_ts,
        trigger_id: promptTrigger.outputs.prompt_id,
    },
);

export default ReactWorkflow;
