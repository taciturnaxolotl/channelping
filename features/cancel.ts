import { slackApp } from '../index'

const cancel = async () => {
    slackApp.action('cancel', async ({ context }) => {
        if (context.respond) {
            await context.respond({
                text: 'You have chosen not to create a channel ping group!',
            })
        }
    })
}

export default cancel
