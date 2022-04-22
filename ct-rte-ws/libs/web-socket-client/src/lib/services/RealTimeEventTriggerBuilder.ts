import { EventTriggerTypes } from '../models/EventTriggerTypes';
import { ISubscriptionViewModelCreate } from '../models/SubscriptionViewModelCreate';
import { RealTimeEventBuilder } from './RealTimeEventBuilder';

export class RealTimeEventTriggerBuilder {
  private readonly _realTimeEventBuilder: RealTimeEventBuilder;
  private readonly _trigger: EventTriggerTypes;
  private _subscriptions: ISubscriptionViewModelCreate[] = [];

  constructor(
    realTimeEventBuilder: RealTimeEventBuilder,
    trigger: EventTriggerTypes
  ) {
    this._realTimeEventBuilder = realTimeEventBuilder;
    this._trigger = trigger;
  }

  withFilter(filter: string | undefined): RealTimeEventTriggerBuilder {
    this._subscriptions.push({
      trigger: this._trigger,
      filter: filter,
      eventName: this._realTimeEventBuilder.eventName,
    });

    return this;
  }

  async buildAsync(): Promise<void> {
    for (let i = 0; i < this._subscriptions.length; i++) {
      await this._realTimeEventBuilder.connection.registerForEventAsync(
        this._subscriptions[i]
      );
    }
  }
}
