import axios from 'axios';
import env from '../env';

const cgAxios = axios.create({
  baseURL: env().cgBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'x-cg-pro-api-key': env().cgApiKey,
  },
});
export default cgAxios;
