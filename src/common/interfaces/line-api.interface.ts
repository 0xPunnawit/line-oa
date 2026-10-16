/** DI token key for injecting LineApiService */
export class LineApiServiceToken {
  static readonly KEY = 'LINE_API_SERVICE';
}

/** Contract for LINE API operations — enables mocking in tests */
export interface ILineApiService {
  replyMessage(replyToken: string, text: string): Promise<void>;
}
