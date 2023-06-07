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

export default {
  searchTokenByString,
};
