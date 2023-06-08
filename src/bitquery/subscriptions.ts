import env from '../env';

import { createClient } from 'graphql-ws';
import { WebSocket } from 'ws';
import bitqueries from './queries';

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

async function priceSubscription(params: {
  network: 'eth' | 'bsc';
  buyCurrency: string;
  sellCurrency: string;
}) {
  const onNext = (value: any) => {
    console.log('===============Trades===============');
    const dexTradex = value.data.EVM.DEXTrades;
    console.log(JSON.stringify(dexTradex, null, 2));
  };

  await new Promise((_resolve, _reject) => {
    const query = bitqueries.priceSubscription(params);
    console.log(query);

    client.subscribe(
      { query },
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

export default {
  priceSubscription,
};
