/**
 * Created by @raulanatol on 29/05/15.
 */

var express = require('express');
var routesIndex = require('./routes/index');
var routesCloudWatch = require('./routes/cloudWatch');
var http = require('http');
var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(function (req, res, next) {
    if (req.is('text/*')) {
        req.text = '';
        req.setEncoding('utf8');
        req.on('data', function (chunk) {
            req.text += chunk
        });
        req.on('end', next);
    } else {
        next();
    }
});

app.use(app.router);

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.post('/aws/cloudWatch', routesCloudWatch.cloudWatch);
app.get('/', routesIndex.index);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
