const {
    Client,
    PrivateKey,
    TokenCreateTransaction,
    TokenAssociateTransaction,
    TransferTransaction,
    Wallet,
    TokenType,
    TokenSupplyType,
    TokenGrantKycTransaction
  } = require('@hashgraph/sdk');
require('dotenv').config();

async function main() {
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;
    const account2Id = process.env.ACCOUNT_2_ID;
    const account3Id = process.env.ACCOUNT_3_ID;
    const account2PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_2_PRIVATE_KEY);
    const account3PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_3_PRIVATE_KEY);

    if (myAccountId == null ||
        myPrivateKey == null ) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    const createFungibleTokenTransaction = new TokenCreateTransaction()
      .setTokenName("My new token with KYC flag")
      .setTokenSymbol("KKBDAY")
      .setTokenType(TokenType.FungibleCommon)
      .setInitialSupply(1000.00)
      .setMaxSupply(1000.00)
      .setTreasuryAccountId(account2Id)
      .setSupplyType(TokenSupplyType.Finite)
      .setDecimals(2)
      .setKycKey(account2PrivateKey)
      .freezeWith(client);

    const tokenCreateSign = await createFungibleTokenTransaction.sign(account2PrivateKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateReceipt.tokenId;
  
    console.log('Token created with ID:', tokenId.toString());

    const account3TokenAssociateTransaction = new TokenAssociateTransaction()
      .setAccountId(account3Id)
      .setTokenIds([tokenId])
      .freezeWith(client);

    const tokenAssociation3Sign = await account3TokenAssociateTransaction.sign(account3PrivateKey);
    const executed3Txn = await tokenAssociation3Sign.execute(client);
    const receiptForAssociation3 = await executed3Txn.getReceipt(client);
    console.log('Token associated with account 3:', receiptForAssociation3.status.toString());

    //Transfer tokens from Account 2 to Account 3
    try {
      const tokenTransferTransaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, account2Id, -12.99)
        .addTokenTransfer(tokenId, account3Id, 12.99)
        .freezeWith(client)
        .sign(account2PrivateKey);

      const tokenTransferExecuted = await tokenTransferTransaction.execute(client);
      const tokenTransferReceipt = await tokenTransferExecuted.getReceipt(client);
      console.log('Transfer token to account 3:', tokenTransferReceipt.status.toString());
    } catch (error) {
      console.log('Error while transferring token', error);
    }

    //Enable KYC flag on account
    const transaction = await new TokenGrantKycTransaction()
        .setTokenId(tokenId)
        .setAccountId(account3Id)
        .freezeWith(client)
        .sign(account2PrivateKey);

    const transactionId = await transaction.execute(client);
    const getReceipt = await transactionId.getReceipt(client);
    const transactionStatus = getReceipt.status;

    console.log('KYC flag granted to Account 3:' +transactionStatus.toString());

    //Retry transfer tokens from Account 2 to Account 3
      const tokenTransferRetryTransaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, account2Id, -12.99)
        .addTokenTransfer(tokenId, account3Id, 12.99)
        .freezeWith(client)
        .sign(account2PrivateKey);
  
      const tokenTransferRetryExecuted = await tokenTransferRetryTransaction.execute(client);
      const tokenTransferRetryReceipt = await tokenTransferRetryExecuted.getReceipt(client);
      console.log('Transfer token to account 3 retry:', tokenTransferRetryReceipt.status.toString());

    process.exit();
}

main();

