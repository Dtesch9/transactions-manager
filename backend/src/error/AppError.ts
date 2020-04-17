interface Error {
  message: string;
  statusCode: number;
}

class AppError {
  message: string;

  statusCode: number;

  constructor({ message, statusCode = 400 }: Error) {
    this.message = message;
    this.statusCode = statusCode;
  }
}

export default AppError;
