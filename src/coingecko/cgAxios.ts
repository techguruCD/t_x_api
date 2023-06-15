import axios from 'axios';
import env from '../env';

const cgAxios = axios.create({
  baseURL: 'https://pro-api.coingecko.com/api/v3/',
  headers: {
    'Content-Type': 'application/json',
    'x-cg-pro-api-key': env().cgApiKey,
  },
});
export default cgAxios;
