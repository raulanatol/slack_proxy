/**
 * Created by @raulanatol on 29/05/15.
 */
function parseMessageToJSON(message) {
    var jsonMessage;
    try {
        jsonMessage = JSON.parse(message.Message);
    } catch (exception) {
        jsonMessage = {
            "message": message,
            "notificationType": "nonJSONMessage"
        };
    }
    return jsonMessage;
}

function publishSlackMessage(request, res, slackMessage) {
    var slackURL = process.env['SLACK_WEBHOOK'];
    if (typeof slackURL != "undefined") {
        console.log('Sending message to Slack. Url: ' + slackURL);
        request.post(slackURL, {
            from: {
                "payload": JSON.stringify(slackMessage)
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
        return res.send('SLACK_WEBHOOK not defined!', 500);
    }
}

function generateBasicSlackMessage() {
    return {
        'username': (typeof process.env['SLACK_USERNAME'] != "undefined") ? process.env['SLACK_USERNAME'] : 'Slack proxy',
        'icon_emoji': (typeof process.env['SLACK_ICON_EMOJI'] != "undefined") ? process.env['SLACK_ICON_EMOJI'] : ':triangular_flag_on_post:',
        'channel': (typeof process.env['SLACK_CHANNEL'] != "undefined") ? process.env['SLACK_CHANNEL'] : '#general'
    }
}

function generateDefaultSlackMessage(slackMessage, jsonMessage) {
    slackMessage['text'] = jsonMessage.message;
    slackMessage['attachments'] = [{
        'fallback': jsonMessage.message,
        'text': jsonMessage.message,
        'color': '#000077'
    }];
    return slackMessage;
}

function generateSlackMessageFromNonJson(slackMessage, jsonMessage) {
    slackMessage['text'] = jsonMessage.message;
    slackMessage['attachments'] = [{
        'fallback': jsonMessage.message,
        'text': jsonMessage.message,
        'color': '#000077'
    }];
    return slackMessage;
}

function generateSlackMessageFromAlarm(slackMessage, jsonMessage) {
    slackMessage['text'] = jsonMessage.message;
    slackMessage['attachments'] = [{
        "fallback": jsonMessage.message,
        "text": jsonMessage.message,
        "color": jsonMessage.NewStateValue == "ALARM" ? "warning" : "good",
        "fields": [{
            "title": "Alarm",
            "value": jsonMessage.AlarmName,
            "short": true
        }, {
            "title": "Status",
            "value": jsonMessage.NewStateValue,
            "short": true
        }, {
            "title": "Reason",
            "value": jsonMessage.NewStateReason,
            "short": false
        }]
    }];
    return slackMessage;
}

exports.cloudWatch = function (req, res) {
    var request = require('request');
    var message = JSON.parse(req.text);

    if (message['Type'] == 'SubscriptionConfirmation') {
        request(message['SubscribeURL'], function (err, result, body) {
            if (err || body.match(/Error/)) {
                res.send('Error: Impossible confirm subscription - URL: ' + message['SubscribeURL'], 500);
            } else {
                console.log("Subscribed to Amazon SNS Topic: " + message['TopicArn']);
                res.send('Ok');
            }
        });
    } else if (message['Type'] == 'Notification') {
        var slackMessage = generateBasicSlackMessage();
        var jsonMessage = parseMessageToJSON(message['Message']);
        //TODO add more notifications type
        if (jsonMessage['AlarmName']) {
            slackMessage = generateSlackMessageFromAlarm(slackMessage, jsonMessage);
        } else if (jsonMessage['notificationType'] == 'nonJSONMessage') {
            slackMessage = generateSlackMessageFromNonJson(slackMessage, jsonMessage);
        } else {
            slackMessage = generateDefaultSlackMessage(slackMessage, jsonMessage);
        }
        publishSlackMessage(request, res, slackMessage);
    } else {
        console.log("Unknown type of message: " + message.Type + ' message: ' + message);
    }
};