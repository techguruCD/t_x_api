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

export default {
  searchTokenByString,
  searchPairsByCurrency,
};
