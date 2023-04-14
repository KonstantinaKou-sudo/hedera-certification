const {
    Client,
    ContractFunctionParameters,
    ContractExecuteTransaction,
    PrivateKey
} = require("@hashgraph/sdk");
require('dotenv').config();

async function main() {
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
    const contractId = process.env.CONTRACT_ID;
    const account1PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_1_PRIVATE_KEY);

    if (myAccountId == null ||
        myPrivateKey == null) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    const contractExecTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("function1", new ContractFunctionParameters().addUint16(5).addUint16(6))
        .freezeWith(client)
        .sign(account1PrivateKey);

    const submitExecTx = await contractExecTx.execute(client);
    const receipt = await submitExecTx.getReceipt(client);
    console.log("The transaction status is " + receipt.status.toString());

    const record = await submitExecTx.getRecord(client);
    const response = Buffer.from((record).contractFunctionResult.bytes).toJSON().data.at(-1);
    console.log('The output of the function 1 is:', response);

    process.exit();
}
  

main();


