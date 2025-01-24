import { name, slackApp, prisma } from '../index'

const appHome = async () => {
    // listen for shortcut
    slackApp.event('app_home_opened', async ({ payload, context }) => {
        // check if its opening the home tab
        if (payload.tab !== 'home') {
            return
        }

        // get info about the user
        const user = await context.client.users.info({
            user: payload.user,
        })

        if (!user.user) {
            return
        }

        // update the home tab
        await context.client.views.publish({
            user_id: payload.user,
            view: {
                type: 'home',
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `:gear: ${name}'s Dashboard :gear:`,
                        },
                    },
                    {
                        type: 'divider',
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `Hi <@${
                                user.user.id
                            }> to use me run \`/createchannelping\` this will only work if you own the channel. Have fun :)`,
                        },
                    },
                    {
                        type: 'divider',
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `:blobby-admission_tickets: Admins: \n\n${process.env.ADMINS?.split(
                                ','
                            )
                                .map((admin) => `<@${admin}>`)
                                .join(' ')}`,
                        },
                    },
                    {
                        type: 'divider',
                    },
                    {
                        type: 'actions',
                        elements: [
                            {
                                type: 'button',
                                text: {
                                    type: 'plain_text',
                                    text: 'Reload Dashboard',
                                    emoji: true,
                                },
                                action_id: 'reloadDashboard',
                            },
                        ],
                    },
                ],
            },
        })
        return
    })
}

export default appHome
