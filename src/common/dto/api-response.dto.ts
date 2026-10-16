/** Standard success response wrapper for all API endpoints */
export class ApiResponseDto<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;

  constructor(data?: T, message?: string) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  /** Factory method: creates a success response with data and optional message */
  static success<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto(data, message);
  }
}
