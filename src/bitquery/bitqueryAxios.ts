import axios from 'axios';
import env from '../env';

const bitqueryAxios = axios.create({
  baseURL: 'https://graphql.bitquery.io',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': env().bitqueryApiKey,
  },
});
export default bitqueryAxios;
