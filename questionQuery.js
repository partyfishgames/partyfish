var AWS = require("aws-sdk");

AWS.config.update({
region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "PartyFishTrivalry";


let random_cat = Math.floor(Math.random() * 8);
var catList = ['Movies', 'Tech', 'Entertainment', 'Educational', 'Science', 'Sports', 'Geography', 'Music'];


// Category types are Movies, Tech, Entertainment, Educational, Science, Sports, Geography, Music
var category = catList[random_cat]

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
var questionList = [];
var questionReturn = [];
var question = [];
docClient.query(params, function(err, data) {
	if (err) {
		console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
	} else {
		console.log("Query succeeded.");
		data.Items.forEach(function(item) {
			// console.log(item);
			questionList.push(item);
		});
		// console.log(questionList);
		var random_index = Math.floor(Math.random() * questionList.length);
		const diff  = random_index % 3;
		random_index = random_index - diff;
		questionReturn.push(questionList[random_index]);
		question[0] = questionList[random_index].questionText;
		if(questionList[random_index].isCorrect == 'TRUE'){
			question[4] = 1;
		}
		question[1] = questionList[random_index].answerText;
		questionReturn.push(questionList[random_index+1]);
		if(questionList[random_index+1].isCorrect == 'TRUE'){
			question[4] = 2;
		}
		question[2] = questionList[random_index+1].answerText;
		questionReturn.push(questionList[random_index+2]);
		if(questionList[random_index+2].isCorrect == 'TRUE'){
			question[4] = 2;
		}
		question[3] = questionList[random_index+2].answerText;
		console.log(questionReturn);
		console.log(question);
	}
});
