import { DynamoDBClient, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: "us-east-1" });

export async function newQuestion() {
    const table = "NewTriviaQs";
    
    var random_index = String(Math.floor(Math.random()*626));
    
    const params : QueryCommandInput = {
        TableName: table,
        KeyConditionExpression: "#q = :qqq",
        ExpressionAttributeNames: {
            "#q": "qNum"
        },
        ExpressionAttributeValues: {
            ":qqq": {'N': random_index}
        }
    };

    var question;

    try {
        const data = await client.send(new QueryCommand(params));
        // const data = await client.query(params).promise()
        console.log("Success");
        question = data.Items;
        question = [data.Items[0]['qText']['S'], data.Items[0]['ans1']['S'], data.Items[0]['ans2']['S'], data.Items[0]['ans3']['S'], Number(data.Items[0]['correct']['S']) + 1]

        console.log(question);
        return question;

    } catch (err) {
        console.log("Failure: ", err.message);
        return ['None'];
    }
}
