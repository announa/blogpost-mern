export type IHTTPError = Error & {
  statusCode: number;
};

export class HTTPError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
