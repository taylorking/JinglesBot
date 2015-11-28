var pg = require('pg');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json'));
exports.handler = function(event, context) {
  pg.connect(config, function(err, client, done) {
    var query = "INSERT INTO logs (time, author, channel_id, channel_name, text) VALUES (now(), $1, $2, $3, $4)";
    var params = [event.message.from.username, event.message.chat.id, event.message.chat.title, event.message.text];
    client.query(query, params, function(err, result) {
      if(err) {
        done();
        context.fail(err);
        return;
      }
      done();
      context.succeed();
    });
  });
}

