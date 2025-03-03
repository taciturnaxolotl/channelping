import { slackApp, slackClient } from "../index";
import { blog } from "../lib/Logger";

const createChannelPing = async () => {
	slackApp.action("createchannelping", async ({ context, payload }) => {
		// @ts-expect-error value exits but isn't recognized as existing by library
		if (payload.actions[0].value === "no") {
			if (context.respond) {
				await context.respond({
					text: "You have chosen not to create a channel ping group!",
				});
			}
			return;
		}

		async function fetchMembers(channel: string) {
			let allMembers: string[] = [];
			let nextCursor: string | undefined = undefined;

			do {
				const response = await slackClient.conversations.members({
					channel,
					cursor: nextCursor,
				});

				if (response.members) {
					allMembers = allMembers.concat(response.members);
				}
				nextCursor = response.response_metadata?.next_cursor;
			} while (nextCursor);

			return allMembers;
		}

		if (!payload.channel?.id) {
			return;
		}

		const members = await fetchMembers(payload.channel.id);

		const channelName = await slackClient.conversations
			.info({
				channel: payload.channel.id,
			})
			.then((res) => res.channel?.name);

		let pinggroup: string | undefined;
		try {
			pinggroup = await slackClient.usergroups
				.create({
					name: `${channelName}-ping`,
					handle: `${channelName}-ping`,
					channels: [payload.channel.id],
					description: `Channel ping group for ${channelName}`,
				})
				.then((res) => res.usergroup?.id);
		} catch (e) {
			if (e instanceof Error && !e.message.includes("name_already_exists")) {
				console.warn(e);
			} else {
				pinggroup = (await slackClient.usergroups.list()).usergroups?.find(
					(group) => group.handle === `${channelName}-ping`,
				)?.id;
			}
		}

		if (pinggroup && members) {
			await slackClient.usergroups.users.update({
				usergroup: pinggroup,
				users: members,
			});
		}

		blog(
			`Channel ping group ${channelName}-ping has been created for channel <#${payload.channel.id}> (#\\${channelName}) by <@${context.userId}> with ${members?.length} members!`,
			"info",
		);

		if (context.respond) {
			await context.respond({
				text: `Channel ping group <!subteam^${pinggroup}> has been created with ${members?.length} members!`,
			});
		}
	});
};

export default createChannelPing;
