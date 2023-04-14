const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    Hbar
  } = require('@hashgraph/sdk');
require('dotenv').config();
require('dotenv').config();

async function main() {
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (myAccountId == null ||
        myPrivateKey == null ) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    for (let i = 0; i < 5; i++) {
        const accountPrivateKey = PrivateKey.generateED25519();
        const accountPublicKey = accountPrivateKey.publicKey;
        const newAccount = await new AccountCreateTransaction()
        .setKey(accountPublicKey)
        .setInitialBalance(Hbar.from(1000))
        .execute(client);
    
        const accountTxnReceipt = await newAccount.getReceipt(client);
        const accountId = accountTxnReceipt.accountId;

        console.log(`Account ${i+1}:`);
        console.log(` ~~~~ Private key for account ${i+1}:`, accountPrivateKey.toStringRaw());
        console.log(` ~~~~ Public key for account ${i+1}:`, accountPublicKey.toStringRaw());
        console.log(` ~~~~ Account ID for account ${i+1}`, accountId.toString());
    }

    process.exit();
}

main();