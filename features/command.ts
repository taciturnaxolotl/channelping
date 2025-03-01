import { slackApp, slackClient } from "../index";
import getEntityListAssignments from "../lib/channelManager";

const command = async () => {
	slackApp.command("/createchannelping", async ({ context, payload }) => {
		// check whether the user is an admin
		if (!process.env.ADMINS?.split(",").includes(context.userId ?? "")) {
			// check if they are a channel manager for this channel
			const managers = await getEntityListAssignments(context.channelId);
			const channelInfo = await slackClient.conversations.info({
			  channel: context.channelId,
      });

			if (
			  !managers.includes(context.userId ?? "") ||
			  channelInfo.channel?.creator
			) {
				await context.respond({
					text: "Sorry but you aren't authorized to use this!",
				});

				return;
			}
		}

		async function fetchMembers(channel: string) {
			let allMembers: string[] = [];
			let nextCursor: string | undefined;

			do {
				const response = await slackClient.conversations.members({
					channel,
					cursor: nextCursor,
				});

				allMembers = allMembers.concat(response.members ?? []);
				nextCursor = response.response_metadata?.next_cursor;
			} while (nextCursor);

			return allMembers;
		}

		const members = (await fetchMembers(payload.channel_id ?? "")).length;

		await slackClient.chat.postEphemeral({
			channel: payload.channel_id ?? "",
			user: context.userId ?? "",
			text: `Do you want to make a ping group for ${members} members? (this will ping all of them initialy via slackbot by adding them to a ping group)`,
			blocks: [
				{
					type: "section",
					text: {
						type: "mrkdwn",
						text: `Are you sure you want to make a ping group for ${members} members? (this will ping all of them initialy via slackbot by adding them to a ping group)`,
					},
				},
				{
					type: "divider",
				},
				{
					type: "actions",
					elements: [
						{
							type: "button",
							text: {
								type: "plain_text",
								text: "Yes",
							},
							value: "yes",
							action_id: "createchannelping",
						},
						{
							type: "button",
							text: {
								type: "plain_text",
								text: "No",
							},
							value: "no",
							action_id: "cancel",
						},
					],
				},
			],
		});
	});
};

export default command;
