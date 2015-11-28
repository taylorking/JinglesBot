var request = require('request');
var bot = require('./echoToChat.js');

exports.handler = function(event, context) {
  request("https://btc-e.com/api/3/ticker/ltc_usd", function(error, response) {
    response.body = JSON.parse(response.body);
    bot.sendMessage(event.message.chat.id, "LTC Price is: $" + response.body.ltc_usd.avg, function() {
      context.succeed();
    });
  });
};

