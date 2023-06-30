import axios from 'axios';
import env from '../env';

const geckoAxios = axios.create({
  baseURL: env().geckoTerminalBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
export default geckoAxios;
