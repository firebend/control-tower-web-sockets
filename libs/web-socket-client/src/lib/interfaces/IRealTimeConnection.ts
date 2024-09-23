import { IModelSateResult } from '../models/ModelStateResult';
import { RealTimeEvent } from '../models/RealTimeEvent';
import { IResult } from '../models/Result';
import { ISubscriptionViewModelCreate } from '../models/SubscriptionViewModelCreate';
import { ISubscriptionViewModelRead } from '../models/SubscriptionViewModelRead';

/**
 * Encapsulates logic about a real time connection
 */
export interface IRealTimeConnection {
  /**
   * Start the web socket connection
   */
  startAsync(): Promise<void>;

  /**
   * Stop the web socket connection
   */
  stopAsync(): Promise<void>;

  /**
   * Sends a request to register for a given event
   * @param request a model containing the request data
   */
  registerForEventAsync(
    request: ISubscriptionViewModelCreate
  ): Promise<IModelSateResult<ISubscriptionViewModelRead>>;

  /**
   * Sends a request to unregister an event.
   * @param subscriptionId The id corresponding to a previously registered subscription
   */
  unregisterForEventAsync(
    subscriptionId: string
  ): Promise<IResult<ISubscriptionViewModelRead>>;

  /**
   * Adds an event handler for when a given event name is triggered.
   * @param eventName The event name
   * @param callback The callback
   */
  addEventHandler<T>(
    eventName: string,
    callback: (event: RealTimeEvent<T>) => void
  ): void;

  /**
   * Removes an event handler
   * @param eventName The event name
   */
  removeEventHandler(eventName: string): void;

  /**
   * Configures a callback for when a connection is lost and then reestablished.
   * @param callback The callback
   */
  onReconnected(callback: () => void): void;
}
