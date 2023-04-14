const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    PrivateKey,
    Wallet,
    Hbar,
    KeyList,
    TransactionId,
    ScheduleSignTransaction
} = require("@hashgraph/sdk");
require('dotenv').config();

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

const account1Id = process.env.ACCOUNT_1_ID;
const account2Id = process.env.ACCOUNT_2_ID;
const account3Id = process.env.ACCOUNT_3_ID;
const account1PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PRIVATE_KEY);
const account2PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_2_PRIVATE_KEY);
const account3PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_3_PRIVATE_KEY);

const adminUser = new Wallet(myAccountId, myPrivateKey);
const account1User = new Wallet(account1Id, account1PrivateKey);
const account2User = new Wallet(account2Id, account2PrivateKey);
const account3User = new Wallet(account3Id, account3PrivateKey);
const keyList = [account1User.publicKey, account2User.publicKey, account3User.publicKey]
if (myAccountId == null ||
    myPrivateKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

async function main() {
    const thresholdKey =  new KeyList(keyList, 1);

    //Create a transaction to add in the scheduled txn and sign with account1
    const transaction = new TransferTransaction()
        .addHbarTransfer(account1Id, Hbar.from(-12))
        .addHbarTransfer(account3Id, Hbar.from(12))
        .setAdminKey(thresholdKey);


    const scheduledTransaction = new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setAdminKey(adminUser.publicKey)
        .freezeWith(client);

    const signWithAccount1 = await scheduledTransaction.sign(myPrivateKey); 
    const txResponse = await signWithAccount1.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const scheduleId = receipt.scheduleId;
    const scheduledTxId = receipt.scheduledTransactionId;
    console.log('The schedule ID of the schedule transaction is:', scheduleId.toString());
    console.log('The schedule transaction ID of the schedule transaction is:', scheduledTxId.toString());

    //Sign scheduled txn with account 1
    const signByAccount1Transaction = await new ScheduleSignTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(account1PrivateKey);

    const txByAccount1Response = await signByAccount1Transaction.execute(client);
    const receiptAboutAccount1SingingResponse = await txByAccount1Response.getReceipt(client);
    const transaction1Status = receiptAboutAccount1SingingResponse.status;
    console.log('Account 1 signing the scheduled transaction:', transaction1Status);

    //Verify that the transaction has not been executed
    //Get the scheduled transaction record
    const scheduledTxRecord = await transaction.getRecord(client);
    console.log("The scheduled transaction record after account 1 signing, is: " +scheduledTxRecord);

    //Sign scheduled txn with account 2
    const signByAccount2Transaction = await new ScheduleSignTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(account2PrivateKey);

    const txByAccount2Response = await signByAccount2Transaction.execute(client);
    const receiptAboutAccount2SingingResponse = await txByAccount2Response.getReceipt(client);
    const transactionStatus = receiptAboutAccount2SingingResponse.status;

    console.log('Account 2 signing the scheduled transaction:', transactionStatus);

    //Verify that the transaction has been executed

    const scheduledTxAfterThresholdRecord = await transaction.getRecord(client);
    console.log("The scheduled transaction record after account 2 signing, is: " +scheduledTxAfterThresholdRecord);

    process.exit();
}

main();
