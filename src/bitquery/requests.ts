import { isAxiosError } from 'axios';
import bitqueryAxios from './bitqueryAxios';
import queries from './queries';

async function searchToken(params: {
  network: 'ethereum' | 'bsc';
  string: string;
}) {
  try {
    const query = queries.searchTokenByString(params);
    const data = await bitqueryAxios.post('/', JSON.stringify({ query }));
    return data.data;
  } catch (error: any) {
    if (isAxiosError(error)) {
      return error.response ? { data: error.response.data } : { data: null };
    }
    return { data: error.message };
  }
}

export default {
  searchToken,
};
