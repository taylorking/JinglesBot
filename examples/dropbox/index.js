var bot = require('./echoToChat.js');

exports.handler = function(event, context) {
  console.log(event);
  bot.sendMessage("-11465936", "Anonymous Memer: " + event.message, function() {
    context.succeed();
  });
};
