import axios from 'axios';

const bitqueryAxios = axios.create({
  baseURL: 'https://graphql.bitquery.io',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'BQYCMbLpYep5h7ALNt6ZS6rKWSw8LE8n',
  },
});

export default bitqueryAxios;
