export class ExpressError extends Error {
  code: string;
  statusCode: number;

  constructor(_code: string, _message: string, _statusCode: number) {
    super(_message);
    this.code = _code;
    this.statusCode = _statusCode;
  }
}
