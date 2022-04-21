import { HubConnection } from '@microsoft/signalr';
import { IRealTimeConnection } from '../interfaces/IRealTimeConnection.js';
import { IModelSateResult } from '../models/ModelStateResult.js';
import { RealTimeEvent } from '../models/RealTimeEvent.js';
import { IResult } from '../models/Result.js';
import { ISubscriptionViewModelCreate } from '../models/SubscriptionViewModelCreate.js';
import { ISubscriptionViewModelRead } from '../models/SubscriptionViewModelRead.js';

export class HubConnectionRealTimeConnection implements IRealTimeConnection {
  private _hubConnection: HubConnection;

  constructor(hubConnection: HubConnection) {
    this._hubConnection = hubConnection;
  }

  startAsync(): Promise<void> {
    return this._hubConnection.start();
  }

  stopAsync(): Promise<void> {
    return this._hubConnection.stop();
  }

  registerForEventAsync(
    request: ISubscriptionViewModelCreate
  ): Promise<IModelSateResult<ISubscriptionViewModelRead>> {
    return this._hubConnection.invoke<
      IModelSateResult<ISubscriptionViewModelRead>
    >('registerForEvents', request);
  }

  unregisterForEventAsync(
    subscriptionId: string
  ): Promise<IResult<ISubscriptionViewModelRead>> {
    return this._hubConnection.invoke<IResult<ISubscriptionViewModelRead>>(
      'unregisterEventSubscription',
      subscriptionId
    );
  }

  addEventHandler<T>(
    eventName: string,
    callback: (event: RealTimeEvent<T>) => void
  ): void {
    this._hubConnection.on(eventName, callback);
  }

  removeEventHandler(eventName: string): void {
    this._hubConnection.off(eventName);
  }

  onreconnected(callback: () => void): void {
    this._hubConnection.onreconnected(callback);
  }
}
