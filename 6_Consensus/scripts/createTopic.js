const {
    Client,
    TopicCreateTransaction,
    TopicMessageQuery,
    TopicMessageSubmitTransaction,
    Wallet,
    PrivateKey
} = require("@hashgraph/sdk");
const { sign } = require("crypto");
require("dotenv").config();

async function main() {
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;
    const account1Id = process.env.ACCOUNT_1_ID;
    const account1PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PRIVATE_KEY);

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    const adminUser = new Wallet(account1Id, account1PrivateKey);

    const createTopicTransaction = new TopicCreateTransaction()
        .setAdminKey(adminUser.publicKey)
        .setMaxTransactionFee(100000000)
        .freezeWith(client);

    const signTopicCreation = await createTopicTransaction.sign(account1PrivateKey);
    const executeTopicCreation = await signTopicCreation.execute(client);

    let receipt = await executeTopicCreation.getReceipt(client);
    let topicId = receipt.topicId;
    console.log(`Your topic ID is: ${topicId}`);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    new TopicMessageQuery()
        .setTopicId(topicId)
        .subscribe(client, null, (message) => {
    let messageAsString = Buffer.from(message.contents, "utf8").toString();
    console.log(
      `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
    );
  });

    const message = `This is the date I finished the exam: ${new Date().toString()}`;

    const submitMessageTransaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message)
        .setMaxTransactionFee(100000000)
        .freezeWith(client);

    const submitMessageTopicCreation = await submitMessageTransaction.sign(account1PrivateKey);
    const executeSubmitMessageTopic = await submitMessageTopicCreation.execute(client);

    console.log(`Transaction ID: ${executeSubmitMessageTopic.transactionId}`);
    const receiptForMessage = await executeSubmitMessageTopic.getReceipt(client);
    console.log('Updating the topic:', receiptForMessage.status.toString());
}

main();
