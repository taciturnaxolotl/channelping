import { slackApp, slackClient, prisma } from "../index";

const optOut = async () => {
	slackApp.command("optout-ping", async ({ context, payload }) => {
		const member = await prisma.optOutUsers.findFirst({
			where: {
				id: context.userId,
			},
		});

		if (
			member?.optOutChannels.split(",").includes(payload.channel_name) ||
			member?.completeOptOut
		) {
			const message = member?.completeOptOut
				? "You have opted out of all ping groups!"
				: "You have already opted out of the ping group for this channel!";
			await context.respond({
				text: message,
			});
			return;
		}

		try {
			await slackClient.usergroups.users
				.list({
					usergroup: `${payload.channel_name}-ping`,
				})
				.then((res) => res.users || []);
		} catch (e) {
			console.log(e);
			if (context.respond) {
				await context.respond({
					text: "There is no ping group for this channel or some other error happened",
				});
			}
			return;
		}

		// ask whether to total opt out or just for this channel
		await context.respond({
			text: "Do you want to opt out of all ping groups or just this channel?",
			blocks: [
				{
					type: "section",
					text: {
						type: "mrkdwn",
						text: "Do you want to opt out of all ping groups or just this channel?",
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
								text: "All ping groups",
							},
							value: "all",
						},
						{
							type: "button",
							text: {
								type: "plain_text",
								text: "Just this channel",
							},
							value: "channel",
						},
					],
				},
			],
		});
	});

	slackApp.action("optout", async ({ context, payload }) => {
		const member = await prisma.optOutUsers.findFirst({
			where: {
				id: context.userId,
			},
		});

		if (member?.completeOptOut) {
			if (context.respond) {
				await context.respond({
					text: "You have already opted out of all ping groups!",
				});
			}
			return;
		}

		let members: string[] = [];
		try {
			members = await slackClient.usergroups.users
				.list({
					usergroup: `${payload.channel?.name}-ping`,
				})
				.then((res) => res.users || []);
		} catch (e) {
			console.log(e);
			if (context.respond) {
				await context.respond({
					text: "There is no ping group for this channel or some other error happened",
				});
			}
			return;
		}

		const pinggroup =
			(await slackClient.usergroups.list()).usergroups?.find(
				(group) => group.handle === `${payload.channel?.name}-ping`,
			)?.id || "";

		await slackClient.usergroups.users.update({
			usergroup: pinggroup,
			users: members.filter((id) => id !== context.userId),
		});

		// @ts-expect-error
		if (payload.actions[0].value === "all") {
			await prisma.optOutUsers.update({
				where: {
					id: context.userId,
				},
				data: {
					completeOptOut: true,
				},
			});

			if (context.respond) {
				await context.respond({
					text: "You have opted out of all ping groups!",
				});
			}

			return;
		}

		const channel = payload.channel?.id || "";

		const channels = member?.optOutChannels.split(",");

		if (channels?.includes(channel)) {
			if (context.respond) {
				await context.respond({
					text: "You have already opted out of the ping group for this channel!",
				});
			}
			return;
		}

		channels?.push(channel);

		await prisma.optOutUsers.update({
			where: {
				id: context.userId,
			},
			data: {
				optOutChannels: channels?.join(","),
			},
		});

		if (context.respond) {
			await context.respond({
				text: "You have opted out of the ping group for this channel!",
			});
		}
	});
};

export default optOut;
