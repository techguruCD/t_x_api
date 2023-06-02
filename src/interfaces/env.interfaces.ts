export interface IEnv {
  host: string;
  port: number | string;
  dbUri: string;
  debug: boolean;
  trustProxy: boolean;
}
