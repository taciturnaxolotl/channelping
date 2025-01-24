import { SlackApp } from "slack-edge";

const slackApp = new SlackApp({
	env: {
		SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN!,
		SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET!,
		SLACK_LOGGING_LEVEL: "INFO",
	},
	startLazyListenerAfterAck: true,
});
const slackClient = slackApp.client;

const main = (async () => {
	// ask for input on ping group name
	const prompt = "Enter the ping group name: ";
	const line = await new Promise<string>((resolve) => {
		process.stdout.write(prompt);
		process.stdin.once("data", (data) => {
			const input = data.toString().trim().replace(/@/g, "");
			resolve(input);
		});
	});

	console.log(`Removing people from ping group @${line} ...`);

	// get id from listing groups and filtering
	const pinggroup = (await slackClient.usergroups.list()).usergroups?.find(
		(group) => group.handle == line,
	)?.id;

	if (!pinggroup) {
		console.log(`Ping group @${line} not found!`);
		process.exit(1);
	}

	await slackClient.usergroups.users.update({
		usergroup: pinggroup,
		users: [],
	});

	process.exit(0);
})();
