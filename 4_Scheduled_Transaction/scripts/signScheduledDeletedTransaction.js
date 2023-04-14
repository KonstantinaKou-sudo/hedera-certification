const {
    Client,
    PrivateKey,
    ScheduleSignTransaction
} = require("@hashgraph/sdk");
require('dotenv').config();

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const scheduleId = process.env.SCHEDULE_ID;
const account1PrivateKey = PrivateKey.fromString('5a2bc2c1b2b4966722fb1009e38487870bef2ccba0bdd5af02ae298970ccc092');

const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

async function main() {
    try {
        const transaction = await new ScheduleSignTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(account1PrivateKey);

        const txResponse = await transaction.execute(client);
        const receipt = await txResponse.getReceipt(client);
        const transactionStatus = receipt.status;

        console.log('Executing deleted schedule transaction:', transactionStatus);
    } catch (error) {
        console.log('Error while trying to execute deleted schedule transaction', error);
    }

    process.exit();
}
main();
