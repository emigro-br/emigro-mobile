export class CustomError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.stack = cause?.stack;
  }

  static fromJSON(json: any) {
    const error = new CustomError(json.message);
    error.name = json.name;
    error.stack = json.stack;
    return error;
  }
}
export class NotAuhtorized extends CustomError {
  constructor() {
    super('Not authorized');
    this.name = 'NotAuhtorized';
  }
}
