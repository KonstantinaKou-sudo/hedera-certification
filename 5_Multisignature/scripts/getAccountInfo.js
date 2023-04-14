
const {
    Client,
    PrivateKey,
    Hbar,
    AccountBalanceQuery
} = require("@hashgraph/sdk");
require('dotenv').config();

const myAccountId = process.env.MY_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const account1Id = process.env.ACCOUNT_1_ID;
const account2Id = process.env.ACCOUNT_2_ID;

if (myAccountId == null ||
    myPrivateKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);
client.setDefaultMaxTransactionFee(new Hbar(10));

async function main () {
    const query1 = new AccountBalanceQuery()
        .setAccountId(account1Id);

   const account1Balance = await query1.execute(client);

   if (account1Balance) {
       console.log(`The account balance for account ${account1Id} is ${account1Balance.hbars} HBar`);
   }

   const query2 = new AccountBalanceQuery()
        .setAccountId(account2Id);

    const accountBalance2 = await query2.execute(client);

    if (accountBalance2) {
        console.log(`The account balance for account ${account2Id} is ${accountBalance2.hbars} HBar`);
    }

    process.exit();
}

main();