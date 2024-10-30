import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

const CreateChannelWorkflow = DefineWorkflow({
    callback_id: "create_channel",
    title: "Create a channel",
    description: "Add a request for feedback to a message",
    input_parameters: {
        properties: {
            channel_id: {
                type: Schema.slack.types.channel_id,
                description: "The channel containing the reacted message",
            },
            parent_ts: {
                type: Schema.slack.types.message_ts,
                description: "Message timestamp of the reacted message",
            },
            user_id: {
                type: Schema.slack.types.user_id,
                description: "User that added the reacji",
            },
            reactors: {
                type: Schema.types.array,
                items: {
                    type: Schema.slack.types.user_id,
                },
                description: "User that reacted to the message",
            },
            interactivity: { type: Schema.slack.types.interactivity },
        },
        required: [
            "channel_id",
            "user_id",
            "interactivity",
            "reactors",
        ],
    },
});

const formResponse = CreateChannelWorkflow.addStep(
    Schema.slack.functions.OpenForm,
    {
        title: "Create a channel",
        description: "What do you think about the topic of this message?",
        interactivity: CreateChannelWorkflow.inputs.interactivity,
        submit_label: "Create",
        fields: {
            elements: [{
                name: "channel_name",
                title: "Overall impression",
                type: Schema.types.string,
            }, {
                name: "members",
                title: "Members",
                type: Schema.types.array,
                items: {
                    type: Schema.slack.types.user_id,
                },
                description: "Who to add?",
                default: CreateChannelWorkflow.inputs.reactors,
            }],
            required: ["channel_name"],
        },
    },
);

const createChannelResponse = CreateChannelWorkflow.addStep(
    Schema.slack.functions.CreateChannel,
    {
        channel_name: formResponse.outputs.fields.channel_name,
        is_private: false,
        team_id: "T07TLRJ3RNK",
        manager_ids: [CreateChannelWorkflow.inputs.user_id],
    },
);

CreateChannelWorkflow.addStep(
    Schema.slack.functions.InviteUserToChannel,
    {
        channel_ids: [createChannelResponse.outputs.channel_id],
        user_ids: formResponse.outputs.fields.members,
    },
);

export default CreateChannelWorkflow;
