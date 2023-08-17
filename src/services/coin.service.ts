import bqModel from '../models/bq.model';
import cgModel from '../models/cg.model';
import favCoinsModel from '../models/favCoins.model';

interface IUrlEntry {
  type: string;
  values: string[]
}

function parseUrl(urls: IUrlEntry[]) {
  return urls.map(url => {
    if (url.type === 'website') {
      const completeUrl = url.values.filter(id => id !== null && id !== '');
      return { type: "website", values: completeUrl };
    }
    if (url.type === 'twitter') {
      const completeUrl = url.values.filter(id => id !== null && id !== '').map(id => `https://twitter.com/${id}`);
      return { type: "twitter", values: completeUrl };
    }
    if (url.type === 'message_board') {
      const completeUrl = url.values.filter(id => id !== null && id !== '');
      return { type: "message_board", values: completeUrl };
    }
    if (url.type === 'chat') {
      const completeUrl = url.values.filter(id => id !== null && id !== '');
      return { type: "chat", values: completeUrl };
    }
    if (url.type === 'facebook') {
      const completeUrl = url.values.filter(id => id !== null && id !== '').map(id => `https://www.facebook.com/${id}`);
      return { type: "facebook", values: completeUrl };
    }
    if (url.type === 'explorer') {
      const completeUrl = url.values.filter(id => id !== null && id !== '');
      return { type: "explorer", values: completeUrl };
    }
    if (url.type === 'reddit') {
      const completeUrl = url.values.filter(id => id !== null && id !== '');
      return { type: "reddit", values: completeUrl };
    }
    if (url.type === 'technical_doc') {
      const completeUrl = url.values.filter(id => id !== null && id !== '');
      return { type: "technical_doc", values: completeUrl };
    }
    if (url.type === 'source_code') {
      const completeUrl = url.values.filter(id => id !== null && id !== '');
      return { type: "source_code", values: completeUrl };
    }
    if (url.type === 'announcement') {
      const completeUrl = url.values.filter(id => id !== null && id !== '');
      return { type: "announcement", values: completeUrl };
    }
    if (url.type === 'bitcointalk') {
      const completeUrl = url.values.filter(id => id !== null && id !== '').map(id => `https://bitcointalk.org/index.php?topic=${id}`);
      return { type: "bitcointalk", values: completeUrl };
    }
    if (url.type === "telegram") {
      const completeUrl = url.values.filter(id => id !== null && id !== '').map(id => `https://t.me/${id}`);
      return { type: "telegram", values: completeUrl };
    }
    return url;
  })
}

async function coinSearch(params: { searchTerm: string, skip?: number, limit?: number, network?: string }) {
  if (params.skip === undefined) {
    params.skip = 0
  }

  if (params.limit === undefined) {
    params.limit = 10;
  }

  let networkForBq = params.network
  let networkForCg = params.network;

  if (networkForCg === 'bsc') {
    networkForCg = 'binance-smart-chain'
  }

  if (networkForCg === 'celo_mainnet') {
    networkForCg = 'celo'
  }

  if (networkForCg === 'klaytn') {
    networkForCg = 'klay-token'
  }

  if (networkForCg === 'matic') {
    networkForCg = 'polygon-pos'
  }

  const regexSearch = { $regex: `^${params.searchTerm}$`, $options: "i" };

  const cgMatch: Record<string, any> = {
    $or: [
      { symbol: regexSearch },
      { name: regexSearch },
      { id: regexSearch },
      {"platforms.sui": regexSearch},
      {"platforms.kava": regexSearch},
      {"platforms.wanchain": regexSearch},
      {"platforms.zksync": regexSearch},
      {"platforms.syscoin": regexSearch},
      {"platforms.zilliqa": regexSearch},
      {"platforms.conflux": regexSearch},
      {"platforms.songbird": regexSearch},
      {"platforms.evmos": regexSearch},
      {"platforms.komodo": regexSearch},
      {"platforms.terra-2": regexSearch},
      {"platforms.bitkub-chain": regexSearch},
      {"platforms.step-network": regexSearch},
      {"platforms.bitcoin-cash": regexSearch},
      {"platforms.hydra": regexSearch},
      {"platforms.sora": regexSearch},
      {"platforms.polygon-pos": regexSearch},
      {"platforms.chiliz": regexSearch},
      {"platforms.kujira": regexSearch},
      {"platforms.terra": regexSearch},
      {"platforms.empire": regexSearch},
      {"platforms.everscale": regexSearch},
      {"platforms.polygon-zkevm": regexSearch},
      {"platforms.okex-chain": regexSearch},
      {"platforms.boba": regexSearch},
      {"platforms.meter": regexSearch},
      {"platforms.binancecoin": regexSearch},
      {"platforms.xdc-network": regexSearch},
      {"platforms.elastos": regexSearch},
      {"platforms.oasys": regexSearch},
      {"platforms.aptos": regexSearch},
      {"platforms.neo": regexSearch},
      {"platforms.linea": regexSearch},
      {"platforms.kucoin-community-chain": regexSearch},
      {"platforms.milkomeda-cardano": regexSearch},
      {"platforms.bitshares": regexSearch},
      {"platforms.tron": regexSearch},
      {"platforms.cube": regexSearch},
      {"platforms.pulsechain": regexSearch},
      {"platforms.energi": regexSearch},
      {"platforms.moonriver": regexSearch},
      {"platforms.Bitcichain": regexSearch},
      {"platforms.kusama": regexSearch},
      {"platforms.secret": regexSearch},
      {"platforms.base": regexSearch},
      {"platforms.dogechain": regexSearch},
      {"platforms.optimistic-ethereum": regexSearch},
      {"platforms.bitgert": regexSearch},
      {"platforms.aurora": regexSearch},
      {"platforms.binance-smart-chain": regexSearch},
      {"platforms.stellar": regexSearch},
      {"platforms.flare-network": regexSearch},
      {"platforms.cronos": regexSearch},
      {"platforms.tenet": regexSearch},
      {"platforms.ronin": regexSearch},
      {"platforms.osmosis": regexSearch},
      {"platforms.neon-evm": regexSearch},
      {"platforms.stacks": regexSearch},
      {"platforms.sx-network": regexSearch},
      {"platforms.hedera-hashgraph": regexSearch},
      {"platforms.the-open-network": regexSearch},
      {"platforms.mantle": regexSearch},
      {"platforms.defi-kingdoms-blockchain": regexSearch},
      {"platforms.klay-token": regexSearch},
      {"platforms.velas": regexSearch},
      {"platforms.rootstock": regexSearch},
      {"platforms.near-protocol": regexSearch},
      {"platforms.core": regexSearch},
      {"platforms.godwoken": regexSearch},
      {"platforms.celer-network": regexSearch},
      {"platforms.iotex": regexSearch},
      {"platforms.polkadot": regexSearch},
      {"platforms.tomochain": regexSearch},
      {"platforms.factom": regexSearch},
      {"platforms.nuls": regexSearch},
      {"platforms.fantom": regexSearch},
      {"platforms.thundercore": regexSearch},
      {"platforms.trustless-computer": regexSearch},
      {"platforms.ethereumpow": regexSearch},
      {"platforms.karura": regexSearch},
      {"platforms.ontology": regexSearch},
      {"platforms.telos": regexSearch},
      {"platforms.tezos": regexSearch},
      {"platforms.harmony-shard-0": regexSearch},
      {"platforms.canto": regexSearch},
      {"platforms.moonbeam": regexSearch},
      {"platforms.thorchain": regexSearch},
      {"platforms.qtum": regexSearch},
      {"platforms.theta": regexSearch},
      {"platforms.eos-evm": regexSearch},
      {"platforms.metis-andromeda": regexSearch},
      {"platforms.findora": regexSearch},
      {"platforms.onus": regexSearch},
      {"platforms.function-x": regexSearch},
      {"platforms.ordinals": regexSearch},
      {"platforms.ardor": regexSearch},
      {"platforms.huobi-token": regexSearch},
      {"platforms.algorand": regexSearch},
      {"platforms.icon": regexSearch},
      {"platforms.eos": regexSearch},
      {"platforms.coinex-smart-chain": regexSearch},
      {"platforms.arbitrum-one": regexSearch},
      {"platforms.cosmos": regexSearch},
      {"platforms.shiden network": regexSearch},
      {"platforms.proof-of-memes": regexSearch},
      {"platforms.bittorrent": regexSearch},
      {"platforms.ethereum-classic": regexSearch},
      {"platforms.gochain": regexSearch},
      {"platforms.stratis": regexSearch},
      {"platforms.cardano": regexSearch},
      {"platforms.callisto": regexSearch},
      {"platforms.waves": regexSearch},
      {"platforms.exosama": regexSearch},
      {"platforms.astar": regexSearch},
      {"platforms.mixin-network": regexSearch},
      {"platforms.hoo": regexSearch},
      {"platforms.elrond": regexSearch},
      {"platforms.wemix-network": regexSearch},
      {"platforms.avalanche": regexSearch},
      {"platforms.kardiachain": regexSearch},
      {"platforms.vite": regexSearch},
      {"platforms.nem": regexSearch},
      {"platforms.xrp": regexSearch},
      {"platforms.solana": regexSearch},
      {"platforms.smartbch": regexSearch},
      {"platforms.ethereum": regexSearch},
      {"platforms.fuse": regexSearch},
      {"platforms.fusion-network": regexSearch},
      {"platforms.skale": regexSearch},
      {"platforms.xdai": regexSearch},
      {"platforms.vechain": regexSearch},
      {"platforms.omni": regexSearch},
      {"platforms.oasis": regexSearch},
      {"platforms.tombchain": regexSearch},
      {"platforms.rollux": regexSearch},
      {"platforms.arbitrum-nova": regexSearch},
      {"platforms.celo": regexSearch},
    ]
  };
  const bqMatch: Record<string, any> = {
    $or: [
      { address: regexSearch },
      { symbol: regexSearch },
      { name: regexSearch },
      { tokenId: regexSearch },
      { tokenType: regexSearch }
    ]
  }
  const bqPairMatch: Record<string, any> = {
    $or: [
      { "buyCurrency.address": regexSearch },
      { "buyCurrency.name": regexSearch },
      { "buyCurrency.symbol": regexSearch },
      { "smartContract.address.address": regexSearch },
      { "smartContract.currency.name": regexSearch },
      { "smartContract.currency.symbol": regexSearch },
      { "smartContract.currency.tokenType": regexSearch },
      { "exchange.address.address": regexSearch },
      { "exchange.fullName": regexSearch },
      { "exchange.fullNameWithId": regexSearch },
    ],
  }

  if (networkForCg) {
    cgMatch[`platforms.${networkForCg}`] = { $exists: true };
  }

  if (networkForBq) {
    bqMatch['network'] = networkForBq;
    bqPairMatch['network'] = networkForBq;
  }

  const results = await cgModel.CGCoinInfoModel.aggregate([
    { $match: cgMatch },
    {
      $project: {
        id: 1,
        market_cap_rank: 1,
        name: 1,
        logo: "$image",
        price: "$current_price",
        change: { $round: ["$price_change_percentage_24h", 4] },
        platform: "cg",
        type: "token",
        network: null,
        contracts: "$platforms"
      },
    },
  ]).unionWith({
    coll: 'BQPair',
    pipeline: [
      {
        $group: {
          _id: "$buyCurrency.address",
          id: { $first: "$buyCurrency.address" },
          name: { $first: "$buyCurrency.name" },
          logo: { $first: null },
          price: { $first: { $toDouble: "$buyCurrencyPrice" } },
          change: { $first: null },
          platform: { $first: "DEX" },
          address: { $first: "$buyCurrency.address" },
          decimals: { $first: "$buyCurrency.decimals" },
          symbol: { $first: "$buyCurrency.symbol" },
          tokenId: { $first: "$buyCurrency.tokenId" },
          tokenType: { $first: "$buyCurrency.tokenType" },
          network: { $first: "$network" },
          type: { $first: "token" },
        },
      },
      { $match: bqMatch },
    ]
  }).unionWith({
    coll: 'BQPair',
    pipeline: [
      { $match: bqPairMatch },
      { $sort: { tradeAmount: -1 } },
      {
        $project: {
          _id: 0,
          id: "$smartContract.address.address",
          name: { $concat: [ "$buyCurrency.symbol", "/", "$sellCurrency.symbol" ] },
          logo: null,
          price: {
            $toDouble: "$buyCurrencyPrice"
          },
          change: null,
          platform: "DEX",
          updatedAt: "$updatedAt",
          network: "$network",
          type: "pair",
          exchange: "$exchange.fullName",
        },
      },
    ]
  }).skip(params.skip).limit(params.limit);

  const contractsSet = new Set();

  results.forEach(result => {
    const contracts = result.contracts
    
    if (contracts) {
      Object.values(contracts).forEach(contract => {
        contractsSet.add(contract)
      })
    }
  });

  const filteredResults = results.filter(result => !contractsSet.has(result.id));

  return filteredResults;
}

async function getCoinInfo(params: {
  userId: string,
  platform: string,
  value: number | string,
  type: 'token' | 'pair',
  tokenPairSkip: number
}) {
  let data: Record<string, any> = { info: null }

  if (params.platform === "cg") {
    const cgCoin = await cgModel.CGCoinInfoModel.aggregate([
      { $match: { id: params.value } },
      {
        $project: {
          id: 1,
          name: 1,
          logo: "$image",
          description: "$description",
          price: "$current_price",
          priceChange: "$price_change_percentage_24h",
          urls: [
            {
              type: "website",
              values: "$links.homepage",
            },
            {
              type: "twitter",
              values: ["$links.twitter_screen_name"],
            },
            {
              type: "message_board",
              values: "$links.official_forum_url",
            },
            {
              type: "chat",
              values: "$links.chat_url",
            },
            {
              type: "facebook",
              values: ["$links.facebook_username"],
            },
            {
              type: "explorer",
              values: "$links.blockchain_site",
            },
            {
              type: "reddit",
              values: ["$links.subreddit_url"],
            },
            {
              type: "technical_doc",
              values: [],
            },
            {
              type: "telegram",
              values: [
                "$links.telegram_channel_identifier",
              ],
            },
            {
              type: "source_code",
              values: {
                $concatArrays: [
                  "$links.repos_url.github",
                  "$links.repos_url.bitbucket",
                ],
              },
            },
            {
              type: "announcement",
              values: "$links.announcement_url",
            },
            {
              type: "bitcointalk",
              values: ["$links.bitcointalk_thread_identifier"]
            }
          ],
          chart: [],
          platform: "cg",
          type: "token",
          circulating_supply: "$circulating_supply",
          market_cap: "$market_cap",
          total_supply: "$total_supply",
          total_volume: "$total_volume",
          platforms: "$platforms"
        },
      },
    ]);

    if (cgCoin.length < 1) {
      return data;
    }
    
    data['info'] = cgCoin[0];
    data['info'].urls = parseUrl(data['info'].urls);

    const isFav = await favCoinsModel.exists({ platform: "cg", value: params.value, userId: params.userId, type: 'token' }).lean();
    data['info'].isFav = isFav?._id.toString() ?? null;

  }

  if (params.platform === 'DEX' && params.type === 'token') {
    if (!params.tokenPairSkip) {
      params.tokenPairSkip = 0
    }

    const bqCoin = await bqModel.BQPairModel.aggregate([
      { $match: { "buyCurrency.address": params.value } },
      {
        $project: {
          _id: 0,
          id: "$buyCurrency.address",
          name: "$buyCurrency.name",
          logo: null,
          description: null,
          price: { $toDouble: "$buyCurrencyPrice" },
          priceChange: null,
          urls: [],
          chart: [],
          platform: "DEX",
          type: "token",
          market_cap: null,
          total_volume: null,
          platforms: null,
          circulating_supply: null,
          total_supply: null,
        },
      },
    ]);

    if (bqCoin.length < 1) {
      return data;
    }

    const isFav = await favCoinsModel.exists({ platform: "DEX", value: params.value, userId: params.userId, type: "token" }).lean();
    bqCoin[0].isFav = isFav?._id.toString() ?? null;

    data['info'] = bqCoin[0];
  }

  if (params.platform === 'DEX' && params.type === 'pair') {
    const bqPair = await bqModel.BQPairModel.aggregate([
      { $match: { "smartContract.address.address": params.value } },
      {
        $project: {
          id: "$smartContract.address.address",
          name: { $concat: ["$buyCurrency.symbol", "/", "$sellCurrency.symbol"] },
          logo: null,
          price: { $toDouble: "$buyCurrencyPrice" },
          priceChange: null,
          platform: "DEX",
          updatedAt: "$updatedAt",
          network: "$network",
          type: "pair",
          count: "$count",
          tradeAmount: "$tradeAmount",
          pairContractAddress: "$smartContract.address.address",
          protocolType: "$smartContract.protocolType",
          exchange: "$exchange.fullName",
          exchangeContractAddress: "$exchange.address.address",
          circulating_supply: null,
          total_supply: null,
        },
      }
    ]);

    if (bqPair.length < 1) {
      return data;
    }

    const info: Record<string, any> = {
      id: bqPair[0].id,
      name: bqPair[0].name,
      logo: bqPair[0].logo,
      price: bqPair[0].price,
      priceChange: bqPair[0].change,
      platform: bqPair[0].platform,
      network: bqPair[0].network,
      type: bqPair[0].type,
      pairContractAddress: bqPair[0].pairContractAddress,
      protocolType: bqPair[0].protocolType,
      exchange: bqPair[0].exchange,
      exchangeContractAddress: bqPair[0].exchangeContractAddress,
      market_cap: null,
      total_volume: null,
      platforms: null,
      circulating_supply: null,
      total_supply: null,
      buy: {
        name: bqPair[0].name,
        trades: bqPair[0].count,
        tradeAmount: bqPair[0].tradeAmount,
      },
      sell: null,
      isFav: null
    }
    
    if (bqPair[1]) {
      info['sell'] = {
        name: bqPair[1].name,
        count: bqPair[1].count,
        tradeAmount: bqPair[1].tradeAmount
      };
    }

    const isFav = await favCoinsModel.exists({ platform: 'DEX', value: params.value, userId: params.userId }).lean();
    info['isFav'] = isFav?._id.toString() ?? null;
    
    data['info'] = info;
  }

  return data;
}

async function getTop100() {
  const top100 = await cgModel.CGCoinInfoModel.aggregate([
  { $match: { market_cap_rank: { $ne: null } } },
  { $sort: { market_cap_rank: 1 } },
  { $limit: 100 },
  {
    $project: {
      id: 1,
      market_cap_rank: 1,
      name: 1,
      logo: "$image",
      price: "$current_price",
      change: { $round: ["$price_change_percentage_24h", 4] },
      platform: "cg",
      type: "token",
    },
  },
]);

  return top100;
}

async function getNetworks() {
  const cgInfoNetworks = await cgModel.CGCoinInfoModel.aggregate([
    { $project: { platformProperties: { $objectToArray: "$platforms" } } },
    { $unwind: "$platformProperties" },
    { $group: { _id: null, networks: { $addToSet: "$platformProperties.k" } } },
    { $project: { _id: 0 } },
  ]);

  const networks = cgInfoNetworks[0].networks
    .filter((network: string) => network !== '')
    .map((network: string) => {
      if (network === 'binance-smart-chain') {
        return 'bsc'
      }

      if (network === 'celo') {
        return 'celo_mainnet'
      }

      if (network === 'klay-token') {
        return 'klaytn'
      }

      if (network === 'polygon-pos') {
        return 'matic'
      }

      return network
    })

  return networks;
}

const coinService = {
  coinSearch,
  getCoinInfo,
  getTop100,
  getNetworks
};

export default coinService;
