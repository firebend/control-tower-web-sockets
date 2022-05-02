import { IBaseMessage } from './base-message';

export class ConnectedMessage implements IBaseMessage {
  type: string;

  constructor() {
    this.type = 'connected';
  }
}
