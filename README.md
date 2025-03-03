<!-- omit in toc -->

# Channel Ping!

A quick bot I made to create a slack ping group for all the members of the channel in which the command is run.

## Getting Started

Just follow the directions in [DOCS.md](DOCS.md) but the tldr is clone the repo run `bun install` and then start it with a systemd service

## Production

Deploying Channel Ping in a production environment is pretty easy. Simply use a systemctl service file to manage the bot (i totaly would have used docker but i was burned by docker-prisma interactions in the past and so now I'm sticking to systemd services lol):

```env
SLACK_BOT_TOKEN="xoxb-xxxxxxx"
SLACK_SIGNING_SECRET="xxxxxxx"
NODE_ENV=development
ADMINS="U062UG485EE"
SLACK_LOG_CHANNEL="C08G7F24N3T" # send creation logs here
SLACK_SPAM_CHANNEL="C069N64PW4A" # send startup logs here
SLACK_USER_COOKIE="utm=%7B%7D; b=.xxxx; x=xxxxx.xxxxx; ec=xxxxxxxxxxxxx; d=xoxd-xxxxxxx; lc=xxxx; d-s=xxxx; shown_ssb_redirect_page=1; shown_download_ssb_modal=1; show_download_ssb_banner=1; no_download_ssb_banner=1; tz=-300; web_cache_last_updatede80d6af2c90a6b44cca71740beeaa87a=1737750261261"
SLACK_BROWSER_TOKEN="xoxc-xxxxxx"

```

```ini
[Unit]
Description=ChannelPing
DefaultDependencies=no
After=network-online.target

[Service]
Type=exec
WorkingDirectory=/home/kierank/channelping
ExecStart=bun run index.ts
TimeoutStartSec=0
Restart=on-failure
RestartSec=1s

[Install]
WantedBy=default.target
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

_© 2024-present Kieran Klukas_  
_Licensed under [AGPL 3.0](LICENSE.md)_
