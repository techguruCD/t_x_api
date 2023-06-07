import env, { initEnv } from '../env';

// init env
console.log('[info] initializing env');
initEnv();

import { createClient } from 'graphql-ws';
import { WebSocket } from 'ws';

class MyWebSocket extends WebSocket {
  constructor(address: any, protocols: any) {
    super(address, protocols, {
      headers: {
        'X-API-KEY': env().bitqueryApiKey,
      },
    });
  }
}

const client = createClient({
  url: 'wss://streaming.bitquery.io/graphql',
  webSocketImpl: MyWebSocket,
});

async function testSubsctiption() {
  const onNext = (value: any) => {
    console.log('===============Trades===============');
    value.data.EVM.buy.forEach((trade: any) => {
      const buy = trade.Trade.Buy;
      const sell = trade.Trade.Sell;

      console.log('==Buy Trade==');
      console.log(JSON.stringify({ buy, sell }, null, 2));
    });

    value.data.EVM.sell.forEach((trade: any) => {
      const buy = trade.Trade.Buy;
      const sell = trade.Trade.Sell;

      console.log('==Sell Trade==');
      console.log(JSON.stringify({ buy, sell }, null, 2));
    });
  };

  await new Promise((_resolve, _reject) => {
    client.subscribe(
      {
        query: `
            subscription {
                EVM(network: bsc) {
                    buy: DEXTrades(
                    where: {Trade: {Sell: {Currency: {SmartContract: {is: "0x55d398326f99059ff775485246999027b3197955"}}}, Buy: {Currency: {SmartContract: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}}}}}
                    ) {
                    Trade {
                        Sell {
                        Buyer
                        Amount
                        Currency {
                            Symbol
                        }
                        }
                        Buy {
                        Price
                        Amount
                        Currency {
                            Symbol
                        }
                        }
                    }
                    }
                    sell: DEXTrades(
                    where: {Trade: {Buy: {Currency: {SmartContract: {is: "0x55d398326f99059ff775485246999027b3197955"}}}, Sell: {Currency: {SmartContract: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}}}}}
                    ) {
                    Trade {
                        Sell {
                        Price
                        Buyer
                        Amount
                        Currency {
                            Symbol
                        }
                        }
                        Buy {
                        Amount
                        Currency {
                            Symbol
                        }
                        }
                    }
                    }
                }
            }
            `,
      },
      {
        next: onNext,
        error: _reject,
        complete: () => {
          console.log('Complete');
        },
      }
    );
  });
}

testSubsctiption();
