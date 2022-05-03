import { RealTimeEvent } from '@ct-rte-ws/web-socket-client';
import { IBaseMessage } from './base-message';

export class RealTimeEventMessage implements IBaseMessage {
  event: RealTimeEvent<unknown>;
  type: string;

  constructor(event: RealTimeEvent<unknown>) {
    this.event = event;
    this.type = 'real-time-event';
  }
}
