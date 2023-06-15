import axios from 'axios';
import env from '../env';

const bitqueryAxios = axios.create({
  baseURL: env().bitqueryEndpoint,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': env().bitqueryApiKey,
  },
});
export default bitqueryAxios;
