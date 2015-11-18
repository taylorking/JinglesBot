// construct a map of where we
// are going to send commands for various ARN's 
var fs = require('fs');
var crypto = require('crypto');
var aws = require('aws-sdk');
var awsregion = 'us-west-2';
var lambda = new aws.Lambda({region: awsregion});
var knownFiles = JSON.parse(fs.readFileSync("knownfiles.json"));
var funcDir = 'funcregistry/';
var toHash = [], isHashing = false;
var sampleEvent = JSON.parse(fs.readFileSync("sampleEvent.json"));
var needsInvoke = [], invoking = false;
var returnData = {};

function updateFunctionTable(callback) {
  fs.readdirSync(funcDir).forEach(function(fileName) {
    toHash.push(fileName);
    if(!isHashing) {
      startHashing(callback);
    }
  });
}
exports.handler = function(event, context) { 
  updateFunctionTable(function() {
    for(var func in knownFiles) {
      if(event.message.text.match(knownFiles[func].matches)) {
        var params = {
          FunctionName: func,
          Payload: JSON.stringify(event) 
        };
        if(!invoking) {
          lambdaInvoke(function() {
            context.succeed(returnData);
          });
        }
      }
    }
  });
};
function lambdaInvoke(callback) {
  if(needsInvoke.length < 1) {
    isInvoking = false;
    callback();
    return;
  }
  var invokeParams = needsInvoke.shift();
  lambda.invoke(invokeParams, function(err, data) {
    if(err) { 
      // One of the lambda functions failed. We're gonna use that object
      returnData[invokeParams.FunctionName] = err;
      lambdaInvoke(callback);
      return;
    }
    returnData[invokeParams.FunctionName] = data;
    lambdaInvoke(callback);
    return;
  });
}
function startHashing(callback) {
  if(toHash.length < 1) {
    isHashing = false;
    return;
  } 
  isHashing = true;
  hashFile(toHash.shift(), callback);
  startHashing(callback);
}
function hashFile(fileName, callback) {
  var fd = fs.createReadStream(funcDir + fileName);
  var hash = crypto.createHash('sha1');
  hash.setEncoding('hex');
  fd.on('end', function() {
    hash.end();
    hashComplete(fileName, hash.read(), callback);
  });
  fd.pipe(hash);
}

function hashComplete(fileName, fileHash, callback) {
  console.log("hashComplete: " + fileName + " , " + fileHash);
  if(knownFiles[fileName] === undefined || knownFiles[fileName].hash !== fileHash) {
    var contents = JSON.parse(fs.readFileSync(funcDir + fileName));
    console.log(contents);
    knownFiles[fileName] = { hash: fileHash, matches: contents.match }; 
  }
  if(!isHashing) {
    fs.writeFileSync('knownfiles.json', JSON.stringify(knownFiles));
    callback();
  }
}
