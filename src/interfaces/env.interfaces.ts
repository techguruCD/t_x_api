export interface IEnv {
  host: string;
  port: number | string;
  dbUri: string;
  debug: boolean;
  trustProxy: boolean;
  bitqueryApiKey: string;
  bitqueryEndpoint: string;
  bitqueryWs: string;
  accessJwtSecret: string;
  refreshJwtSecret: string;
  cryptoSecret: string;
  cgApiKey: string;
}
