import { IBaseMessage } from './base-message';

export class JwtMessage implements IBaseMessage {
  token: string;
  type: string;

  constructor(token: string) {
    this.token = token;
    this.type = 'jwt';
  }
}
