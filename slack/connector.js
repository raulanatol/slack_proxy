/**
 * Created by @raulanatol on 01/06/15.
 */


exports.generateBasicMessage = function generateBasicSlackMessage() {
    return {
        'username': (typeof process.env['SLACK_USERNAME'] != "undefined") ? process.env['SLACK_USERNAME'] : 'Slack proxy',
        'icon_emoji': (typeof process.env['SLACK_ICON_EMOJI'] != "undefined") ? process.env['SLACK_ICON_EMOJI'] : ':triangular_flag_on_post:',
        'channel': (typeof process.env['SLACK_CHANNEL'] != "undefined") ? process.env['SLACK_CHANNEL'] : '#general'
    }
};

exports.publishMessage = function (request, res, slackMessage) {
    var slackURL = process.env['SLACK_WEBHOOK'];
    if (typeof slackURL != "undefined") {
        var payload = JSON.stringify(slackMessage);
        console.log('Sending message to Slack. Url: ' + slackURL + ' payload: ' + payload);
        request.post(slackURL, {
            form: {
                "payload": payload
            }
        }, function (error) {
            if (error) {
                console.log('Error sending slack message', error);
                return res.send('Communication with Slack failed!', 500);
            } else {
                console.log('Messaged sent to Slack!');
                res.send('Ok');
            }
        });
    } else {
        console.log('SLACK_WEBHOOK not defined. Use: heroku config:set SLACK_WEBHOOK=xxxxx');
        res.send('SLACK_WEBHOOK not defined!', 500);
    }
};

