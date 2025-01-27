import bqModel from '../models/bq.model';
import cgModel from '../models/cg.model';
import favCoinsModel from '../models/favCoins.model';
import logModel from '../models/log.model';
import aegisService from './aegis.service';

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

  let networkForBq = params.network;
  let networkForCg = params.network;

  if (params.network === 'bsc') {
    networkForBq = 'bsc';
    networkForCg = 'binance-smart-chain'
  }

  if (params.network === 'celo_mainnet') {
    networkForBq = 'celo_mainnet'
    networkForCg = 'celo'
  }

  if (params.network === 'klaytn') {
    networkForCg = 'klay-token'
    networkForBq = 'klaytn'
  }

  if (params.network === 'matic') {
    networkForCg = 'polygon-pos'
    networkForBq = 'matic'
  }

  const regexSearch = { $regex: `.*${params.searchTerm}.*`, $options: "i" };

  const cgMatch: Record<string, any> = {
    $or: [
      { symbol: regexSearch },
      { name: regexSearch },
      { id: regexSearch },
      { "platforms.sui": regexSearch },
      { "platforms.kava": regexSearch },
      { "platforms.wanchain": regexSearch },
      { "platforms.zksync": regexSearch },
      { "platforms.syscoin": regexSearch },
      { "platforms.zilliqa": regexSearch },
      { "platforms.conflux": regexSearch },
      { "platforms.songbird": regexSearch },
      { "platforms.evmos": regexSearch },
      { "platforms.komodo": regexSearch },
      { "platforms.terra-2": regexSearch },
      { "platforms.bitkub-chain": regexSearch },
      { "platforms.step-network": regexSearch },
      { "platforms.bitcoin-cash": regexSearch },
      { "platforms.hydra": regexSearch },
      { "platforms.sora": regexSearch },
      { "platforms.polygon-pos": regexSearch },
      { "platforms.chiliz": regexSearch },
      { "platforms.kujira": regexSearch },
      { "platforms.terra": regexSearch },
      { "platforms.empire": regexSearch },
      { "platforms.everscale": regexSearch },
      { "platforms.polygon-zkevm": regexSearch },
      { "platforms.okex-chain": regexSearch },
      { "platforms.boba": regexSearch },
      { "platforms.meter": regexSearch },
      { "platforms.binancecoin": regexSearch },
      { "platforms.xdc-network": regexSearch },
      { "platforms.elastos": regexSearch },
      { "platforms.oasys": regexSearch },
      { "platforms.aptos": regexSearch },
      { "platforms.neo": regexSearch },
      { "platforms.linea": regexSearch },
      { "platforms.kucoin-community-chain": regexSearch },
      { "platforms.milkomeda-cardano": regexSearch },
      { "platforms.bitshares": regexSearch },
      { "platforms.tron": regexSearch },
      { "platforms.cube": regexSearch },
      { "platforms.pulsechain": regexSearch },
      { "platforms.energi": regexSearch },
      { "platforms.moonriver": regexSearch },
      { "platforms.Bitcichain": regexSearch },
      { "platforms.kusama": regexSearch },
      { "platforms.secret": regexSearch },
      { "platforms.base": regexSearch },
      { "platforms.dogechain": regexSearch },
      { "platforms.optimistic-ethereum": regexSearch },
      { "platforms.bitgert": regexSearch },
      { "platforms.aurora": regexSearch },
      { "platforms.binance-smart-chain": regexSearch },
      { "platforms.stellar": regexSearch },
      { "platforms.flare-network": regexSearch },
      { "platforms.cronos": regexSearch },
      { "platforms.tenet": regexSearch },
      { "platforms.ronin": regexSearch },
      { "platforms.osmosis": regexSearch },
      { "platforms.neon-evm": regexSearch },
      { "platforms.stacks": regexSearch },
      { "platforms.sx-network": regexSearch },
      { "platforms.hedera-hashgraph": regexSearch },
      { "platforms.the-open-network": regexSearch },
      { "platforms.mantle": regexSearch },
      { "platforms.defi-kingdoms-blockchain": regexSearch },
      { "platforms.klay-token": regexSearch },
      { "platforms.velas": regexSearch },
      { "platforms.rootstock": regexSearch },
      { "platforms.near-protocol": regexSearch },
      { "platforms.core": regexSearch },
      { "platforms.godwoken": regexSearch },
      { "platforms.celer-network": regexSearch },
      { "platforms.iotex": regexSearch },
      { "platforms.polkadot": regexSearch },
      { "platforms.tomochain": regexSearch },
      { "platforms.factom": regexSearch },
      { "platforms.nuls": regexSearch },
      { "platforms.fantom": regexSearch },
      { "platforms.thundercore": regexSearch },
      { "platforms.trustless-computer": regexSearch },
      { "platforms.ethereumpow": regexSearch },
      { "platforms.karura": regexSearch },
      { "platforms.ontology": regexSearch },
      { "platforms.telos": regexSearch },
      { "platforms.tezos": regexSearch },
      { "platforms.harmony-shard-0": regexSearch },
      { "platforms.canto": regexSearch },
      { "platforms.moonbeam": regexSearch },
      { "platforms.thorchain": regexSearch },
      { "platforms.qtum": regexSearch },
      { "platforms.theta": regexSearch },
      { "platforms.eos-evm": regexSearch },
      { "platforms.metis-andromeda": regexSearch },
      { "platforms.findora": regexSearch },
      { "platforms.onus": regexSearch },
      { "platforms.function-x": regexSearch },
      { "platforms.ordinals": regexSearch },
      { "platforms.ardor": regexSearch },
      { "platforms.huobi-token": regexSearch },
      { "platforms.algorand": regexSearch },
      { "platforms.icon": regexSearch },
      { "platforms.eos": regexSearch },
      { "platforms.coinex-smart-chain": regexSearch },
      { "platforms.arbitrum-one": regexSearch },
      { "platforms.cosmos": regexSearch },
      { "platforms.shiden network": regexSearch },
      { "platforms.proof-of-memes": regexSearch },
      { "platforms.bittorrent": regexSearch },
      { "platforms.ethereum-classic": regexSearch },
      { "platforms.gochain": regexSearch },
      { "platforms.stratis": regexSearch },
      { "platforms.cardano": regexSearch },
      { "platforms.callisto": regexSearch },
      { "platforms.waves": regexSearch },
      { "platforms.exosama": regexSearch },
      { "platforms.astar": regexSearch },
      { "platforms.mixin-network": regexSearch },
      { "platforms.hoo": regexSearch },
      { "platforms.elrond": regexSearch },
      { "platforms.wemix-network": regexSearch },
      { "platforms.avalanche": regexSearch },
      { "platforms.kardiachain": regexSearch },
      { "platforms.vite": regexSearch },
      { "platforms.nem": regexSearch },
      { "platforms.xrp": regexSearch },
      { "platforms.solana": regexSearch },
      { "platforms.smartbch": regexSearch },
      { "platforms.ethereum": regexSearch },
      { "platforms.fuse": regexSearch },
      { "platforms.fusion-network": regexSearch },
      { "platforms.skale": regexSearch },
      { "platforms.xdai": regexSearch },
      { "platforms.vechain": regexSearch },
      { "platforms.omni": regexSearch },
      { "platforms.oasis": regexSearch },
      { "platforms.tombchain": regexSearch },
      { "platforms.rollux": regexSearch },
      { "platforms.arbitrum-nova": regexSearch },
      { "platforms.celo": regexSearch },
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
    {
      $lookup: {
        from: "AegisTokenQuickCheck",
        localField: "contracts.ethereum",
        foreignField: "contract_address",
        as: "AegisTokenQuickCheckEthereum"
      }
    },
    {
      $unwind: {
        path: "$AegisTokenQuickCheckEthereum",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "AegisTokenQuickCheck",
        localField: "contracts.binance-smart-chain",
        foreignField: "contract_address",
        as: "AegisTokenQuickCheckBSC"
      }
    },
    {
      $unwind: {
        path: "$AegisTokenQuickCheckBSC",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "AegisTokenQuickCheck",
        localField: "contracts.polygon-pos",
        foreignField: "contract_address",
        as: "AegisTokenQuickCheckPolygon"
      }
    },
    {
      $unwind: {
        path: "$AegisTokenQuickCheckPolygon",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: "AegisTokenQuickCheck",
        localField: "contracts.fantom",
        foreignField: "contract_address",
        as: "AegisTokenQuickCheckFantom"
      }
    },
    {
      $unwind: {
        path: "$AegisTokenQuickCheckFantom",
        preserveNullAndEmptyArrays: true
      }
    }
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
      {
        $lookup: {
          from: "AegisTokenQuickCheck",
          localField: "address",
          foreignField: "contract_address",
          as: "AegisTokenQuickCheckEthereum"
        }
      },
      {
        $unwind: {
          path: "$AegisTokenQuickCheckEthereum",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "AegisTokenQuickCheck",
          localField: "address",
          foreignField: "contract_address",
          as: "AegisTokenQuickCheckBSC"
        }
      },
      {
        $unwind: {
          path: "$AegisTokenQuickCheckBSC",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "AegisTokenQuickCheck",
          localField: "address",
          foreignField: "contract_address",
          as: "AegisTokenQuickCheckPolygon"
        }
      },
      {
        $unwind: {
          path: "$AegisTokenQuickCheckPolygon",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "AegisTokenQuickCheck",
          localField: "address",
          foreignField: "contract_address",
          as: "AegisTokenQuickCheckFantom"
        }
      },
      {
        $unwind: {
          path: "$AegisTokenQuickCheckFantom",
          preserveNullAndEmptyArrays: true
        }
      }
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
          name: { $concat: ["$buyCurrency.symbol", "/", "$sellCurrency.symbol"] },
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
          buyCurrencyAddress: "$buyCurrency.address",
        },
      },
      {
        $lookup: {
          from: "AegisTokenQuickCheck",
          localField: "buyCurrencyAddress",
          foreignField: "contract_address",
          as: "AegisTokenQuickCheckEthereum",
        },
      },
      {
        $unwind: {
          path: "$AegisTokenQuickCheckEthereum",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "AegisTokenQuickCheck",
          localField: "buyCurrencyAddress",
          foreignField: "contract_address",
          as: "AegisTokenQuickCheckBSC",
        },
      },
      {
        $unwind: {
          path: "$AegisTokenQuickCheckBSC",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "AegisTokenQuickCheck",
          localField: "buyCurrencyAddress",
          foreignField: "contract_address",
          as: "AegisTokenQuickCheckPolygon",
        },
      },
      {
        $unwind: {
          path: "$AegisTokenQuickCheckPolygon",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "AegisTokenQuickCheck",
          localField: "buyCurrencyAddress",
          foreignField: "contract_address",
          as: "AegisTokenQuickCheckFantom",
        },
      },
      {
        $unwind: {
          path: "$AegisTokenQuickCheckFantom",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]
  }).skip(params.skip).limit(params.limit);

  aegisService.calculateScore(results);

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

async function getPairs(params: { coinId: string, page?: number, perPage?: number }) {
  if (params.page === undefined) {
    params.page = 1;
  }
  if (params.perPage === undefined) {
    params.perPage = 10;
  }

  const results = await cgModel.CGCoinInfoModel.aggregate([
    {
      $match: {
        id: "weth",
      },
    },
    {
      $project: {
        platformsArray: {
          $objectToArray: "$platforms",
        },
        platforms: 1,
      },
    },
    {
      $unwind: "$platformsArray",
    },
    {
      $project: {
        address: "$platformsArray.v",
        networkForBq: {
          $cond: [
            {
              $eq: [
                "$platformsArray.k",
                "binance-smart-chain",
              ],
            },
            "bsc",
            {
              $cond: [
                {
                  $eq: [
                    "$platformsArray.k",
                    "celo",
                  ],
                },
                "celo_mainnet",
                {
                  $cond: [
                    {
                      $eq: [
                        "$platformsArray.k",
                        "klay-token",
                      ],
                    },
                    "klaytn",
                    {
                      $cond: [
                        {
                          $eq: [
                            "$platformsArray.k",
                            "polygon-pos",
                          ],
                        },
                        "matic",
                        "$platformsArray.k",
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      $lookup: {
        from: "BQPair",
        let: {
          address: "$address",
          network: "$networkForBq",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $or: [
                      {
                        $eq: [
                          "$buyCurrency.address",
                          "$$address",
                        ],
                      },
                      {
                        $eq: [
                          "$sellCurrency.address",
                          "$$address",
                        ],
                      },
                    ],
                  },
                  {
                    $eq: ["$network", "$$network"],
                  },
                ],
              },
            },
          },
        ],
        as: "BQPairArray",
      },
    },
    {
      $unwind: "$BQPairArray",
    },
    {
      $lookup: {
        from: "CGExchangeTickers",
        let: {
          buyCurrency: "$BQPairArray.buyCurrency",
          sellCurrency: "$BQPairArray.sellCurrency",
          smartContract:
            "$BQPairArray.smartContract",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $cond: {
                  if: {
                    $and: [
                      {
                        $regexMatch: {
                          input: "$base",
                          regex: {
                            $toString:
                              "$$buyCurrency.address",
                          },
                          options: "i",
                        },
                      },
                      {
                        $regexMatch: {
                          input: "$target",
                          regex: {
                            $toString:
                              "$$sellCurrency.address",
                          },
                          options: "i",
                        },
                      },
                    ],
                  },
                  then: true,
                  else: false
                },
              },
            },
          },
        ],
        as: "result",
      },
    },
    {
      $project: {
        address: 1,
        BQPairArray: 1,
        CGTicker: { $first: "$result" },
      },
    },
    {
      $project: {
        name: {
          $concat: [
            "$BQPairArray.buyCurrency.symbol",
            "/",
            "$BQPairArray.sellCurrency.symbol",
          ],
        },
        address: 1,
        protocol: "$BQPairArray.smartContract.protocolType",
        price: {
          $cond: [
            { $eq: ["$address", "$BQPairArray.buyCurrency.address"] },
            {
              $toDouble:
                "$BQPairArray.buyCurrencyPrice",
            },
            {
              $toDouble:
                "$BQPairArray.sellCurrencyPrice",
            },
          ],
        },
        network: "$BQPairArray.network",
        logo: "$CGTicker.market.logo"
      },
    }
  ]).skip((params.page - 1) * params.perPage).limit(params.perPage);
  
  return results;
}

async function getCoinInfo(params: {
  userId?: string,
  platform: string,
  value: number | string,
  type: 'token' | 'pair',
  tokenPairSkip: number,
  ip: string
}) {
  let data: Record<string, any> = { info: null }

  if (params.platform === "cg") {
    const cgCoin = await cgModel.CGCoinInfoModel.aggregate([
      { $match: { id: params.value } },
      {
        $project: {
          id: 1,
          name: 1,
          coingecko_asset_platform_id: "$asset_platform_id",
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

    if (params.userId) {
      const isFav = await favCoinsModel.exists({ platform: "cg", value: params.value, userId: params.userId, type: 'token' }).lean();
      data['info'].isFav = isFav?._id.toString() ?? null;
    }

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
          network: "$network",
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

    bqCoin[0].coingecko_asset_platform_id = bqCoin[0].network;

    if (bqCoin[0].network === 'bsc') {
      bqCoin[0].coingecko_asset_platform_id = 'binance-smart-chain'
    }


    if (bqCoin[0].network === 'celo_mainnet') {
      bqCoin[0].coingecko_asset_platform_id = 'celo'
    }

    if (bqCoin[0].network === 'klaytn') {
      bqCoin[0].coingecko_asset_platform_id = 'klay-token'
    }

    if (bqCoin[0].network === 'matic') {
      bqCoin[0].coingecko_asset_platform_id = 'polygon-pos'
    }

    if (params.userId) {
      const isFav = await favCoinsModel.exists({ platform: "DEX", value: params.value, userId: params.userId, type: "token" }).lean();
      bqCoin[0].isFav = isFav?._id.toString() ?? null;
    }

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

    info['coingecko_asset_platform_id'] = info['network'];


    if (info['network'] === 'bsc') {
      info['coingecko_asset_platform_id'] = 'binance-smart-chain'
    }


    if (info['network'].network === 'celo_mainnet') {
      info['coingecko_asset_platform_id'] = 'celo'
    }

    if (info['network'].network === 'klaytn') {
      info['coingecko_asset_platform_id'] = 'klay-token'
    }

    if (info['network'].network === 'matic') {
      info['coingecko_asset_platform_id'] = 'polygon-pos'
    }

    if (bqPair[1]) {
      info['sell'] = {
        name: bqPair[1].name,
        count: bqPair[1].count,
        tradeAmount: bqPair[1].tradeAmount
      };
    }

    if (params.userId) {
      const isFav = await favCoinsModel.exists({ platform: 'DEX', value: params.value, userId: params.userId }).lean();
      info['isFav'] = isFav?._id.toString() ?? null;
    }

    data['info'] = info;
  }

  if (data['info']) {
    await logModel.LogCoinInfoModel.create({
      param: {
        platform: params.platform,
        value: params.value,
        type: params.type
      },
      ip: params.ip,
      userId: params.userId ?? null
    });
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

async function getTopTrending10() {
  const last24HoursTimestamp = ((new Date()).getTime()) - 24 * 60 * 60 * 1000;
  const top10 = await logModel.LogCoinInfoModel.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(last24HoursTimestamp) }
      }
    },
    {
      $group: {
        _id: {
          platform: "$param.platform",
          value: "$param.value",
          type: "$param.type",
          ip: "$ip",
          userId: "$userId"
        }
      }
    },
    {
      $group: {
        _id: {
          platform: "$_id.platform",
          value: "$_id.value",
          type: "$_id.type"
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        param: {
          platform: "$_id.platform",
          value: "$_id.value",
          type: "$_id.type"
        },
        count: 1,
      }
    },
    {
      $lookup: {
        from: "CGInfo",
        localField: "param.value",
        foreignField: "id",
        as: "CGInfo"
      }
    },
    {
      $lookup: {
        from: "BQPair",
        localField: "param.value",
        foreignField: "buyCurrency.address",
        as: "BQPair_token"
      }
    },
    {
      $lookup: {
        from: "BQPair",
        localField: "param.value",
        foreignField: "smartContract.address.address",
        as: "BQPair_pair"
      }
    },
    {
      $project: {
        count: 1,
        _id: {
          $cond: [
            { $eq: ["param.platform", "cg"] },
            null,
            {
              $cond: [
                { $eq: ["param.type", "token"] },
                { $arrayElemAt: ["$BQPair_token.buyCurrency.address", 0] },
                0
              ]
            }
          ]
        },
        id: {
          $cond: [
            { $eq: ["param.platform", "cg"] },
            1,
            {
              $cond: [
                { $eq: ["param.type", "token"] },
                { $arrayElemAt: ["$BQPair_token.buyCurrency.address", 0] },
                { $arrayElemAt: ["$BQPair_pair.smartContract.address.address", 0] }
              ]
            }
          ]
        },
        name: {
          $cond: [
            { $eq: ["param.platform", "cg"] },
            1,
            {
              $cond: [
                { $eq: ["param.type", "token"] },
                { $arrayElemAt: ["$BQPair_token.buyCurrency.name", 0] },
                {
                  $concat: [
                    { $arrayElemAt: ["$BQPair_pair.buyCurrency.symbol", 0] },
                    "/",
                    { $arrayElemAt: ["$BQPair_pair.sellCurrency.symbol", 0] }
                  ]
                }
              ]
            }
          ]
        },
        coingecko_asset_platform_id: {
          $cond: [
            { $eq: ["param.platform", "cg"] },
            { $arrayElemAt: ["$CGInfo.asset_platform_id", 0] },
            null
          ]
        },
        logo: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            { $arrayElemAt: ["$CGInfo.image", 0] },
            null
          ]
        },
        description: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            { $arrayElemAt: ["$CGInfo.description", 0] },
            null
          ]
        },
        price: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            { $arrayElemAt: ["$CGInfo.current_price", 0] },
            {
              $cond: [
                { $eq: ["$param.type", "token"] },
                { $toDouble: { $arrayElemAt: ["$BQPair_token.buyCurrencyPrice", 0] } },
                { $toDouble: { $arrayElemAt: ["$BQPair_pair.buyCurrencyPrice", 0] } },
              ]
            }
          ]
        },
        priceChange: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            { $arrayElemAt: ["$CGInfo.price_change_percentage_24h", 0] },
            null
          ]
        },
        change: null,
        urls: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            [
              {
                type: "website",
                values: { $first: "$CGInfo.links.homepage" }
              },
              {
                type: "twitter",
                values: "$CGInfo.links.twitter_screen_name"
              },
              {
                type: "message_board",
                values: "$CGInfo.links.official_forum_url"
              },
              {
                type: "chat",
                values: "$CGInfo.links.chat_url"
              },
              {
                type: "facebook",
                values: ["$CGInfo.links.facebook_username"]
              },
              {
                type: "explorer",
                values: "$CGInfo.links.blockchain_site"
              },
              {
                type: "reddit",
                values: ["$CGInfo.links.subreddit_url"]
              },
              {
                type: "technical_doc",
                values: []
              },
              {
                type: "telegram",
                values: ["$CGInfo.links.telegram_channel_identifier"]
              },
              {
                type: "source_code",
                values: {
                  $concatArrays: [
                    "$CGInfo.links.repos_url.github",
                    "$CGInfo.links.repos_url.bitbucket",
                  ],
                }
              },
              {
                type: "announcement",
                values: "$CGInfo.links.announcement_url"
              },
              {
                type: "bitcointalk",
                values: "$CGInfo.links.bitcointalk_thread_identifier"
              },
            ],
            null
          ]
        },
        chart: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            [],
            null
          ]
        },
        platform: "$param.platform",
        type: "$param.type",
        circulating_supply: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            { $first: "$CGInfo.circulating_supply" },
            null
          ]
        },
        market_cap: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            { $first: "$CGInfo.market_cap" },
            null
          ]
        },
        total_supply: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            { $first: "$CGInfo.total_supply" },
            null
          ]
        },
        total_volume: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            { $first: "$CGInfo.total_volume" },
            null
          ]
        },
        platforms: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            { $first: "$CGInfo.platforms" },
            null
          ]
        },
        address: {
          $cond: [
            { $and: [{ $eq: ["$param.platform", "DEX"] }, { $eq: ["$param.type", "token"] }] },
            { $first: "$BQPair_token.buyCurrency.address" },
            null
          ]
        },
        decimals: {
          $cond: [
            { $and: [{ $eq: ["$param.platform", "DEX"] }, { $eq: ["$param.type", "token"] }] },
            { $first: "$BQPair_token.buyCurrency.decimals" },
            null
          ]
        },
        symbol: {
          $cond: [
            { $and: [{ $eq: ["$param.platform", "DEX"] }, { $eq: ["$param.type", "token"] }] },
            { $first: "$BQPair_token.buyCurrency.symbol" },
            null
          ]
        },
        tokenId: {
          $cond: [
            { $and: [{ $eq: ["$param.platform", "DEX"] }, { $eq: ["$param.type", "token"] }] },
            { $first: "$BQPair_token.buyCurrency.tokenId" },
            null
          ]
        },
        tokenType: {
          $cond: [
            { $and: [{ $eq: ["$param.platform", "DEX"] }, { $eq: ["$param.type", "token"] }] },
            { $first: "$BQPair_token.buyCurrency.tokenType" },
            null
          ]
        },
        network: {
          $cond: [
            { $eq: ["$param.platform", "cg"] },
            null,
            {
              $cond: [
                { $eq: ["$param.type", "token"] },
                { $first: "$BQPair_token.network" },
                { $first: "$BQPair_pair.network" }
              ]
            }
          ]
        },
        updatedAt: {
          $cond: [
            { $and: [{ $eq: ["$param.platform", "DEX"] }, { $eq: ["$param.type", "pair"] }] },
            { $first: "$BQPair_pair.updatedAt" },
            null
          ]
        },
        exchange: {
          $cond: [
            { $and: [{ $eq: ["$param.platform", "DEX"] }, { $eq: ["$param.type", "pair"] }] },
            { $first: "$BQPair_pair.exchange.fullName" },
            null
          ]
        },
        buyCurrencyAddress: {
          $cond: [
            { $and: [{ $eq: ["$param.platform", "DEX"] }, { $eq: ["$param.type", "pair"] }] },
            { $first: "$BQPair_pair.buyCurrency.address" },
            null
          ]
        }
      }
    },
    {
      $sort: {
        count: -1
      }
    },
    {
      $limit: 10
    }
  ]);
  return top10;
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
  getPairs,
  getTop100,
  getTopTrending10,
  getNetworks
};

export default coinService;
