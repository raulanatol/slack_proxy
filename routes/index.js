/**
 * Created by @raulanatol on 29/05/15.
 */

var slackConnector = require('../slack/connector');

exports.index = function (req, res) {
    res.send('Hello world!');
};


exports.test = function (req, res) {
    var slackMessage = slackConnector.generateBasicMessage();
    slackMessage['text'] = 'Hello slack!';
    slackMessage['attachments'] = [{
        'fallback': 'Hello slack',
        'text': 'Hello slack',
        'color': '#000077'
    }];
    slackConnector.publishMessage(req, res, slackMessage);
};