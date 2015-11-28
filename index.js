// construct a map of where we
// are going to send commands for various ARN's 


var fs = require('fs');
var aws = require('aws-sdk');
var awsregion = 'us-west-2';
var lambda = new aws.Lambda({region: awsregion});
var rexList = {};
var funcDir = 'funcregistry/';
var toSearch = [];
var needsInvoke = [], invoking = false;
var returnData = {};

function queueForFile(event, fileName) {
  var file = rexList[fileName];
  file.forEach(function(rex) {
    var path = rex.on.split('.');
    var marker = event;
    for( var inPath; inPath = path.shift();) {
      if(path.length < 1) {
        if(marker[inPath].match(rex.match)) {
          needsInvoke.push({FunctionName:fileName, Payload:JSON.stringify(event)});
        }
        return;
      }
      if(marker[inPath] === undefined) {
        return;
      }
      marker = marker[inPath];
    }
  });
}

function updateFunctionTable(callback) {
  fs.readdirSync(funcDir).forEach(function(fileName) {
    JSON.parse(fs.readFileSync(funcDir + fileName)).forEach(function(data) {  
      if(rexList[fileName] === undefined) {
        rexList[fileName] = [data];
      } else {
        rexList[fileName].push(data);
      }
    });
  });
  callback();
}
exports.handler = function(event, context) { 
  console.log("test");
  updateFunctionTable(function() {
    console.log(JSON.stringify(rexList));
    for(var fileName in rexList) {
      queueForFile(event, fileName);    
    }
    if(!invoking) {
      lambdaInvoke(function() {
        context.succeed(returnData);
      });
    }
  });
};
function lambdaInvoke(callback) {
  console.log(needsInvoke);
  if(needsInvoke.length < 1) {
    invoking = false;
    callback();
    return;
  }
  var invokeParams = needsInvoke.shift();
  invoking = true;
  lambda.invoke(invokeParams, function(err, data) {
    if(err) { 
      // One of the lambda functions failed. We're gonna use that object
      returnData[invokeParams.FunctionName] = err;
      lambdaInvoke(callback);
      return;
    }
    returnData[invokeParams.FunctionName] = data;
    lambdaInvoke(callback);
  });
}

