import axios from 'axios';
import env from '../env';

const aegisAxios = axios.create({ baseURL: env().aegisUrl });
export default aegisAxios;
