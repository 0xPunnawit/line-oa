/** Standard error response structure for consistent error formatting */
export class ErrorResponseDto {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  error?: string;

  constructor(
    statusCode: number,
    message: string,
    path: string,
    error?: string,
  ) {
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.message = message;
    this.error = error;
  }

  /** Creates a 400 Bad Request error response */
  static badRequest(message: string, path: string): ErrorResponseDto {
    return new ErrorResponseDto(400, message, path, 'Bad Request');
  }

  /** Creates a 500 Internal Server Error response */
  static internal(message: string, path: string): ErrorResponseDto {
    return new ErrorResponseDto(500, message, path, 'Internal Server Error');
  }
}
