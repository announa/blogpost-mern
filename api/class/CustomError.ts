export type ICustomError = Error & {
  statusCode?: number
}

export class CustomError extends Error {
  public statusCode: number | undefined;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
