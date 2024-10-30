import { Manifest } from "deno-slack-sdk/mod.ts";
import ReactWorkflow from "./workflows/react_workflow.ts";
import CreateChannelWorkflow from "./workflows/create_channel.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
    name: "slack-app",
    description: "A template for building Slack apps with Deno",
    icon: "assets/default_new_app_icon.png",
    workflows: [ReactWorkflow, CreateChannelWorkflow],
    outgoingDomains: [],
    botScopes: [
        "channels:join",
        "channels:manage",
        "chat:write",
        "chat:write.public",
        "commands",
        "groups:write",
        "reactions:read",
        "triggers:read",
        "triggers:write",
    ],
});
