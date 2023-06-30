export interface IEnv {
  host: string;
  port: number | string;
  dbUri: string;
  debug: boolean;
  trustProxy: boolean;
  bitqueryApiKey: string;
  bitqueryEndpoint: string;
  bitqueryStreamingEndpoint: string;
  bitqueryWs: string;
  accessJwtSecret: string;
  refreshJwtSecret: string;
  cryptoSecret: string;
  cgBaseUrl: string;
  cgApiKey: string;
}
