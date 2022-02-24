
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "PartyFishTrivalry";

// Category types are Movies, Tech, Entertainment, Educational, Science, Sports, Geography, Music
var category = "Educational"

var params = {
    TableName: table,
    KeyConditionExpression: "#q = :qqq",
    ExpressionAttributeNames:{
        "#q": "Category"
    },
    ExpressionAttributeValues: {
        ":qqq": category
    }
};

docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.forEach(function(item) {
            console.log(item);
        });
    }
});