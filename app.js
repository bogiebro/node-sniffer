
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var AWS = require('aws-sdk');
var moment = require('moment');

var app = express();

// all environments
app.use(require('connect-assets')());
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  res.render('index', { title: 'Yalie Tracker' });
});

AWS.config.loadFromPath('./config.json');
var db = new AWS.DynamoDB();
app.get('/mac/:macid', function(req, res) {
    db.getItem({
        TableName: 'prod-ysniff',
        Key: {"MAC": {S: req.params.macid}}
    }, function(err, data) {
        if (err || !data.Item) {
            res.json([]);
        } else {
            var item = data.Item;
            var keys = Object.keys(item);
            var len = keys.length;
            var result = new Array(len -1);
            var j=0;
            for (var i = 0; i < len; i++) {
                if (keys[i] != 'MAC') {
                    var t = moment.unix(parseInt(keys[i]));
                    if (!t) {
                        res.json([]);
                        return;
                    }
                    var d = new Date(keys[i]);
                    result[j] = {loc: item[keys[i]].S, time: t.format("MMM D, h:mm A")}
                    j++;
                }
            }
            res.json(result);
        }
    })
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
