import { IModelSateResult } from '../models/ModelStateResult.js';
import { RealTimeEvent } from '../models/RealTimeEvent.js';
import { IResult } from '../models/Result.js';
import { ISubscriptionViewModelCreate } from '../models/SubscriptionViewModelCreate.js';
import { ISubscriptionViewModelRead } from '../models/SubscriptionViewModelRead.js';

export interface IRealTimeConnection {
  startAsync(): Promise<void>;
  stopAsync(): Promise<void>;

  registerForEventAsync(
    request: ISubscriptionViewModelCreate
  ): Promise<IModelSateResult<ISubscriptionViewModelRead>>;

  unregisterForEventAsync(
    subscriptionId: string
  ): Promise<IResult<ISubscriptionViewModelRead>>;

  addEventHandler<T>(
    eventName: string,
    callback: (event: RealTimeEvent<T>) => void
  ): void;

  removeEventHandler(eventName: string): void;

  onreconnected(callback: () => void): void;
}
