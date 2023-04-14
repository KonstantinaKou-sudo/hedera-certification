const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    PrivateKey,
    Wallet,
    ScheduleInfoQuery,
    Hbar
} = require("@hashgraph/sdk");
require('dotenv').config();

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const account1Id = process.env.ACCOUNT_1_ID;
const account2Id = process.env.ACCOUNT_2_ID;
const account1PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PRIVATE_KEY);

const adminUser = new Wallet(myAccountId, myPrivateKey);

if (myAccountId == null ||
    myPrivateKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

async function main() {
    const transaction = new TransferTransaction()
        .addHbarTransfer(account1Id, Hbar.from(-2))
        .addHbarTransfer(account2Id, Hbar.from(2));

    const scheduleTransaction = new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setAdminKey(adminUser.publicKey);

    const txResponse = await scheduleTransaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const scheduleId = receipt.scheduleId;
    console.log('The schedule ID of the schedule transaction is:', scheduleId.toString());

    //Get the schedule info to verify the schedule was triggered
    const queryScheduleTransaction = await new ScheduleInfoQuery()
        .setScheduleId(scheduleId)
        .execute(client);

    console.log('Query info about the scheduled transaction:', queryScheduleTransaction);

    process.exit();
}

main();
