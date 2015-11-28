var aws = require('aws-sdk');
var awsregion = 'us-west-2';
var lambda = new aws.Lambda({region: awsregion});
var writeArn = "arn:aws:lambda:us-west-2:526511941461:function:writeToChat";
module.filename = "echoToChat.js";
module.id = "echoToChat";
module.exports.sendMessage = function (chatdest, mbody, callback) {
  var params = {destination: chatdest, content:mbody, type: "message"};
  params = JSON.stringify(params);
  lambda.invoke({FunctionName: writeArn, Payload: params}, function() {
      callback();
  });
};

