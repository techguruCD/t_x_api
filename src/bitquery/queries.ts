function searchTokenByString(params: {
  network: 'ethereum' | 'bsc';
  string: string;
}) {
  const query = `
    search(network: ${params.network}, string: ${params.string}) {
        network {
            network
        }
        subject {
            __typename
            ... on Address {
                annotation
                address
            }
            ... on Currency {
                address
                name
                symbol
                tokenType
                decimals
                tokenId
            }
            ... on SmartContract {
                annotation
                protocol
                address
                contractType
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
