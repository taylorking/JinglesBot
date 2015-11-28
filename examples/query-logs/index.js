var fs = require('fs');
var pg = require('pg');
var bot = require('./echoToChat.js');

var credentials = JSON.parse(fs.readFileSync('./config.json'));
exports.handler = function(event, context) {
  var query = event.message.text.substring(7);

  pg.connect(credentials, function(err, client, done) {
    if(err) { context.fail(err); }
    client.query(query, function(err, result) {
      if(err) { context.fail(err); } 
      var val = [];
      result.rows.forEach(function(row) {
        val.push(row);
      });
      bot.sendMessage(event.message.chat.id,JSON.stringify(val), function() {      
        pg.end();      
        context.succeed(val);
      });
    });
  });
};

