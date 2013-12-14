
// Module dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var AWS = require('aws-sdk');
var app = express();

// AWS config
AWS.config.update({region: 'us-east-1'});
var db = new AWS.DynamoDB();
var fields = ['MAC', 'creepy', 'gov', 'others', 'warrant']

// middleware for all environments
app.use(require('connect-assets')());
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.bodyParser());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

// middleware for development
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  res.render('index', { title: 'Yalie Tracker' });
});

app.post('/questions/:macid', function(req, res) {
    db.updateItem({
        TableName: 'prod-ysniff',
        Key: {"MAC": {S: req.params.macid}},
        AttributeUpdates: {
            "creepy": {
                Value: {N: req.body.creepy},
                Action: "PUT"
            },
            "gov": {
                Value: {N: req.body.gov},
                Action: "PUT"
            },
            "others": {
                Value: {N: req.body.others},
                Action: "PUT"
            },
            "warrant": {
                Value: {N: req.body.warrant},
                Action: "PUT"
            }
        }
    }, function(err, data) {
        if (err || !data) {
            res.json(false);
        } else {
            res.json(true);
        }
    });
})

app.get('/mac/:macid', function(req, res) {
    db.getItem({
        TableName: 'prod-ysniff',
        Key: {"MAC": {S: req.params.macid}}
    }, function(err, data) {
        if (err || !data.Item) {
            if (err) console.log(err);
            res.json([]);
        } else {
            var item = data.Item;
            var keys = Object.keys(item).sort();
            var len = keys.length;
            var result = new Array(Math.max(0,len - fields.length));
            var j=0;
            for (var i = 0; i < len; i++) {
                if (fields.indexOf(keys[i]) == -1) {
                    var d = new Date(keys[i]);
                    result[j] = {loc: item[keys[i]].S, time: keys[i]}
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
