export class CustomError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    this.stack = cause?.stack;
  }

  static fromJSON(json: any) {
    const ErrorClass = errorClasses[json.name] || CustomError;
    const error = new ErrorClass(json.message);
    error.name = json.name;
    error.cause = json.cause;
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

export class BadRequestException extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestException';
  }
}

export class InvalidSessionError extends CustomError {
  constructor() {
    super('Invalid session');
    this.name = 'InvalidSessionError';
  }
}

interface ErrorClasses {
  [key: string]: typeof CustomError;
  // NotAuhtorized: typeof NotAuhtorized;
  // BadRequestException: typeof BadRequestException;
}

const errorClasses: ErrorClasses = {
  NotAuhtorized,
  BadRequestException,
};
