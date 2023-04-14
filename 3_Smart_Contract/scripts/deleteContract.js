const {
    Client,
    ContractDeleteTransaction,
    PrivateKey
} = require("@hashgraph/sdk");
require('dotenv').config();

async function main() {
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
    const contractId = process.env.CONTRACT_ID;
    const account1Id = process.env.ACCOUNT_1_ID;
    const account1PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PRIVATE_KEY);

    if (myAccountId == null ||
        myPrivateKey == null) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    const transaction = new ContractDeleteTransaction()
        .setContractId(contractId)
        .setTransferAccountId(account1Id)
        .freezeWith(client);

    const signTx = await transaction.sign(account1PrivateKey)
    const txResponse = await signTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log('Deleting Certification C1 smart contract:', receipt.status.toString());

    process.exit();
}
  

main();