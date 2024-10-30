import { Trigger } from "deno-slack-sdk/types.ts";
import {
    TriggerContextData,
    TriggerEventTypes,
    TriggerTypes,
} from "deno-slack-api/mod.ts";
import ReactWorkflow from "../workflows/react_workflow.ts";
/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const reactTrigger: Trigger<typeof ReactWorkflow.definition> = {
    type: TriggerTypes.Event,
    name: "React trigger",
    description: "A react trigger",
    workflow: `#/workflows/${ReactWorkflow.definition.callback_id}`,
    event: {
        event_type: TriggerEventTypes.ReactionAdded,
        all_resources: true,
        // filter: {
        //     version: 1,
        //     root: {
        //         statement: "{{data.reaction}} == sunglasses",
        //     },
        // },
    },
    inputs: {
        channel_id: {
            value: TriggerContextData.Event.ReactionAdded.channel_id,
        },
        user: {
            value: TriggerContextData.Event.ReactionAdded.user_id,
        },
        message_ts: {
            value: TriggerContextData.Event.ReactionAdded.message_ts,
        },

    },
};

export default reactTrigger;
