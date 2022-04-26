import { EventTriggerTypes } from '../models/EventTriggerTypes';
import { ISubscriptionViewModelCreate } from '../models/SubscriptionViewModelCreate';
import { RealTimeEventBuilder } from './RealTimeEventBuilder';

export class RealTimeEventTriggerBuilder {
  private readonly _realTimeEventBuilder: RealTimeEventBuilder;
  private readonly _trigger: EventTriggerTypes;
  public readonly subscriptions: ISubscriptionViewModelCreate[] = [];

  constructor(
    realTimeEventBuilder: RealTimeEventBuilder,
    trigger: EventTriggerTypes
  ) {
    if(!realTimeEventBuilder){
      throw 'A real time event builder is required';
    }

    if(!trigger){
      throw 'A trigger is required';
    }

    this._realTimeEventBuilder = realTimeEventBuilder;
    this._trigger = trigger;
  }

  /**
   * Adds a filter to the event subscription
   * @param filter The filter to use
   * @returns RealTimeEventTriggerBuilder
   */
  withFilter(filter: string | undefined): RealTimeEventTriggerBuilder {
    this.subscriptions.push({
      trigger: this._trigger,
      filter: filter,
      eventName: this._realTimeEventBuilder.eventName,
    });

    return this;
  }

  /** @internal */
  async buildAsync(): Promise<void> {
    for (let i = 0; i < this.subscriptions.length; i++) {
      await this._realTimeEventBuilder.connection.registerForEventAsync(
        this.subscriptions[i]
      );
    }
  }
}
