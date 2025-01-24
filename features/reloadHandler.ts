import { slackApp, name } from "../index";

const reloadHandler = async () => {
	// listen for action
	slackApp.action("reloadDashboard", async ({ payload, context }) => {
		// get info about the user
		await context.client.views.publish({
			user_id: payload.user.id,
			view: {
				type: "home",
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: `:gear: ${name}'s Dashboard :gear:`,
						},
					},
					{
						type: "divider",
					},
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: `Hi <@${payload.user.id}> to use me run \`/createchannelping\` this will only work if you own the channel. Have fun :)`,
						},
					},
					{
						type: "divider",
					},
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: `:blobby-admission_tickets: Admins: \n\n${process.env.ADMINS?.split(
								",",
							)
								.map((admin) => `<@${admin}>`)
								.join(" ")}`,
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
									text: "Reload Dashboard",
									emoji: true,
								},
								action_id: "reloadDashboard",
							},
						],
					},
				],
			},
		});
		return;
	});
};

export default reloadHandler;
