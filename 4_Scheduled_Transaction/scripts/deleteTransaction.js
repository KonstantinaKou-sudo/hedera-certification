const {
    Client,
    ScheduleDeleteTransaction,
    PrivateKey,
    Wallet,
    ScheduleInfoQuery
} = require("@hashgraph/sdk");
require('dotenv').config();

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const account1Id = process.env.ACCOUNT_1_ID;
const scheduleId = process.env.SCHEDULE_ID;
const account1PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PRIVATE_KEY);

const adminUser = new Wallet(account1Id, account1PrivateKey);

if (myAccountId == null ||
    myPrivateKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

async function main() {
    const transaction = await new ScheduleDeleteTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(myPrivateKey);

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    console.log('Deleting scheduled transaction:', receipt.status.toString());

    //Get the schedule info to verify the schedule was deleted
    const queryScheduleTransaction = await new ScheduleInfoQuery()
        .setScheduleId(scheduleId)
        .execute(client);

    console.log('Query info about the scheduled transaction:', queryScheduleTransaction);

    process.exit();
}

main();