const {
    Client,
    ContractCreateFlow,
    PrivateKey,
    Wallet
    } = require("@hashgraph/sdk");
require('dotenv').config();
const fs = require('fs');

async function main() {
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const account1Id = process.env.ACCOUNT_1_ID;
    const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
    const account1PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PRIVATE_KEY);

    if (myAccountId == null ||
        myPrivateKey == null ) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    const adminUser = new Wallet (
        account1Id,
        account1PrivateKey
    );

    const bytecode = fs.readFileSync("CertificationC1.bin");

    const contractCreate = await new ContractCreateFlow()
        .setGas(100000)
        .setBytecode(bytecode)
        .setAdminKey(adminUser.publicKey)
        .sign(account1PrivateKey);

    //Sign the transaction with the client operator key and submit to a Hedera network
    const txResponse = contractCreate.execute(client);

    //Get the receipt of the transaction
    const receipt = (await txResponse).getReceipt(client);

    //Get the new contract ID
    const newContractId = (await receipt).contractId;
            
    console.log("The new contract ID is " +newContractId);

    process.exit();
}

main();