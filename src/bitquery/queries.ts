function searchTokenByString(params: {
  network: 'ethereum' | 'bsc';
  string: string;
  limit: number;
  offset: number;
}) {
  const query = `{
  search(network: ${params.network}, string: "${params.string}", limit: ${params.limit}, offset: ${params.offset}) {
    network {
      network
    }
    subject {
      __typename
      ... on Address {
        address
      }
      ... on Currency {
        address
        name
        symbol
        tokenType
        decimals
      }
      ... on SmartContract {
        address
      }
    }
  }
}
`;
  return query;
}

function searchPairsByCurrency(params: {
  network: 'ethereum' | 'bsc';
  currency: string;
  limit: number;
  offset: number;
}) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  const since = `${year}-${month}-${day}T00:00:00Z`;
  const till = `${year}-${month}-${day}T23:59:59Z`;

  const query = `{
  ethereum(network: ${params.network}) {
    dexTrades(
      any: [{baseCurrency: {is: "${params.currency}"}}, {quoteCurrency: {is: "${params.currency}"}}]
      options: {desc: "block.timestamp.iso8601", limit: ${params.limit}, offset: ${params.offset}, limitBy: {each: "smartContract.address.address", limit: 1}}
      date: {since: "${since}", till: "${till}"}
    ) {
      smartContract {
        address {
          address
        }
      }
      quotePrice
      trades: count
      baseCurrency {
        address
        name
        symbol
        decimals
        tokenType
      }
      quoteCurrency {
        address
        name
        symbol
        decimals
        tokenType
      }
      block {
        timestamp {
          iso8601
        }
      }
    }
  }
}
`;

  return query;
}

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

function searchTokenPriceInUSD(params: {
  network: 'ethereum' | 'bsc';
  address: string;
}) {
  let quoteCurrency = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH

  if (params.network === 'bsc') {
    quoteCurrency = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'; // WBNB
  }

  const query = `
  {
    ethereum(network: ${params.network}) {
      dexTrades(
        baseCurrency: {is: "${params.address}"}
        quoteCurrency: {is: "${quoteCurrency}"}
        options: {desc: ["block.height", "transaction.index"], limit: 1}
      ) {
        block {
          height
          timestamp {
            time(format: "%Y-%m-%d %H:%M:%S")
          }
        }
        transaction {
          index
        }
        baseCurrency {
          symbol
          address
        }
        baseAmount
        quoteAmount
        quoteAmountInUSD: quoteAmount(in:USD)
        priceInUSD: expression(get: "quoteAmountInUSD / baseAmount")
        quoteCurrency {
          symbol
          address
        }
        quotePrice
      }
    }
  }
  `;
  return query;
}

function searchPairByAddress(params: {
  network: 'ethereum' | 'bsc';
  address: string;
}) {
  const query = `{
    EVM(network: ${params.network}, dataset: combined) {
      DEXTrades(
        limit: {count: 1}
        where: {Trade: {Dex: {SmartContract: {is: "${params.address}"}}}}
      ) {
        Trade {
          Sell {
            Currency {
              Symbol
              Name
              SmartContract
            }
            Price
          }
          Buy {
            Currency {
              Symbol
              Name
              SmartContract
            }
            Price
          }
        }
      }
    }
  }

  `;

  return query;
}

export default {
  searchTokenByString,
  searchPairsByCurrency,
  priceSubscription,
  searchTokenPriceInUSD,
  searchPairByAddress,
};
