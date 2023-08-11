function priceSubscription(params: {
  network: 'eth' | 'bsc';
  buyCurrency: string;
  sellCurrency: string;
}) {
  const query = `subscription {
  EVM(network: ${params.network}, trigger_on: all) {
    DEXTrades(
      limit: {count: 1}
      orderBy: {descending: Block_Number}
      where: {Trade: {Buy: {Currency: {SmartContract: {is: "${params.buyCurrency}"}}}, Sell: {Currency: {SmartContract: {is: "${params.sellCurrency}"}}}}}
    ) {
      Trade {
        Buy {
          Amount
          Price
          Currency {
            SmartContract
            Name
            Symbol
          }
        }
        Dex {
          ProtocolFamily
          SmartContract
        }
        Sell {
          Amount
          Price
          Currency {
            SmartContract
            Symbol
            Name
          }
        }
      }
    }
  }
}
`;

  return query;
}

export default {
  priceSubscription,
};
