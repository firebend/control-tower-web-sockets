/**
 * Encapsulates values an event subscription request.
 */
export interface ISubscriptionViewModelCreate {
  /**
   * The trigger
   */
  trigger: string;

  /**
   * The events name
   */
  eventName: string;

  /**
   * An optional filter to limit events by.
   */
  filter: string | undefined;
}
