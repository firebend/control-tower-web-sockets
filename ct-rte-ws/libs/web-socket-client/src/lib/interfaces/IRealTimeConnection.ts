import { IModelSateResult } from '../models/ModelStateResult';
import { RealTimeEvent } from '../models/RealTimeEvent';
import { IResult } from '../models/Result';
import { ISubscriptionViewModelCreate } from '../models/SubscriptionViewModelCreate';
import { ISubscriptionViewModelRead } from '../models/SubscriptionViewModelRead';

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

  onReconnected(callback: () => void): void;
}
