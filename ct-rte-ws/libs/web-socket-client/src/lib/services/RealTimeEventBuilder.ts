import { IRealTimeConnection } from '../interfaces/IRealTimeConnection';
import { EventTriggerTypes } from '../models/EventTriggerTypes';
import { RealTimeEvent } from '../models/RealTimeEvent';
import { RealTimeEventTriggerBuilder } from './RealTimeEventTriggerBuilder';

export class RealTimeEventBuilder {
  private _eventName: string;
  private _builders: RealTimeEventTriggerBuilder[] = [];

  get eventName(): string {
    return this._eventName;
  }

  connection: IRealTimeConnection;

  constructor(eventName: string, connection: IRealTimeConnection) {
    this._eventName = eventName;
    this.connection = connection;
  }

  withEventHandler<T>(
    callback: (event: RealTimeEvent<T>) => void
  ): RealTimeEventBuilder {
    this.connection.addEventHandler(this._eventName, callback);
    return this;
  }

  onTrigger(
    triggerType: EventTriggerTypes,
    configure: (builder: RealTimeEventTriggerBuilder) => void
  ): RealTimeEventBuilder {
    const builder = new RealTimeEventTriggerBuilder(this, triggerType);
    configure(builder);
    this._builders.push(builder);
    return this;
  }

  async buildAsync() {
    for (let i = 0; i < this._builders.length; i++) {
      await this._builders[i].buildAsync();
    }
  }
}
