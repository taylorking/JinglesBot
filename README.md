# Telegram 
Coming Soon™

### What this is
This is a port of @jonjonsonjrs fyb telegram bot. This version runs on AWS Lambda with AWS API Gateway, and the database runs on RDS.

### Motivation 
I wanted to make Jon's code run efficiently with aws lambda rather than requiring an entire VM to run.

### Design
Inbound

```
Telegram --[webhook]--> AWS API Gateway --[lambda]--> Dispatch Lambda function
```

Outbound

``` 
Dispatch Lambda Funciton --[lambda]--> Child command function --[bot api]-->Telegram
```

The bot will allow a user to hotplug modules into the bot. Drop a text file into funcregistry, named the arn you want to call formatted:

```json
{
	match: "the regex we want to match"
}
```

On the next call to dispatch, the dispatch table will be rebuilt, dispatch will try to match the regex of each message and call the function.

