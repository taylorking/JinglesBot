var fs = require('fs');
var pg = require('pg');
var credentials = JSON.parse(fs.readFileSync('./config.json'));
exports.handler = function(event, context) {
  pg.connect(credentials, function(err, client, done) {
    if(err) { context.fail(err); }
    client.query(event, function(err, result) {
      if(err) { context.fail(err); } 
      var val = [];
      result.rows.forEach(function(row) {
        val.push(row);
      });
      pg.end();      
      context.succeed(val);
    });
  });
};

