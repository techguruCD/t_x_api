import axios from 'axios';
import env from '../env';

const bitqueryStreamingAxios = axios.create({
  baseURL: env().bitqueryStreamingEndpoint,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': env().bitqueryApiKey,
  },
});
export default bitqueryStreamingAxios;
