import { IRealTimeConnection } from '../interfaces/IRealTimeConnection';
import { EventTriggerTypes } from '../models/EventTriggerTypes';
import { RealTimeEvent } from '../models/RealTimeEvent';
import { RealTimeEventTriggerBuilder } from './RealTimeEventTriggerBuilder';

export class RealTimeEventBuilder {
  private _eventName: string;
  private _builders: RealTimeEventTriggerBuilder[] = [];

  /**
   * The configured event name
   */
  get eventName(): string {
    return this._eventName;
  }

  /**
   * The real time connection
   */
  connection: IRealTimeConnection;

  constructor(eventName: string, connection: IRealTimeConnection) {
    if(!eventName){
      throw 'An event name is required';
    }

    if(!connection){
      throw 'A connection is required';
    }

    this._eventName = eventName;
    this.connection = connection;
  }

  /**
   * Configures the callback handler to be invoked when the event is received
   * @param callback the callback
   * @returns RealTimeEventBuilder
   */
  withEventHandler<T>(
    callback: (event: RealTimeEvent<T>) => void
  ): RealTimeEventBuilder {
    this.connection.addEventHandler(this._eventName, callback);
    return this;
  }

  /**
   * Adds a trigger to the event builder
   * @param triggerType The trigger type
   * @param configure An optional callback to configure the trigger
   * @returns RealTimeEventBuilder
   */
  onTrigger(
    triggerType: EventTriggerTypes,
    configure?: (builder: RealTimeEventTriggerBuilder) => void
  ): RealTimeEventBuilder {
    const builder = new RealTimeEventTriggerBuilder(this, triggerType);

    configure = configure || ((builder) => { builder.withFilter(undefined); });

    configure(builder);

    this._builders.push(builder);
    return this;
  }


  /** @internal */
  async buildAsync() {
    for (let i = 0; i < this._builders.length; i++) {
      await this._builders[i].buildAsync();
    }
  }
}
