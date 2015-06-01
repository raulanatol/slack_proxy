Slack proxy
===========

Proxy to keep communication between Slack an another application.



Heroku deploy
=============

```bash
heroku apps:create
heroku config:set 'SLACK_WEBHOOK=https://hooks.slack.com/services/.../.../...'
heroku config:set 'SLACK_USERNAME=Slack proxy'
heroku config:set 'SLACK_ICON_EMOJI=:space_invader:'
heroku config:set 'SLACK_CHANNEL=#notif_ops'

git push heroku master