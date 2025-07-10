export class ResponseDto<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;

  constructor(status: 'success' | 'error', message?: string, data?: T) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
