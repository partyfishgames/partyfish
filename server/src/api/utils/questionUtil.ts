import { DynamoDBClient, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: "us-east-1" });

export async function newQuestion() {
    const table = "PartyFishTrivalry";
    let random_category = Math.floor(Math.random() * 15);
    const catList = ['Movies', 'Tech', 'Entertainment', 'Educational', 'Science', 'Sports', 'Geography', 'Art & Design', 'TV', 'History', 'Nature', 'Business', 'Food & Drink', 'Games', 'Literature', 'Music'];

    // Category types are Movies, Tech, Entertainment, Educational, Science, Sports, Geography, Music
    let category = catList[random_category];
    const params : QueryCommandInput = {
        TableName: table,
        KeyConditionExpression: "#q = :qqq",
        ExpressionAttributeNames: {
            "#q": "Category"
        },
        ExpressionAttributeValues: {
            ":qqq": {'S': category}
        }
    };
    var questionList = [];
    var questionReturn = [];
    var question = [];

    try {
        const data = await client.send(new QueryCommand(params));
        // const data = await client.query(params).promise()
        console.log("Success");
        // console.log(data);

        data.Items.forEach(function (item) {
            questionList.push(item);
        });
        var random_index = Math.floor(Math.random() * (questionList.length - 1));
        const diff = random_index % 3;
        random_index = random_index - diff;
        questionReturn.push(questionList[random_index]);
        question[0] = questionList[random_index].questionText['S'];
        if (questionList[random_index].isCorrect['S'] == 'TRUE') {
            question[4] = '1';
        }
        question[1] = questionList[random_index].answerText['S'];
        questionReturn.push(questionList[random_index + 1]);
        if (questionList[random_index + 1].isCorrect['S'] == 'TRUE') {
            question[4] = '2';
        }
        question[2] = questionList[random_index + 1].answerText['S'];
        questionReturn.push(questionList[random_index + 2]);
        if (questionList[random_index + 2].isCorrect['S'] == 'TRUE') {
            question[4] = '3';
        }
        question[3] = questionList[random_index + 2].answerText['S'];

        console.log(question);
        return question;

    } catch (err) {
        console.log("Failure: ", err.message);
        return ['None'];
    }
}
