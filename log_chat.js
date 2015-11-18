var fs = require('fs');
var pg = require('pg');
var aws = require('aws-sdk');
var telegramBot = require('node-telegram-bot-api');
var bot = new telegramBot(process.env.TGTOKEN, {polling: true});
var lambda = new aws.Lambda();

var credentials = JSON.parse(fs.readFileSync('./config.json'));


exports.handler = function(event, context) {
  var text = event.message.text;
  if(text.substring(0,6) === "/duery") { 
   var query = text.substring(7);
   var params = {
    FunctionName: "queryRDS",
    Payload:JSON.stringify(query)
   };
   console.log(params);
   lambda.invoke(params, function(err, data) {
    if(err) {
      context.fail(err);
    }
    bot.sendMessage(event.message.chat.id, data.Payload).then(function() {
      context.succeed("id" + event.message.chat.id + " payload: " + data.Payload);
    });
   });
  } else {
  pg.connect(credentials, function(err, client, done) {
      if(err) { context.fail(err); } 
      var payload = event;
      var queryString = "INSERT INTO logs (time, author, channel_id, channel_name, text) VALUES (now(), $1, $2, $3, $4)";
      var queryParams = [payload.message.from.username, payload.message.chat.id, payload.message.chat.title, payload.message.text];   
      client.query(queryString, queryParams, function(err, result) {
        if(err) { context.fail(err)};
        pg.end();
        context.succeed(result);
      });
  });
  }
};

