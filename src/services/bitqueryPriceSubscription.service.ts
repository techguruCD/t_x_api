import subscriptions from '../bitquery/subscriptions';

async function priceSubscriptionService(params: {
  network: 'eth' | 'bsc';
  buyCurrency: string;
  sellCurrency: string;
}) {
  subscriptions.priceSubscription(params);
  return { msg: 'SUCCESS' };
}

export default priceSubscriptionService;
